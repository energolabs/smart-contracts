pragma solidity >= 0.4.0 < 0.7.0;

import './Owner.sol';
import './SafeMath.sol';
import './StandardToken.sol';
import './Secp256k1.sol';

contract ExchangeDeposit is SafeMath, Owner, Secp256k1Curve{
  mapping (address => mapping (address => uint)) public tokens; //mapping of token addresses to mapping of account balances (token=0 means Ether)
  mapping (address => mapping (bytes32 => bool)) public orders; //mapping of user accounts to mapping of order hashes to booleans (true = submitted by user, equivalent to offchain signature)
  mapping (address => mapping (bytes32 => uint)) public orderFills; //mapping of user accounts to mapping of order hashes to uints (amount of order that has been filled)

  event Order(address tokenGet, uint amountGet, address tokenGive, uint amountGive, uint expires, uint nonce, address user);
  event Cancel(address tokenGet, uint amountGet, address tokenGive, uint amountGive, uint expires, uint nonce, address user);
  event Trade(address tokenGet, uint amountGet, address tokenGive, uint amountGive, address get, address give);
  event Deposit(address token, address user, uint amount, uint balance);
  event Withdraw(address token, address user, uint amount, uint balance);

  constructor () public {
  }

  function() external {
    revert();
  }

    function depositToken(address token, uint amount) public {
        //remember to call Token(address).approve(this, amount) or this contract will not be able to do the transfer on your behalf.
        if (token==address(0)) revert();
        if (!Token(token).transferFrom(msg.sender, address(this), amount)) revert();
        tokens[token][msg.sender] = safeAdd(tokens[token][msg.sender], amount);
        emit Deposit(token, msg.sender, amount, tokens[token][msg.sender]);
      }

      function withdrawToken(address token, uint amount) public {
        if (token == address(0)) revert();
        if (tokens[token][msg.sender] < amount) revert();
        tokens[token][msg.sender] = safeSub(tokens[token][msg.sender], amount);
        if (!Token(token).transfer(msg.sender, amount)) revert();
        emit Withdraw(token, msg.sender, amount, tokens[token][msg.sender]);
    }

  function order(address tokenGet, uint amountGet, address tokenGive, uint amountGive, uint expires, uint nonce) public {
    bytes32 hash = sha256(abi.encodePacked(this, tokenGet, amountGet, tokenGive, amountGive, expires, nonce));
    orders[msg.sender][hash] = true;
    emit Order(tokenGet, amountGet, tokenGive, amountGive, expires, nonce, msg.sender);
  }

  function trade(address tokenGet, uint amountGet, address tokenGive, uint amountGive, uint expires, uint nonce, uint amount, uint[2] memory P, uint[2] memory rs) public {
    if (tokenGet == address(0) || tokenGive == address(0)) revert();
    //amount is in amountGet terms
    bytes32 hash = sha256(abi.encodePacked(this, tokenGet, amountGet, tokenGive, amountGive, expires, nonce));
    bytes memory pubkey = new bytes(33);
    pubkey[0] = byte(0x02);
    for (uint8 i=0;i<32;i++)
    {
        pubkey[i+1] = bytes32(P[0])[i];
    }
    address user = address(ripemd160(abi.encodePacked(sha256(pubkey))));
    if (!(
      (orders[user][hash] || validateSignature(hash, rs, P)) &&
      block.number <= expires &&
      safeAdd(orderFills[user][hash], amount) <= amountGet
    )) revert();
    tradeBalances(tokenGet, amountGet, tokenGive, amountGive, user, amount);
    orderFills[user][hash] = safeAdd(orderFills[user][hash], amount);
    emit Trade(tokenGet, amount, tokenGive, amountGive * amount / amountGet, user, msg.sender);
  }

  function tradeBalances(address tokenGet, uint amountGet, address tokenGive, uint amountGive, address user, uint amount) private {
    tokens[tokenGet][msg.sender] = safeSub(tokens[tokenGet][msg.sender], amount);
    tokens[tokenGet][user] = safeAdd(tokens[tokenGet][user], amount);
    tokens[tokenGive][user] = safeSub(tokens[tokenGive][user], safeMul(amountGive, amount) / amountGet);
    tokens[tokenGive][msg.sender] = safeAdd(tokens[tokenGive][msg.sender], safeMul(amountGive, amount) / amountGet);
  }

  function testTrade(address tokenGet, uint amountGet, address tokenGive, uint amountGive, uint expires, uint nonce, uint[2] memory P, uint[2] memory rs, uint amount, address sender) public returns(bool) {
    if (!(
      tokens[tokenGet][sender] >= amount &&
      availableVolume(tokenGet, amountGet, tokenGive, amountGive, expires, nonce, P, rs) >= amount
    )) return false;
    return true;
  }

  function availableVolume(address tokenGet, uint amountGet, address tokenGive, uint amountGive, uint expires, uint nonce, uint[2] memory P, uint[2] memory rs) public returns(uint) {
    bytes32 hash = sha256(abi.encodePacked(this, tokenGet, amountGet, tokenGive, amountGive, expires, nonce));
    bytes memory pubkey = new bytes(33);
    pubkey[0] = byte(0x02);
    for (uint8 i=0;i<32;i++)
    {
        pubkey[i+1] = bytes32(P[0])[i];
    }
    address user = address(ripemd160(abi.encodePacked(sha256(pubkey))));
    if (!(
      (orders[user][hash] || validateSignature(hash, rs, P)) &&
      block.number <= expires
    )) return 0;
    //uint available1 = safeSub(amountGet, orderFills[user][hash]);
    uint available2 = safeMul(tokens[tokenGive][user], amountGet) / amountGive;
    //if (available1<available2) return available1;
    if (safeSub(amountGet, orderFills[user][hash])<available2) return safeSub(amountGet, orderFills[user][hash]);
    return available2;
  }

  function amountFilled(address tokenGet, uint amountGet, address tokenGive, uint amountGive, uint expires, uint nonce, address user, uint8 v, bytes32 r, bytes32 s) public  view returns(uint) {
    bytes32 hash = sha256(abi.encodePacked(this, tokenGet, amountGet, tokenGive, amountGive, expires, nonce));
    return orderFills[user][hash];
  }

  function cancelOrder(address tokenGet, uint amountGet, address tokenGive, uint amountGive, uint expires, uint nonce, uint[2] memory P, uint[2] memory rs) public {
    bytes32 hash = sha256(abi.encodePacked(this, tokenGet, amountGet, tokenGive, amountGive, expires, nonce));
    if (!(orders[msg.sender][hash] || validateSignature(hash, rs, P))) revert();
    bytes memory pubkey = new bytes(33);
    pubkey[0] = byte(0x02);
    for (uint8 i=0;i<32;i++)
    {
      pubkey[i+1] = bytes32(P[0])[i];
    }
    address user = address(ripemd160(abi.encodePacked(sha256(pubkey))));
    orderFills[user][hash] = amountGet;
    emit Cancel(tokenGet, amountGet, tokenGive, amountGive, expires, nonce, user);
  }
}
