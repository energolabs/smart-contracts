pragma solidity ^0.4.15;
import './Watt.sol';

contract Currency is Watt{
    function Currency(string _tokenName,
            uint8 _decimalUnits,
            string _tokenSymbol,
            string _region) Watt(_tokenName, _decimalUnits, _tokenSymbol, _region) {
        }
}
