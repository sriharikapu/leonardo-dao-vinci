pragma solidity ^0.5.0;

import "zos-lib/contracts/Initializable.sol";
import "openzeppelin-eth/contracts/ownership/Ownable.sol";

contract DaoVinci is Initializable, Ownable {

    event RewardDistributed(address payee, uint amount);
    event BalanceWithdrawn(address payee, uint amount);

    mapping(address => uint) public balances;

    function initialize() initializer public {
        Ownable.initialize(msg.sender);
    }

    function distributeRewards(address[] memory _payees, uint[] memory _amounts) public payable onlyOwner {
        require(_payees.length == _amounts.length);
        uint soldPrice = msg.value;
        uint totalRewards;
        for (uint i = 0; i < _payees.length; i++) {
            address _payee = _payees[i];
            uint _amount = _amounts[i];
            bool balanceIncreased = _increaseBalance(_payee, _amount);
            if (balanceIncreased) {
                totalRewards = totalRewards + _amount;
                emit RewardDistributed(_payee, _amount);
            }
        }
        require(soldPrice >= totalRewards);
    }

    function withdraw() public {
        uint balance = balances[msg.sender];
        balances[msg.sender] = 0;
        msg.sender.transfer(balance);
    }

    function withdrawOnBehalf(address payable usersAddress) public onlyOwner {
        uint balance = balances[usersAddress];
        balances[usersAddress] = 0;
        usersAddress.transfer(balance);
        emit BalanceWithdrawn(usersAddress, balance);
    }

    function _increaseBalance(address payee, uint amount) private returns(bool) {
        if (amount > 0) {
            balances[payee] = balances[payee] + amount;
            return true;
        }
        return false;
    }
}
