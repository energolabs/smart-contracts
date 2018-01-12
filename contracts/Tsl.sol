pragma solidity ^0.4.15;
import "../contracts/HumanStandardToken.sol";

contract Tsl is HumanStandardToken
{
    function Tsl(uint256 _initialAmount,
        string _tokenName,
        uint8 _decimalUnits,
        string _tokenSymbol)
        HumanStandardToken(_initialAmount,
            _tokenName,
            _decimalUnits,
            _tokenSymbol
        )
    {}
}
