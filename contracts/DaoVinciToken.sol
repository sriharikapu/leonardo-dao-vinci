pragma solidity ^0.5.0;

import "openzeppelin-eth/contracts/token/ERC721/ERC721MetadataMintable.sol";
import "./ProxyRegistry.sol";

contract DaoVinciToken is ERC721MetadataMintable {
    // Used
    address proxyRegistryAddress;

    // Zepkit has a pattern of initializing instead of constructing instance
    function initialize(string memory name, string memory symbol, address _proxyRegistryAddress) initializer public {
        proxyRegistryAddress = _proxyRegistryAddress;
        ERC721.initialize();
        ERC721Metadata.initialize(name, symbol);
        ERC721MetadataMintable.initialize(msg.sender);
    }

  /**
   * Override isApprovedForAll to whitelist user's OpenSea proxy accounts to enable gas-less listings.
   * https://docs.opensea.io/docs/1-structuring-your-smart-contract
   */
    function isApprovedForAll(
        address owner,
        address operator
    )
    public
    view
    returns (bool)
    {
        // Whitelist OpenSea proxy contract for easy trading.
        ProxyRegistry proxyRegistry = ProxyRegistry(proxyRegistryAddress);
        if (address(proxyRegistry.proxies(owner)) == operator) {
            return true;
        }

        return super.isApprovedForAll(owner, operator);
    }
}
