pragma solidity ^0.4.15;


contract Owner {
    address public owner;
    function Owner() {
        owner = msg.sender;
    }

    modifier onlyOwner {
        if (msg.sender != owner) revert();
        _;
    }

    function changeOwner(address _owner) onlyOwner {
        owner = _owner;
    }
}
