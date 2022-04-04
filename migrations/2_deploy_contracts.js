var owner = artifacts.require("./Owner.sol");
var safemath = artifacts.require("./SafeMath.sol");
var standardtoken = artifacts.require("./StandardToken.sol");
var token = artifacts.require("./Token.sol");
var watt = artifacts.require("./Watt.sol");
var joule = artifacts.require("./ModelS.sol");
var tsl = artifacts.require("./Tsl.sol");
var humanstandardtoken = artifacts.require("./HumanStandardToken.sol");
var exchange = artifacts.require("./Exchange.sol");

module.exports = function(deployer) {
  //deployer.deploy(token);
  //deployer.deploy(safemath);
  //deployer.deploy(standardtoken);
  deployer.deploy(exchange);
  deployer.deploy(tsl, '1000000000000000000000000000', 'TESLA', 18, 'TSL');
  deployer.deploy(watt, 'Watt1', 1, 'WAT', 'China');
};
