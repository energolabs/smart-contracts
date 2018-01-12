var Web3 = require('web3')
var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
var fs = require('fs')
var bitcoin = require('bitcoinjs-lib')
const secp256k1 = require('secp256k1')
var sleep = require('await-sleep')

function uint256_to_string(n)
{
    var aa = n.toString('16');
    aa = aa.length % 2 == 0 ? aa : '0'+aa
    var b = Buffer.concat([Buffer.alloc(32).fill(0), new Buffer(aa, 'hex')]).slice(-32)
    return b;
}

var Web3 = require('web3');
var fs = require('fs');
var solc = require('solc');
var web3 = new Web3(Web3.givenProvider);

const { Contract, QtumRPC, decodeOutputs } = require("qtumjs")
const rpc = new QtumRPC("http://123:123@127.0.0.1:13889")

var senderAddress = 'qN8g1ETgKR3b4mGpxVXENbb4Jh9uFKrz9r';
var sender = {senderAddress:senderAddress};
console.log(new Buffer(32).toString('hex'))
async function test_trade(foo, contractAddress, decompressed_pubkey, privKey, sender_)
{
    var addressBuffer = new Buffer(contractAddress, 'hex')
    var u256 = uint256_to_string(0);
    var h = bitcoin.crypto.sha256(Buffer.concat([addressBuffer, addressBuffer, u256,
        addressBuffer, u256, u256, u256]));
    console.log('sha256:' + h.toString('hex'))

    const sigObj = secp256k1.sign(h, privKey)
    const sig = sigObj.signature.toString('hex')
    var rs = ['0x'+sig.slice(0, 64), '0x'+sig.slice(64)]
    console.log('rs:' + rs)

    var ca = '0x' + contractAddress
    var res = await foo.call('getHash', [ca, 0, ca, 0, 0, 0], sender)
    console.log('gethash:' + res.outputs[0])

    var validated = await foo.call('validateSignature', ['0x'+h.toString('hex'), rs, decompressed_pubkey], sender)
    console.log(validated.outputs[0])

    var pb = decompressed_pubkey[0];
    pb = pb.replace('0x', '0x02')
    var res = await foo.call('testRecovery', [pb, rs[0], 0, rs[0], rs[0]], sender)
    console.log('testRecovery:',res.outputs[0])

    var res = await foo.call('getAddressFromPubkey', [decompressed_pubkey], sender)
    console.log(res.outputs[0])

    const receipt = await foo.send('trade', [ca, 0, ca, 0, 0, 0, decompressed_pubkey, rs], sender )
    var res = await receipt.confirm(1)
    console.log(res)
}

async function test_entry(rpc, receipt, contractInfo, dependentContractAddress)
{
    contractInfo['address'] = receipt[0].contractAddress;
    console.log('contract address is,' + contractInfo['address'])
    const secp = new Contract(rpc, JSON.parse(fs.readFileSync('../outputs/contracts_secp256k1_sol_Secp256k1Curve.abi').toString()))
    const foo = new Contract(rpc, contractInfo)

    var res = await foo.send('getSender', [dependentContractAddress], sender)
    var res = await res.confirm(1)
    console.log(res)






    var msg = '0x8CbaC5e4d803bE2A3A5cd3DbE7174504c6DD0c1C'
    var h = bitcoin.crypto.sha256(msg);
    var privKey = new Buffer('e31f4de14528c326cf0f71e56ba2dc66f8d5bbbc24fc286ea6cc89de3ef43797', 'hex');
    var decompressed_pubkey = secp256k1.publicKeyCreate(privKey, false)

    decompressed_pubkey = ['0x'+new Buffer(decompressed_pubkey.slice(1, 33)).toString('hex'),
        '0x' + new Buffer(decompressed_pubkey.slice(33)).toString('hex')]

    console.log('pub:' + decompressed_pubkey)

    var res = await foo.call('getSender', [], sender)
    console.log('sender is :' + res.outputs[0])
    test_trade(foo, receipt[0].contractAddress, decompressed_pubkey, privKey, res.outputs[0])
}

var source = {
    sources:{
        'Secp256k1.sol':fs.readFileSync('../contracts/Secp256k1.sol').toString(),
        'verify.sol':fs.readFileSync('./verify.sol').toString()
    }
}

var output = solc.compile(source, 1)

var bytecode = output.contracts['verify.sol:Example'].bytecode;
var contractInfo = {abi:JSON.parse(output.contracts['verify.sol:Example'].interface)};

async function go() {
    console.log('create contract for verify')
    var res = await rpc.rawCall('createcontract', [output.contracts['verify.sol:DependentContract'].bytecode, 2500000, 0.0000004, senderAddress] )
    var dependentContractAddress = '';
    while(true)
    {
        var receipt = await rpc.rawCall('gettransactionreceipt', [res.txid])
        console.log(receipt)
        if (receipt.length == 0)
        {
            await sleep(1000)
            continue
        }
        dependentContractAddress = '0x' + receipt[0].contractAddress
        break
    }

    console.log('create contract for verify')
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

        test_entry(rpc, receipt, contractInfo, dependentContractAddress)
        break
    }
}

go().then((err, res)=>{
})
