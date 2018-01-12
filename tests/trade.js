var Web3 = require('web3')
var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
var fs = require('fs')
var bitcoin = require('bitcoinjs-lib')
var secp256k1 = require('secp256k1')
var Web3 = require('web3');
var fs = require('fs');
var solc = require('solc');
var web3 = new Web3(Web3.givenProvider);
var sleep = require('await-sleep')
const { Contract, QtumRPC, decodeOutputs } = require("qtumjs")
const rpc = new QtumRPC("http://123:123@127.0.0.1:13889")

var senderAddress = 'qN8g1ETgKR3b4mGpxVXENbb4Jh9uFKrz9r';
var exchangeAddress = '0x36be04c86d595e18dc722e89939eaba26dc6c12d'
var emptyAddress = '0x0000000000000000000000000000000000000000'

var pk = new Buffer('9e17785febbe297ec36e21a4cccdc9ded3462e1a06b97e5eb8e1573d6d69d343', 'hex')
var pubk = secp256k1.publicKeyCreate(pk)
var addr = bitcoin.crypto.hash160(new Buffer(pubk))
var approveAddr = '0x' + addr.toString('hex')
console.log(approveAddr)


function uint256_to_string(n)
{
    var aa = n.toString('16');
    aa = aa.length % 2 == 0 ? aa : '0'+aa
    var b = Buffer.concat([Buffer.alloc(32).fill(0), new Buffer(aa, 'hex')]).slice(-32)
    return b;
}

function getPubkey(privKey)
{
    var decompressed_pubkey = secp256k1.publicKeyCreate(privKey, false)
    decompressed_pubkey = ['0x'+new Buffer(decompressed_pubkey.slice(1, 33)).toString('hex'),
        '0x' + new Buffer(decompressed_pubkey.slice(33)).toString('hex')]
    return decompressed_pubkey;
}

function createMakerOrder(tokenGet, amountGet, tokenGive, amountGive, expire, nonce, privKey)
{
    if (tokenGet.length == 42)
        tokenGet = tokenGet.slice(2)
    if (tokenGive.length == 42)
        tokenGive = tokenGive.slice(2)
    var ea = exchangeAddress
    if (ea.length == 42)
        ea = ea.slice(2)
    var h = bitcoin.crypto.sha256(Buffer.concat([new Buffer(ea, 'hex'), new Buffer(tokenGet, 'hex'), uint256_to_string(amountGet),
        new Buffer(tokenGive, 'hex'), uint256_to_string(amountGive), uint256_to_string(expire), uint256_to_string(nonce)]));
    console.log('h is :', h.toString('hex'))
    const sigObj = secp256k1.sign(h, privKey)
    const sig = sigObj.signature.toString('hex')
    var rs = ['0x'+sig.slice(0, 64), '0x'+sig.slice(64)]
    return [h, rs];
}

async function createOrder(foo, hexAddress, tokenGet, amountGet, tokenGive, amountGive, expire, nonce) {
    var orderObj = [tokenGet, amountGet, tokenGive, amountGive, expire, nonce+1]
    var res = await foo.send('order', orderObj, {senderAddress:senderAddress})
    var res = await res.confirm(1)
    console.log(res)

    var args = orderObj.concat([hexAddress, 0,  new Buffer(32), new Buffer(32)])
    var res = await foo.call('amountFilled', args)
    console.log(res.outputs[0])
}

// orderObj = [tokenGet, amountGet, tokenGive, amountGive, expire, nonce]
async function createTakeOrder(sender_, foo, orderObj, amount, rs, decompressed_pubkey, hexAddress)
{
    console.log(rs[0].toString('hex'), rs[1].toString('hex'), decompressed_pubkey[0].toString('hex'), decompressed_pubkey[1].toString('hex') )
    var args = orderObj.concat([amount, decompressed_pubkey, rs])
    var receipt = await foo.send('trade', args, {senderAddress:sender_, gasLimit:2000000})

    var res = await receipt.confirm(1)
    console.log('trade result,', res.logs)

    var args = orderObj.concat([hexAddress, 0,  new Buffer(32), new Buffer(32)])
    var res = await foo.call('amountFilled', args)
    console.log(res.outputs[0])

    var args = orderObj.concat([decompressed_pubkey, rs])
    var res = await foo.send('cancelOrder', args, {senderAddress: senderAddress, gasLimit:2000000})
    var res = await res.confirm(1)
    console.log(res)
}

async function testTrade(senderAddress, foo, orderObj, rs, decompressed_pubkey)
{
    var hexAddress = await rpc.rawCall('gethexaddress', [senderAddress])
    hexAddress = '0x' + hexAddress
    console.log(hexAddress)

    var args = orderObj.concat([decompressed_pubkey, rs, 4, hexAddress])
    var res = await foo.call('testTrade', args, {senderAddress: senderAddress})
    console.log(res.outputs[0])

    var args = orderObj.concat([decompressed_pubkey, rs, 40, hexAddress])
    var res = await foo.call('testTrade', args, {senderAddress: senderAddress})
    console.log(res.outputs[0])
}

async function test_trade(foo, decompressed_pubkey, privKey, currencyContractInfo)
{
    var tokenGet = '0x2cf9f600ad161ee6f184eae256d735811a357725'
    var amountGet = 10
    var tokenGive = '0xdc6b8dd9e8aa557da6f99570ec03762ba42fe4e1'
    var amountGive = 9
    var expire = 100000
    var nonce = 999


    currencyContractInfo['address'] = tokenGet.slice(2)
    var res = await new Contract(rpc, currencyContractInfo).send('approve', [exchangeAddress, 9999999], {senderAddress: senderAddress})
    var res = await res.confirm(1)
    console.log(res)
    currencyContractInfo['address'] = tokenGive.slice(2)
    var res = await new Contract(rpc, currencyContractInfo).send('approve', [exchangeAddress, 9999999], {senderAddress: senderAddress})
    var res = await res.confirm(1)
    console.log(res)

    //approve test
    var hexAddress = await rpc.rawCall('gethexaddress', [senderAddress])
    hexAddress = '0x' + hexAddress
    console.log(hexAddress)

    var res = await new Contract(rpc, currencyContractInfo).send('approve', [approveAddr, 9999999], {senderAddress: senderAddress})
    var res = await res.confirm(1)
    console.log(res)
    var res = await new Contract(rpc, currencyContractInfo).send('transferFrom', [hexAddress, emptyAddress, 9], {senderAddress: 'qWRHVQQLmzkZRFpHR9FsVxJvzxxssdMmiJ'})
    var res = await res.confirm(1)
    var res = await new Contract(rpc, currencyContractInfo).call('allowance', [hexAddress, approveAddr])
    console.log('test allowance is %d', res.outputs[0].valueOf())
    //end approve test

    var orderObj = [tokenGet, amountGet, tokenGive, amountGive, expire, nonce]
    createOrder(foo, hexAddress, tokenGet, amountGet, tokenGive, amountGive, expire, nonce)

    var res = createMakerOrder(tokenGet, amountGet, tokenGive, amountGive, expire, nonce, privKey)
    var h = res[0]
    var rs = res[1]

    var res = await foo.call('validateSignature', [h, rs, decompressed_pubkey], {senderAddress:senderAddress})
    console.log('validate result,', res.outputs[0])

    createTakeOrder(senderAddress, foo, orderObj, 6, rs, decompressed_pubkey, hexAddress)
    testTrade(senderAddress, foo, orderObj, rs, decompressed_pubkey)
}

async function test_entry(rpc, receipt, contractInfo, currencyContractInfo)
{
    exchangeAddress = '0x' + receipt[0].contractAddress
    var ex = exchangeAddress
    if (ex.length == 42)
        ex = ex.slice(2)
    contractInfo['address'] = ex;
    console.log('contract address is,' + contractInfo['address'])

    var privKey = new Buffer('e31f4de14528c326cf0f71e56ba2dc66f8d5bbbc24fc286ea6cc89de3ef43797', 'hex');
    const foo = new Contract(rpc, contractInfo)
    var decompressed_pubkey = getPubkey(privKey)
    test_trade(foo, decompressed_pubkey, privKey, currencyContractInfo)
}

var sources = ['Token.sol', 'StandardToken.sol', 'Exchange.sol', 'Owner.sol', 'SafeMath.sol', 'HumanStandardToken.sol', 'Secp256k1.sol']
var inputs = {sources:{}}
sources.forEach((elm)=>{
    var src = fs.readFileSync('../contracts/' + elm);
    inputs.sources[elm] = src.toString();
});

var output = solc.compile(inputs, 1)

var bytecode = output.contracts['Exchange.sol:Exchange'].bytecode;
var currencyContractInfo = {abi:JSON.parse(output.contracts['Token.sol:Token'].interface)}
var contractInfo = {abi:JSON.parse(output.contracts['Exchange.sol:Exchange'].interface)};

async function go() {
    console.log('create contract for trade')
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
        console.log('contract created,', receipt)
        test_entry(rpc, receipt, contractInfo, currencyContractInfo)
        break
    }
}

go().then((err, res)=>{
})
