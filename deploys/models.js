var Web3 = require('web3');
var fs = require('fs');
var solc = require('solc');
var web3 = new Web3(Web3.givenProvider);
var sleep = require('await-sleep')

const {senderAddress, sender} = require('./config')

const INTERVAL = 20;
const WATTADDRESS = '5dac3d9d56dc96ebe675a0f628ba9e4f05c6d492';
const TESLAADDRESS = '8aad52f875a53a2450333a42f82d6f5fe0fbcffa';
const FUND = '322c4b4c0e605c4f86c1198ee9fbbbc35bea5753';
const ALLOWANCE = 0;
const TESLAPERWATT = Math.pow(10, 18);


var param = web3.eth.abi.encodeParameters(['address', 'address', 'address', 'uint', 'uint', 'uint'],
    [WATTADDRESS, TESLAADDRESS, FUND, ALLOWANCE, INTERVAL, TESLAPERWATT])
console.log(param)

var sources = ['Token.sol', 'StandardToken.sol', 'Watt.sol', 'Owner.sol', 'SafeMath.sol', 'HumanStandardToken.sol', 'ModelS.sol']
var inputs = {sources:{}}
sources.forEach((elm)=>{
    var src = fs.readFileSync('../contracts/' + elm);
    inputs.sources[elm] = src.toString();
});

var output = solc.compile(inputs, 1)
var bytecode = output.contracts['ModelS.sol:ModelS'].bytecode;
console.log(bytecode)

var contractInfo = {abi:JSON.parse(output.contracts['ModelS.sol:ModelS'].interface)};

const { Contract, QtumRPC, decodeOutputs } = require("qtumjs")
const rpc = new QtumRPC("http://123:123@127.0.0.1:13889")

async function test_entry(rpc, receipt, contractInfo)
{
    contractInfo['address'] = receipt[0].contractAddress;
    if ('0'*40 == contractInfo['address'])
    {
        console.log('bad address,' + JSON.stringify(contractInfo));
        return;
    }
    console.log('contract address is,' + contractInfo['address'])
    const foo = new Contract(rpc, contractInfo)
    test_interval(foo)
}

async function test_interval(foo)
{
    res = await foo.call('interval', [], sender)
    console.log('interval is %d', res.outputs[0].valueOf())
    console.log(res.outputs[0].valueOf() == INTERVAL)
}

async function go() {
    console.log('create contract for watt')
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
