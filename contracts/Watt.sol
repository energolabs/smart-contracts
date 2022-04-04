pragma solidity >= 0.4.0 < 0.7.0;
import './HumanStandardToken.sol';
import './SafeMath.sol';
import './Owner.sol';


contract Watt is HumanStandardToken, SafeMath, Owner{
    string public region;
    event Increase(address indexed _owner, address indexed _to, uint256 _value);
    event Decrease(address indexed _owner, address indexed _from, uint256 _value);
    constructor(string memory _tokenName,
        uint8 _decimalUnits, 
        string memory _tokenSymbol,
        string memory _region) HumanStandardToken(0, _tokenName, _decimalUnits, _tokenSymbol) public {
        region = _region;
    }

    function increaseSupply(uint value, address to) onlyOwner public returns (bool) {
      total_supply = safeAdd(total_supply, value);
      balances[to] = safeAdd(balances[to], value);
      emit Increase(msg.sender, to, value);
      return true;
    }
    
    function decreaseSupply(uint value, address from) onlyOwner public returns (bool) {
      balances[from] = safeSub(balances[from], value);
      total_supply = safeSub(total_supply, value);  
      emit Decrease(msg.sender, from, value);
      return true;
    }

}
