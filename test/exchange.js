var Watt = artifacts.require("./Watt.sol");

contract('Watt', function(accounts) {
  it("owner check", function() {
    return Watt.deployed().then(function(instance) {
      return instance.owner.call();
    }).then(function(owner) {
      console.log(owner);
      assert.equal(owner, accounts[0], "bad owner");
    });
  });

});
