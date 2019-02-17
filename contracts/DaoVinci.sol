pragma solidity ^0.5.0;

import "zos-lib/contracts/Initializable.sol";
import "openzeppelin-eth/contracts/ownership/Ownable.sol";

contract DaoVinci is Initializable, Ownable {

    mapping(address => uint) public balances;

    function initialize(uint num) initializer public {
        Ownable.initialize(msg.sender);
    }

    function withdraw() public {
        uint balance = balances[msg.sender];
        balances[msg.sender] = 0;
        msg.sender.transfer(balance);
    }

    function withdrawOnBehalf(address usersAddress) public onlyOwner {
        uint balance = balances[usersAddress];
        balances[usersAddress] = 0;
        usersAddress.transfer(balance);
    }

    // function _increaseBalance
}
