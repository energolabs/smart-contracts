var Tsl = artifacts.require("./Tsl.sol");

contract('Tsl', function(accounts) {
  it("totalSupply check", function() {
    return Tsl.deployed().then(function(instance) {
      return instance.totalSupply.call();
    }).then(function(balance) {
      console.log(balance.valueOf());
      assert.equal(balance.valueOf(), '1000000000000000000000000000', "bad totalSupply");
    });
  });

  it("name check", function() {
      return Tsl.deployed().then(function(instance) {
          return instance.name.call();
      }).then(function(name) {
          console.log(name)
          assert.equal(name, 'TESLA', "bad name");
      });
  });

    it("symbol check", function() {
        return Tsl.deployed().then(function(instance) {
            return instance.symbol.call();
        }).then(function(symbol) {
            console.log(symbol)
            assert.equal(symbol, 'TSL', "bad symbol");
        });
    });

    it("decimals check", function() {
        return Tsl.deployed().then(function(instance) {
            return instance.decimals.call();
        }).then(function(decimals) {
            console.log(decimals)
            assert.equal(decimals, 18, "bad decimals");
        });
    });



});
