pragma solidity ^0.4.15;

contract SafeMath {
  function safeMul(uint a, uint b) internal returns (uint) {
    uint c = a * b;
    soft_assert(a == 0 || c / a == b);
    return c;
  }

  function safeSub(uint a, uint b) internal returns (uint) {
    soft_assert(b <= a);
    return a - b;
  }

  function safeAdd(uint a, uint b) internal returns (uint) {
    uint c = a + b;
    soft_assert(c>=a && c>=b);
    return c;
  }

  function soft_assert(bool assertion) internal {
    if (!assertion) revert();
  }
}
