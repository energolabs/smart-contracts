pragma solidity >= 0.4.0 < 0.7.0;
import "../contracts/HumanStandardToken.sol";

contract Tsl is HumanStandardToken
{
    constructor(uint256 _initialAmount,
        string memory _tokenName,
        uint8 _decimalUnits,
        string memory _tokenSymbol)
        HumanStandardToken(_initialAmount,
            _tokenName,
            _decimalUnits,
            _tokenSymbol
        ) public
    {}
}
