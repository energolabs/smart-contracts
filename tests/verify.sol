pragma solidity ^0.4.15;
import 'Secp256k1.sol';

contract DependentContract {
    event Debug(address _sender);
    function realSender() returns (address) {
        Debug(msg.sender);
        return msg.sender;
    }
}

contract Example is Secp256k1Curve {
    mapping (address => mapping (bytes32 => bool)) public orders;
    event Trade(address _address);
    function testRecovery(bytes p, bytes32 h, uint8 v, bytes32 r, bytes32 s) constant returns (bytes) {
        //return address(ripemd160(sha256(p)));
        //address addr = ecrecover(prefixedHash, v, r, s);
        return p;
    }

    function getTrade(address _address, bytes32 h) returns(bool)
    {
        return orders[_address][h];
    }

    function getSender(address _address) returns(address) {
        //return msg.sender;
        return DependentContract(_address).realSender();
    }

    function gethash256(string s, address a) returns(bytes32) {
        return sha256(s, a);
    }

    function getHash(address tokenGet, uint amountGet, address tokenGive, uint amountGive, uint expires, uint nonce) constant returns(bytes32) {
        bytes32 hash = sha256(this, tokenGet, amountGet, tokenGive, amountGive, expires, nonce);
        return hash;
    }

    function getAddressFromPubkey(uint[2] P) constant returns(address) {
        bytes memory pubkey = new bytes(33);
        pubkey[0] = 2;
        for (uint8 i=0;i<32;i++)
        {
            pubkey[i+1] = bytes32(P[0])[i];
        }

        address user = address(ripemd160(sha256(pubkey)));
        return user;
    }

    function trade(address tokenGet, uint amountGet, address tokenGive, uint amountGive, uint expires, uint nonce, uint[2] P, uint[2] rs)  returns (bytes32){
        bytes32 hash = sha256(this, tokenGet, amountGet, tokenGive, amountGive, expires, nonce);
        //if (!validateSignature(hash, rs, P)) revert();
        bytes memory pubkey = new bytes(33);
        pubkey[0] = 2;
        for (uint8 i=0;i<32;i++)
        {
            pubkey[i+1] = bytes32(P[0])[i];
        }

        address user = address(ripemd160(sha256(pubkey)));
        orders[user][hash] = true;
        Trade(user);
        return hash;
    }
}