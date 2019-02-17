package main

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"
)

type voteMessage struct {
	UserAddress string `json:"user_address"`
	Iteration   int    `json:"iteration"`
	Images      []int  `json:"images"`
}

func main() {
	v := &voteMessage{
		UserAddress: "0x931d387731bbbc988b312206c74f77d004d6b84b",
		Iteration:   1,
		Images:      []int{2, 5, 6, 7, 8},
	}
	data, err := json.Marshal(v)
	if err != nil {
		log.Fatal(err)
	}
	resp, err := http.Post("http://4ca9284e.ngrok.io/vote", "", bytes.NewReader(data))
	if err != nil {
		log.Fatal(err)
	}
	println(resp.Status)

	//fmt.Printf("%s\n", string(data))
}
