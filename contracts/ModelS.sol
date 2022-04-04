pragma solidity >= 0.4.0 < 0.7.0;
import './SafeMath.sol';
import './Owner.sol';
import './Watt.sol';
import './Token.sol';


contract ModelS is SafeMath , Owner {
	address public watt;
    address public tsl;
    address public fund;
    uint public oneWatt;
    uint allowanceLimit;
    uint public lastBlock;
    uint public interval;
    uint public tslPerWatt;
    address[] public accounts;
    event Register(address _address, uint _id);
    event Tick(address indexed _sender, uint256 _amount, uint256 _value);
    event Interval(address _address, uint _interval);
    event TslPerWatt(address _address, uint _tslPerWatt);
    
    constructor(address _watt, address _tsl, address _fund, uint _allowanceLimit, uint _interval, uint _tslPerWatt) public {
        oneWatt = 1;
        uint d = Token(_watt).decimals();
        for (uint8 i=0;i<d;++i) oneWatt *= 10;
        tsl = _tsl;
        watt = _watt;
        fund = _fund;
        allowanceLimit = _allowanceLimit;
        lastBlock = block.timestamp;
        interval = _interval;
        tslPerWatt = _tslPerWatt;
    }

    function setInterval(uint _interval) public onlyOwner {
        interval = _interval;
        emit Interval(msg.sender, _interval);
    }

    function setTslPerWatt(uint _tslPerWatt) public onlyOwner {
        tslPerWatt = _tslPerWatt;
        emit TslPerWatt(msg.sender, _tslPerWatt);
    }

    function register(address _account) public {
        if (Token(tsl).allowance(_account, address(this)) < allowanceLimit) revert();
        accounts.push(_account);
        emit Register(_account, accounts.length);
    }

    function tick() public onlyOwner {
        if ((block.timestamp - lastBlock) < interval) revert();
        uint totalValue = 0;
        for (uint i=0; i < accounts.length; ++i) {
            uint256 wattBalance = Token(watt).balanceOf(accounts[i]);
            if (wattBalance == 0) continue;
            uint256 amount = safeMul(block.timestamp - lastBlock, safeMul(wattBalance, tslPerWatt)) / safeMul(oneWatt, interval);
            uint256 tslBalance = Token(tsl).balanceOf(accounts[i]);
            if (tslBalance < amount) amount = tslBalance;
            if (!Token(tsl).transferFrom(accounts[i], fund, amount) ) continue;
            totalValue += amount;
        }
        lastBlock = block.timestamp;
        emit Tick(msg.sender, accounts.length, totalValue);
    }
}
