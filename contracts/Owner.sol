pragma solidity >= 0.4.0 < 0.7.0;


contract Owner {
    address public owner;
    constructor() public {
        owner = msg.sender;
    }

    modifier onlyOwner {
        if (msg.sender != owner) revert();
        _;
    }

    function changeOwner(address _owner) public onlyOwner {
        owner = _owner;
    }
}
