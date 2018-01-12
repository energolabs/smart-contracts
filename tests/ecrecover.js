var Web3 = require('web3')
var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
var fs = require('fs')
var sleep = require('await-sleep')
// console.log(source)

var Web3 = require('web3');
var fs = require('fs');
var solc = require('solc');
var web3 = new Web3(Web3.givenProvider);
console.log('sha3:' + web3.utils.sha3('hello'))
var crypto = require('crypto');
var h = crypto.createHash('sha256').update('hello').digest();
console.log('sha256:0x' + h.toString('hex'))

const { Contract, QtumRPC, decodeOutputs } = require("qtumjs")
const rpc = new QtumRPC("http://123:123@127.0.0.1:13889")

var senderAddress = 'qN8g1ETgKR3b4mGpxVXENbb4Jh9uFKrz9r';
var sender = {senderAddress:senderAddress};

async function test_entry(rpc, receipt, contractInfo)
{
    contractInfo['address'] = receipt[0].contractAddress;
    console.log('contract address is,' + contractInfo['address'])
    const foo = new Contract(rpc, contractInfo)
    var msg = '0x8CbaC5e4d803bE2A3A5cd3DbE7174504c6DD0c1C'
    var crypto = require('crypto');
    // var prefix =  "Qtum Signed Message:\n";
    // var h = crypto.createHash('sha256').update(msg).digest();
    // h = '0x' + h.toString('hex')
    var h = web3.utils.sha3(msg);
    console.log('9999999:' + h);

    // var h = web3.utils.sha3(msg);
    // h = h.slice(2);

    console.log('h is ' + h)
    var res = rpc.rawCall('signmessage', [senderAddress, h.slice(2)]).then(async function (res) {
        console.log(res)
        var sig = new Buffer(res, 'base64').toString('hex')

        console.log('signed result,' + sig)
        var v = (web3.utils.toDecimal(sig.slice(0, 2))-27) & 1 + 27
        var r = `0x${sig.slice(2, 66)}`
        var s = `0x${sig.slice(66, 130)}`

        console.log(r, s, v)
        v = 27
        res = await foo.call('testRecovery', [h, v, r, s], sender)
        console.log(res.outputs[0].toString())
    });
}

var source = fs.readFileSync('ecrecover.sol')
var output = solc.compile(source.toString(), 1)

var bytecode = output.contracts[':Example'].bytecode;
var contractInfo = {abi:JSON.parse(output.contracts[':Example'].interface)};

async function go() {
    console.log('create contract for watt')
    var res = await rpc.rawCall('createcontract', [bytecode, 2500000, 0.0000004, senderAddress] )
    console.log(res)
    contractInfo['txid'] = res['txid'];
    while(true)
    {
        var receipt = await rpc.rawCall('gettransactionreceipt', [res.txid])
        console.log(receipt)
        if (receipt.length == 0)
        {
            await sleep(1000)
            continue
        }
        test_entry(rpc, receipt, contractInfo)
        break
    }
}

go().then((err, res)=>{
})
