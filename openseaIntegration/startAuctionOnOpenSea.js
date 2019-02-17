const opensea = require('opensea-js');
const OpenSeaPort = opensea.OpenSeaPort;
const Network = opensea.Network;

const MnemonicWalletSubprovider = require('@0x/subproviders').MnemonicWalletSubprovider;
const RPCSubprovider = require('web3-provider-engine/subproviders/rpc');
const Web3ProviderEngine = require('web3-provider-engine');
const MNEMONIC = process.env.MNEMONIC;
const INFURA_KEY = process.env.INFURA_KEY;
const NFT_CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS;
const OWNER_ADDRESS = process.env.OWNER_ADDRESS;
const NETWORK = process.env.NETWORK;

if (!MNEMONIC || !INFURA_KEY || !NETWORK || !OWNER_ADDRESS || !NFT_CONTRACT_ADDRESS) {
    console.error("Please set a mnemonic, infura key, owner, network, API key, and factory contract address.");
    return
}
const BASE_DERIVATION_PATH = `44'/60'/0'/0`;
const mnemonicWalletSubprovider = new MnemonicWalletSubprovider({ mnemonic: MNEMONIC, baseDerivationPath: BASE_DERIVATION_PATH});
const infuraRpcSubprovider = new RPCSubprovider({
    rpcUrl: 'https://' + NETWORK + '.infura.io/' + INFURA_KEY,
});

const providerEngine = new Web3ProviderEngine();
providerEngine.addProvider(mnemonicWalletSubprovider);
providerEngine.addProvider(infuraRpcSubprovider);
providerEngine.start();

const seaport = new OpenSeaPort(providerEngine, {
    networkName: Network.Rinkeby
}, (arg) => console.log(arg));


class OpenSeaAuction {

    static async auction(tokenId) {
        const expirationTime = (Date.now() / 1000 + 60 * 60 * 24);
        console.log('about to start the auction');
        try{
            // If `endAmount` is specified, the order will decline in value to that amount until `expirationTime`. Otherwise, it's a fixed-price order.
            let response = await seaport.createSellOrder({ tokenId: tokenId, tokenAddress: NFT_CONTRACT_ADDRESS, accountAddress: OWNER_ADDRESS, startAmount: 0.1, endAmount: 0.1 });
            // TODO: Incremental prices example.
            console.log('response', response);
        } catch (e) {
            console.log(e)
        }

    }
}

module.exports = OpenSeaAuction;
