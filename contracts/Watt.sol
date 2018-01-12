pragma solidity ^0.4.15;
import './HumanStandardToken.sol';
import './SafeMath.sol';
import './Owner.sol';


contract Watt is HumanStandardToken, SafeMath, Owner{
    string public region;
    event Increase(address indexed _owner, address indexed _to, uint256 _value);
    event Decrease(address indexed _owner, address indexed _from, uint256 _value);
    function Watt(string _tokenName,
        uint8 _decimalUnits, 
        string _tokenSymbol,
        string _region) HumanStandardToken(0, _tokenName, _decimalUnits, _tokenSymbol) {
        region = _region;
    }

    function increaseSupply(uint value, address to) onlyOwner public returns (bool) {
      totalSupply = safeAdd(totalSupply, value);
      balances[to] = safeAdd(balances[to], value);
      Increase(msg.sender, to, value);
      return true;
    }
    
    function decreaseSupply(uint value, address from) onlyOwner public returns (bool) {
      balances[from] = safeSub(balances[from], value);
      totalSupply = safeSub(totalSupply, value);  
      Decrease(msg.sender, from, value);
      return true;
    }

}
