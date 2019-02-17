package main

import (
	"context"
	"crypto/ecdsa"
	"crypto/rand"
	"encoding/json"
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	"math/big"
	"net/http"
	"net/url"
	"os"
	"sort"
	"strconv"
	"strings"
	"sync"

	"github.com/casinocats/leonardo-dao-vinci/server/dvtoken"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/moby/moby/pkg/namesgenerator"
)

var (
	// This will be modified by multiple routines
	iteration = atomicInt{
		val: 0,
		mu:  sync.RWMutex{},
	}

	// maps image number to a set of user adresses that voted for it
	votes                   = make(map[int]map[string]struct{})
	port                    = flag.String("port", "8080", "The port that the server will bind on")
	imageStore              = &diskStore{"images"}
	metaStore               = &diskStore{"metadata"}
	mintedImageStore        = &diskStore{"minted_images"}
	imageCount              = 10
	client                  *ethclient.Client
	privateKey              *ecdsa.PrivateKey
	generatorAccountAddress common.Address
	nonce                   uint64
	lastBlock               uint64
)

type voteMessage struct {
	UserAddress string `json:"user_address"`
	Iteration   int    `json:"iteration"`
	Images      []int  `json:"images"`
}

type iterationMessage struct {
	Iteration string `json:"iteration"`
}

func main() {
	flag.Parse()

	content, err := ioutil.ReadFile("iteration")
	if err == nil {
		num, err := strconv.Atoi(string(content))
		if err != nil {
			log.Fatalf("expecting integer defined in iteration file, instead got %s", string(content))
		}
		iteration = atomicInt{
			val: num,
			mu:  sync.RWMutex{},
		}

	}

	content, err = ioutil.ReadFile("lastBlock")
	if err == nil {
		var err error
		lastBlock, err = strconv.ParseUint(string(content), 10, 64)
		if err != nil {
			log.Fatalf("expecting integer defined in lastBlock file, instead got %s", string(content))
		}

	}

	setupEth()

	go generateArt()

	imageHandler := http.StripPrefix("/images/", http.FileServer(http.Dir("images")))
	imageHandlerFunc := func(w http.ResponseWriter, r *http.Request) {
		imageHandler.ServeHTTP(w, r)
	}

	mintedImageHandler := http.StripPrefix("/minted_images/", http.FileServer(http.Dir("minted_images")))
	mintedImageHandlerFunc := func(w http.ResponseWriter, r *http.Request) {
		mintedImageHandler.ServeHTTP(w, r)
	}

	metadataHandler := http.StripPrefix("/metadata/", http.FileServer(http.Dir("metadata")))
	metadataHandlerFunc := func(w http.ResponseWriter, r *http.Request) {
		metadataHandler.ServeHTTP(w, r)
	}

	http.HandleFunc("/images/", addCors(imageHandlerFunc))
	http.HandleFunc("/minted_images/", addCors(mintedImageHandlerFunc))
	http.HandleFunc("/metadata/", addCors(metadataHandlerFunc))
	http.HandleFunc("/iteration", addCors(handleIteration))
	http.HandleFunc("/vote", addCors(handleVotes))

	bindAddress := fmt.Sprintf("localhost:%s", *port)
	fmt.Printf("Current iteration: %d\n", iteration)
	fmt.Printf("Serving images at %s/images/<iteration>/<image>\n", bindAddress)
	fmt.Printf("Serving iteration at %s/iteration\n", bindAddress)
	fmt.Printf("Accepting votes at %s/vote\n", bindAddress)
	log.Fatal(http.ListenAndServe(bindAddress, nil))
}

// Runs in perpetuity
func generateArt() {
	for {
		println()
		for im := 0; im < imageCount; im++ {
			fmt.Printf("Generating image %d\n", im+1)
		}

		iteration.Inc()
		it := iteration.Get()
		fmt.Printf("Iteration: %d\n", it)

		err := ioutil.WriteFile("iteration", []byte(strconv.Itoa(it)), os.ModePerm)
		if err != nil {
			fmt.Printf("could not persist iteration file: %v", err)
		}

		err = os.Chdir("images")
		if err != nil {
			fmt.Printf("could not cd to images: %v", err)
		}
		err = os.Symlink("test_images", fmt.Sprintf("%d", it))
		if err != nil {
			fmt.Printf("could not symlink test_images: %v", err)
		}
		err = os.Chdir("..")
		if err != nil {
			fmt.Printf("could not cd to .. : %v", err)
		}
		fmt.Printf("Press enter to move to the next iteration\n")
		// hard code minting
		fmt.Scanln()
		// Check for payments to this account

		addressString := generatorAccountAddress.String()
		trs, err := GetTransactions(addressString, lastBlock)
		if err != nil {
			fmt.Printf("failed to retrieve transactions from infura: %v\n", err)
		}

		for _, t := range trs.Result {

			// Update our last block
			// TODO persist in file
			bn, err := strconv.ParseUint(t.BlockNumber, 10, 64)
			if err != nil {
				fmt.Printf("got bad block number from infura: %s\n", t.BlockNumber)
				continue
			}

			lastBlock = bn

			err = ioutil.WriteFile("lastBlock", []byte(t.BlockNumber), os.ModePerm)
			if err != nil {
				fmt.Printf("could not persist lastBlock file: %v", err)
			}

			// look for transactions into our address
			if t.To == addressString {
				fmt.Printf("transaction to us from %s\n", t.From)
			} else {
				fmt.Printf("from us to %s isError %s receiptStatus %s\n", t.To, t.IsError, t.TxreceiptStatus)
			}
		}

		fmt.Printf("lastBlock %d\n", lastBlock)

		// Calculate winners
		imageIDs := make([]int, imageCount)
		// generate the image ids
		for i, _ := range imageIDs {
			imageIDs[i] = i + 1
		}

		// sort imageIDs
		sort.Slice(imageIDs, func(i, j int) bool {
			// sort descending
			return len(votes[i]) > len(votes[j])
		},
		)
		for i := 0; i < 3; i++ {
			mintToken(it, imageIDs[i])
		}
	}

}

type Transactions struct {
	Status  string `json:"status"`
	Message string `json:"message"`
	Result  []struct {
		BlockNumber       string `json:"blockNumber"`
		TimeStamp         string `json:"timeStamp"`
		Hash              string `json:"hash"`
		Nonce             string `json:"nonce"`
		BlockHash         string `json:"blockHash"`
		TransactionIndex  string `json:"transactionIndex"`
		From              string `json:"from"`
		To                string `json:"to"`
		Value             string `json:"value"`
		Gas               string `json:"gas"`
		GasPrice          string `json:"gasPrice"`
		IsError           string `json:"isError"`
		TxreceiptStatus   string `json:"txreceipt_status"`
		Input             string `json:"input"`
		ContractAddress   string `json:"contractAddress"`
		CumulativeGasUsed string `json:"cumulativeGasUsed"`
		GasUsed           string `json:"gasUsed"`
		Confirmations     string `json:"confirmations"`
	} `json:"result"`
}

func GetTransactions(address string, startBlock uint64) (*Transactions, error) {
	//"http://api-rinkeby.etherscan.io/api?module=account&action=txlist&address=0xf0F2077bC2361AF6Ae805609111c2b7F1594A74b&startblock=0&endblock=99999999&sort=desc&apikey=YourApiKeyToken"

	v := url.Values{}
	v.Set("module", "account")
	v.Add("action", "txlist")
	v.Add("address", address)
	v.Add("startblock", strconv.FormatInt(int64(startBlock), 10))
	v.Add("endblock", "99999999")
	v.Add("sort", "asc")
	v.Add("apikey", "YourApiKeyToken")
	url := "http://api-rinkeby.etherscan.io/api?" + v.Encode()
	println(url)
	resp, err := http.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to collect transactions: %v", err)
	}
	defer resp.Body.Close()
	data, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read transactions response body: %v", err)
	}

	trs := &Transactions{}
	err = json.Unmarshal(data, trs)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal transactions response body: %v", err)
	}

	return trs, nil
}
func addCors(handleFunc func(w http.ResponseWriter, r *http.Request)) func(http.ResponseWriter, *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		handleFunc(w, r)
	}
}

func handleIteration(w http.ResponseWriter, r *http.Request) {
	i := iterationMessage{
		Iteration: strconv.Itoa(iteration.Get()),
	}
	data, err := json.Marshal(i)
	if err != nil {
		http.Error(w, "Could not marshal iteration", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(data)
}

func handleVotes(w http.ResponseWriter, r *http.Request) {
	content, err := ioutil.ReadAll(r.Body)
	fmt.Printf("content: %s\n", string(content))
	v := &voteMessage{}
	err = json.Unmarshal(content, v)
	if err != nil {
		errmsg := "Could not unmarshal votes message"
		fmt.Printf("%s\n", errmsg)
		http.Error(w, errmsg, http.StatusBadRequest)
		fmt.Printf("offending content: %s\n", string(content))
		return
	}

	// Verify that this user has not voted so far in this iteration
	for _, voters := range votes {
		_, ok := voters[v.UserAddress]
		if ok {
			errmsg := fmt.Sprintf("User %q has already voted in this iteration", v.UserAddress)
			fmt.Printf("%s\n", errmsg)
			http.Error(w, errmsg, http.StatusBadRequest)
			return
		}
	}

	// Add the votes for this user
	for _, i := range v.Images {
		voters, ok := votes[i]
		if !ok {
			voters = make(map[string]struct{})
			votes[i] = voters
		}
		voters[v.UserAddress] = struct{}{}
	}

	fmt.Printf("Vote Summary:")
	for i := 0; i < imageCount; i++ {
		imNum := i + 1
		fmt.Printf("\nImage %d: %d", imNum, len(votes[imNum]))

	}
	w.WriteHeader(http.StatusOK)
}

type atomicInt struct {
	mu  sync.RWMutex
	val int
}

func (s *atomicInt) Get() int {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.val
}

func (s *atomicInt) Inc() {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.val++
}

func setupEth() {

	var err error
	client, err = ethclient.Dial("https://rinkeby.infura.io")
	if err != nil {
		log.Fatal(err)
	}

	privateKey, err = crypto.HexToECDSA("d68790fcaaaed828a6bc2f4ae45764c25e1d193936202bf0039ef8f936d2127f")
	if err != nil {
		log.Fatal(err)
	}

	publicKey := privateKey.Public()
	publicKeyECDSA, ok := publicKey.(*ecdsa.PublicKey)
	if !ok {
		log.Fatal("error casting public key to ECDSA")
	}

	// my  contractAddress
	generatorAccountAddress = crypto.PubkeyToAddress(*publicKeyECDSA)
	nonce, err = client.PendingNonceAt(context.Background(), generatorAccountAddress)
	if err != nil {
		log.Fatal(err)
	}
}

// mintTokens mints a token for the provided image id and iteration and then
// puts it up for sale on opensea.
func mintToken(iteration, imageNum int) {

	gasPrice, err := client.SuggestGasPrice(context.Background())
	if err != nil {
		log.Fatalf("problem getting suggested gas price: %v", err)
	}

	auth := bind.NewKeyedTransactor(privateKey)
	auth.Nonce = big.NewInt(int64(nonce))
	auth.Value = big.NewInt(0)     // in wei
	auth.GasLimit = uint64(300000) // in units
	auth.GasPrice = gasPrice
	// contract destination contractAddress
	contractAddress := common.HexToAddress("0x100a1698c3fbb4a1f3b2ed74b5e39741ad233e89")
	instance, err := dvtoken.NewDaoVinciToken(contractAddress, client)
	if err != nil {
		log.Fatalf("error creating new DaoVinciToken: %v", err)
	}

	tokenID := &big.Int{}
	idBytes := make([]byte, 32)
	rand.Read(idBytes)
	if err != nil {
		log.Fatalf("error reading from random: %v", err)
	}

	tokenID.SetBytes(idBytes)

	tokenString := fmt.Sprintf("%X", idBytes)
	metadataURI := "http://daovinci.ngrok.io/metadata/" + tokenString

	a := []attribute{
		{
			TraitType: "artist",
			Value:     "Leonardo Dao Vinci",
		},
		{
			DisplayType: "number",
			TraitType:   "prints",
			Value:       1,
		},
		{
			DisplayType: "number",
			TraitType:   "iteration",
			Value:       2,
		},
	}

	name := namesgenerator.GetRandomName(0)
	parts := strings.Split(name, "_")
	for i, p := range parts {
		parts[i] = strings.Title(p)
	}
	name = strings.Join(parts, " ")

	m := metadata{
		Attributes:  a,
		Description: "Generated AI art",
		ExternalUrl: "https://rinkeby.opensea.io/assets/0x100a1698c3fbb4a1f3b2ed74b5e39741ad233e89/" + tokenString,
		Image:       "http://daovinci.ngrok.io/minted_images/" + tokenString + ".png",
		Name:        name,
	}
	data, err := json.Marshal(m)
	if err != nil {
		log.Fatal(err)
	}

	metaStore.Put(tokenString, data)

	mintedImageStore.Put(tokenString+".png", imageStore.Get(fmt.Sprintf("%d/%d.png", iteration, imageNum)))

	tx, err := instance.MintWithTokenURI(auth, generatorAccountAddress, tokenID, metadataURI)
	if err != nil {
		log.Fatalf("error minting new DaoVinciToken: %v", err)
	}
	nonce++
	fmt.Printf("tx sent: %s\n", tx.Hash().Hex()) // tx sent: 0x8d490e535678e9a24360e955d75b27ad307bdfb97a1dca51d0f3035dcee3e870

	// Post the token to opensea

	_, err = http.Get("http://localhost:3001/auction/token/" + tokenString)
	if err != nil {
		log.Fatalf("error putting new token on opensea: %v", err)
	}

}

type metadata struct {
	Description string      `json:"description"`
	ExternalUrl string      `json:"external_url"`
	Image       string      `json:"image"`
	Name        string      `json:"name"`
	Attributes  []attribute `json:"attributes"`
}

type attribute struct {
	TraitType   string      `json:"trait_type"`
	DisplayType string      `json:"display_type,omitempty"`
	Value       interface{} `json:"value"`
}

/*
"attributes": [
    {
      "trait_type": "artist",
      "value": "Leonardo Dao Vinci"
    },
    {
      "display_type": "number",
      "trait_type": "prints",
      "value": 1
    }
    {
      "display_type": "number",
      "trait_type": "generation",
      "value": 2
    }
  ]
*/

type diskStore struct {
	dir string
}

func (ms *diskStore) Get(token string) []byte {
	data, err := ioutil.ReadFile(ms.dir + "/" + token)
	if err != nil {
		fmt.Printf("%v\n", err)
		return nil
	}
	return data
}

func (ms *diskStore) Put(token string, data []byte) {
	err := ioutil.WriteFile(ms.dir+"/"+token, data, os.ModePerm)
	if err != nil {
		fmt.Printf("%v\n", err)
	}

}
