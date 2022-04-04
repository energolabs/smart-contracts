pragma solidity >= 0.4.0 < 0.7.0;
import './Watt.sol';

contract Currency is Watt{
    constructor(string memory _tokenName,
            uint8 _decimalUnits,
            string memory _tokenSymbol,
            string memory _region) Watt(_tokenName, _decimalUnits, _tokenSymbol, _region) public {
        }
}
