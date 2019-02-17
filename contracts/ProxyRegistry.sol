pragma solidity ^0.5.0;

import "./OwnableDelegateProxy.sol";

contract ProxyRegistry {
    mapping(address => OwnableDelegateProxy) public proxies;
}
