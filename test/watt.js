var Watt = artifacts.require("./Watt.sol");

contract('Watt', function(accounts) {
  it("totalSupply check", function() {
    return Watt.deployed().then(function(instance) {
      return instance.totalSupply.call();
    }).then(function(balance) {
      console.log(balance.valueOf());
      assert.equal(balance.valueOf(), 0, "bad totalSupply");
    });
  });

  it("name check", function() {
      return Watt.deployed().then(function(instance) {
          return instance.name.call();
      }).then(function(name) {
          console.log(name);
          assert.equal(name, 'Watt1', "bad name");
      });
  });

    it("symbol check", function() {
        return Watt.deployed().then(function(instance) {
            return instance.symbol.call();
        }).then(function(symbol) {
            console.log(symbol);
            assert.equal(symbol, 'WAT', "bad symbol");
        });
    });

    it("decimals check", function() {
        return Watt.deployed().then(function(instance) {
            return instance.decimals.call();
        }).then(function(decimals) {
            console.log(decimals.valueOf());
            assert.equal(decimals.valueOf(), 1, "bad decimals");
        });
    });

    it("region check", function() {
        return Watt.deployed().then(function(instance) {
            return instance.region.call();
        }).then(function(region) {
            console.log(region);
            assert.equal(region, 'China', "bad region");
        });
    });

    it("owner check", function() {
        return Watt.deployed().then(function(instance) {
            return instance.owner.call();
        }).then(function(owner) {
            console.log(owner);
            assert.equal(owner, accounts[0], "bad owner");
        });
    });

});
