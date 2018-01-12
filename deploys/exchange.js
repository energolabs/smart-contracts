var Web3 = require('web3');
var fs = require('fs');
var solc = require('solc');
var web3 = new Web3(Web3.givenProvider);
var sleep = require('await-sleep')
const {senderAddress, sender} = require('./config')

var sources = ['Token.sol', 'StandardToken.sol', 'Exchange.sol', 'Owner.sol', 'SafeMath.sol', 'HumanStandardToken.sol', 'Secp256k1.sol']
var inputs = {sources:{}}
sources.forEach((elm)=>{
    var src = fs.readFileSync('../contracts/' + elm);
    inputs.sources[elm] = src.toString();
});

var output = solc.compile(inputs, 1)
var bytecode = output.contracts['Exchange.sol:Exchange'].bytecode;
console.log(bytecode)

var contractInfo = {abi:JSON.parse(output.contracts['Exchange.sol:Exchange'].interface)};

const { Contract, QtumRPC, decodeOutputs } = require("qtumjs")
const rpc = new QtumRPC("http://123:123@127.0.0.1:13889")

async function test_entry(rpc, receipt, contractInfo)
{
    contractInfo['address'] = receipt[0].contractAddress;
    console.log('contract address is,' + contractInfo['address'])
    const foo = new Contract(rpc, contractInfo)
    test_owner(foo)
}

async function test_owner(foo)
{
    var res = await foo.call('owner')
    console.log(res.outputs[0].toString())
}

async function go() {
    console.log('create contract for exchange')
    var res = await rpc.rawCall('createcontract', [bytecode, 4000000, 0.0000004, senderAddress] )
    console.log(res)
    contractInfo['txid'] = res['txid'];
    while(true)
    {
        var receipt = await rpc.rawCall('gettransactionreceipt', [res.txid])
        if (receipt.length == 0)
        {
            await sleep(1000)
            continue;
        }
        console.log(receipt)
        test_entry(rpc, receipt, contractInfo)
        break
    }
}

go().then((err, res)=>{
})
