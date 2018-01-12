var Web3 = require('web3');
var fs = require('fs');
var solc = require('solc');
var web3 = new Web3(Web3.givenProvider);
var sleep = require('await-sleep')

const {senderAddress, sender} = require('./config')
var exchangeAddress = '0x36be04c86d595e18dc722e89939eaba26dc6c12d'
const REGION = 'CHINA';
var param = web3.eth.abi.encodeParameters(['string', 'uint8', 'string', 'string'],['USD', 1, 'WAT', REGION])
console.log(param)

var sources = ['Token.sol', 'StandardToken.sol', 'Watt.sol', 'Currency.sol', 'Owner.sol', 'SafeMath.sol', 'HumanStandardToken.sol']
var inputs = {sources:{}}
sources.forEach((elm)=>{
    var src = fs.readFileSync('../contracts/' + elm);
    inputs.sources[elm] = src.toString();
});

var output = solc.compile(inputs, 1)
var bytecode = output.contracts['Currency.sol:Currency'].bytecode;
console.log(bytecode)

var contractInfo = {abi:JSON.parse(output.contracts['Currency.sol:Currency'].interface)};

const { Contract, QtumRPC, decodeOutputs } = require("qtumjs")
const rpc = new QtumRPC("http://123:123@127.0.0.1:13889")

async function test_entry(rpc, receipt, contractInfo)
{
    contractInfo['address'] = receipt[0].contractAddress;
    console.log('contract address is,' + contractInfo['address'])
    const foo = new Contract(rpc, contractInfo)
    test_name(foo)
    test_region(foo)
    test_increase(rpc, foo)
}

async function test_name(foo)
{
    var res = await foo.call('name', [], sender)
    console.log(res.outputs[0].toString() == 'USD')
}

async function test_region(foo)
{
    var res = await foo.call('region', [], sender)
    console.log(res.outputs[0].toString() == REGION)
}

async function test_increase(rpc, foo)
{
    var hexAddress = await rpc.rawCall('gethexaddress', [senderAddress])
    hexAddress = '0x' + hexAddress
    console.log(hexAddress)
    var rp = await foo.send('increaseSupply', [100000000000000, hexAddress], sender)
    var res = await rp.confirm(1)

    console.log(res.logs[0]._value)
    var res = await foo.call('balanceOf', [hexAddress], sender)
    console.log('balance of %s is %d', hexAddress, res.outputs[0].valueOf())

    var receipt = await foo.send('approve', [exchangeAddress, '0x99999999999999999999'], sender)
    var res = await receipt.confirm(1)
    console.log(res.logs[0])
    var res = await foo.call('allowance', [hexAddress, exchangeAddress])
    console.log('allowance is %d', res.outputs[0].valueOf())
}

async function go() {
    console.log('create contract for currency')
    var res = await rpc.rawCall('createcontract', [bytecode+param.slice(2), 2500000, 0.0000004, senderAddress] )
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
