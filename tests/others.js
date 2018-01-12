var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

// web3.eth.getBlock(1).then(console.log)

var msg = '0x8CbaC5e4d803bE2A3A5cd3DbE7174504c6DD0c1C'
var h = web3.utils.sha3(msg)
console.log(h)
var address = web3.eth.getAccounts().then(function(res){
    address = res[0];
    web3.eth.sign(h, address).then(function(sg){
        console.log(sg)
        var sig = sg.slice(2)
        var r = `0x${sig.slice(0, 64)}`
        var s = `0x${sig.slice(64, 128)}`
        var v = web3.utils.toDecimal(sig.slice(128, 130)) + 27

        console.log(r, s, v)
    })
});


