## Setup Environment
* ubuntu Operation System (v_1604)
* Qtum Client

	Download link:

		https://github.com/qtumproject/qtum/releases/download/mainnet-ignition-v0.14.12/qtum-0.14.12-x86_64-linux-gnu.tar.gz

* Install compiler ，
	
	<code>npm install solc</code>
	
* Install web3,
	
	 <code>npm install web3 -g</code>
	 
* Install qtumjs
	
	<code>npm install qtumts -g</code>

## Run Qtum Client
1.  <code>./qtumd -regtest -rpcuser=123 -rpcpassword=123 --datadir=/opt/qtum-private/ -txindex -logevents</code>
	
2.   <code>./qtum-cli -regtest  -rpcuser=123 -rpcpassword=123 generate 501</code>
	
3.  <code>./qtum-cli -regtest -rpcuser=123 -rpcpassword=123 getinfo</code>

		{
		  "version": 141000,
		  "protocolversion": 70016,
		  "walletversion": 130000,
		  "balance": 20000.00000000,
		  "stake": 2480000.00000000,
		  "blocks": 501,
		  "timeoffset": 0,
		  "connections": 0,
		  "proxy": "",
		  "difficulty": {
		    "proof-of-work": 4.656542373906925e-10,
		    "proof-of-stake": 4.656542373906925e-10
		  },
		  "testnet": false,
		  "moneysupply": 11260000,
		  "keypoololdest": 1514395236,
		  "keypoolsize": 100,
		  "paytxfee": 0.00000000,
		  "relayfee": 0.00400000,
		  "errors": ""
		}

		getinfo The client works fine if the return block amount is 501

## Compile the code
####  1. Compile Watt.sol

<code>solcjs --optimize --bin --abi -o outputs/ contracts/SafeMath.sol contracts/Token.sol contracts/StandardToken.sol contracts/HumanStandardToken.sol  contracts/Watt.sol</code>

	Will get doc as shown below if the compile is succeeded：
		contracts_HumanStandardToken_sol_HumanStandardToken.abi 
		contracts_HumanStandardToken_sol_HumanStandardToken.bin 
		contracts_SafeMath_sol_SafeMath.abi 
		contracts_SafeMath_sol_SafeMath.bin 
		contracts_StandardToken_sol_StandardToken.abi 
		contracts_StandardToken_sol_StandardToken.bin 
		contracts_Token_sol_Token.abi
		contracts_Token_sol_Token.bin contracts_Watt_sol_Watt.abi 
		contracts_Watt_sol_Watt.bin

#### 2. Generate parameter for watt

Watt has 4 parameters: tokenName, decimalUnits, tokenSymbol, region

Enter node interface and execute flowing command

<code>var Web3 = require('web3');</code>

<code>var web3 = new Web3(Web3.givenProvider || "http://localhost:8545");</code>

<code>web3.eth.abi.encodeParameters([‘string’, ‘uint8’, ‘string’, ‘string’],[‘WATT’, 1,‘WAT’, ‘CHINA’])</code>

	0x000000000000000000000000000000000000000000000000000000000000008000000000000000000000
	00000000000000000000000000000000000000000001000000000000000000000000000000000000000000
	00000000000000000000c00000000000000000000000000000000000000000000000000000000000000100
	00000000000000000000000000000000000000000000000000000000000000045741545400000000000000
	00000000000000000000000000000000000000000000000000000000000000000000000000000000000000
	00000000000000000003574154000000000000000000000000000000000000000000000000000000000000
	000000000000000000000000000000000000000000000000000000000000054348494e4100000000000000
	0000000000000000000000000000000000000000

#### 3. Connect contracts_Watt_sol_Watt.bin to above parameters, and use following code to deploy the contract 

<code>./qtum-cli -regtest -rpcuser=123 -rpcpassword=123 getaddressesbyaccount ""</code>

	[
		"qN8g1ETgKR3b4mGpxVXENbb4Jh9uFKrz9r", 
		"qWRHVQQLmzkZRFpHR9FsVxJvzxxssdMmiJ", 
		"qY7V6z7W43msDwjXdZEJf9Kz97orzwS64z"
	]

Deploy:

<code>./qtum-cli -regtest -rpcuser=123 -rpcpassword=123 createcontract bytecode 2500000
0.00000049 qN8g1ETgKR3b4mGpxVXENbb4Jh9uFKrz9r</code>

	Result：
	{
		"txid":"16af2d4238250ca5ae6a07fa42448d2b2c6e5ca4203c04c1e5a15d662b02274e",
		"sender": "qN8g1ETgKR3b4mGpxVXENbb4Jh9uFKrz9r",
		"hash160": "322c4b4c0e605c4f86c1198ee9fbbbc35bea5753",
		"address": "a82658020903982db55219026393595822ed3a66"
	}


The contract address can be obtained after the transaction is stored in block:

<code>./qtum-cli -regtest -rpcuser=123 -rpcpassword=123 gettransactionreceipt 16af2d4238250ca5ae6a07fa42448d2b2c6e5ca4203c04c1e5a15d662b02274e</code>

	Result is presented below, the contractAddress is obtained
	[
		{
			"blockHash":"372f6bb5eb0831863b83433b4ca185cf9267bce93cf1af3ddb10fef2ac0d76d0",
			"blockNumber": 655,
			"transactionHash":"16af2d4238250ca5ae6a07fa42448d2b2c6e5ca4203c04c1e5a15d662b02274e",
			"transactionIndex": 3,
			"from": "322c4b4c0e605c4f86c1198ee9fbbbc35bea5753",
			"to": "0000000000000000000000000000000000000000",
			"cumulativeGasUsed": 2028098,
			"gasUsed": 1014049,
			"contractAddress":"a82658020903982db55219026393595822ed3a66", 
			"log": []
		}
	]

#### 4. Follow the example of qtumjs to write a test scenario 