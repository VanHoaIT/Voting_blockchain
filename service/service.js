export const LKKAddress = '0x7f720d8182cF23A7EA6555EA332757D17Cfd6ce9'
export const ExchangeAddress = '0xB0ec79765F2452810F3110430AdA8d02d4133f02'

export const ExchangeABI = 
[
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_lkkToken",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "tradeId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "seller",
				"type": "address"
			}
		],
		"name": "TradeCancelled",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "tradeId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "seller",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "buyer",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "tokenAmount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "lkkAmount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "tokenAddresses",
				"type": "address"
			}
		],
		"name": "TradeCompleted",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "tradeId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "seller",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "tokenAmount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "lkkPrice",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "tokenAddresses",
				"type": "address"
			}
		],
		"name": "TradeCreated",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "token",
				"type": "address"
			}
		],
		"name": "addToken",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_tradeId",
				"type": "uint256"
			}
		],
		"name": "buyTrade",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_tradeId",
				"type": "uint256"
			}
		],
		"name": "cancelTrade",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "token",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "createTrade",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "token",
				"type": "address"
			}
		],
		"name": "findTradesByToken",
		"outputs": [
			{
				"internalType": "uint256[]",
				"name": "tradeIds",
				"type": "uint256[]"
			},
			{
				"internalType": "address[]",
				"name": "sellers",
				"type": "address[]"
			},
			{
				"internalType": "uint256[]",
				"name": "tokenAmounts",
				"type": "uint256[]"
			},
			{
				"internalType": "uint256[]",
				"name": "lkkPrices",
				"type": "uint256[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getTokenList",
		"outputs": [
			{
				"internalType": "address[]",
				"name": "",
				"type": "address[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "token",
				"type": "address"
			}
		],
		"name": "getTokenPrice",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getTradeHistory",
		"outputs": [
			{
				"internalType": "address[]",
				"name": "buyers",
				"type": "address[]"
			},
			{
				"internalType": "address[]",
				"name": "sellers",
				"type": "address[]"
			},
			{
				"internalType": "uint256[]",
				"name": "tokenAmounts",
				"type": "uint256[]"
			},
			{
				"internalType": "uint256[]",
				"name": "lkkPrices",
				"type": "uint256[]"
			},
			{
				"internalType": "address[]",
				"name": "tokenAddresses",
				"type": "address[]"
			},
			{
				"internalType": "uint256[]",
				"name": "timestamps",
				"type": "uint256[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getTrades",
		"outputs": [
			{
				"internalType": "uint256[]",
				"name": "tradeIds",
				"type": "uint256[]"
			},
			{
				"internalType": "address[]",
				"name": "sellers",
				"type": "address[]"
			},
			{
				"internalType": "uint256[]",
				"name": "tokenAmounts",
				"type": "uint256[]"
			},
			{
				"internalType": "uint256[]",
				"name": "lkkPrices",
				"type": "uint256[]"
			},
			{
				"internalType": "address[]",
				"name": "tokenAddresses",
				"type": "address[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "lkkToken",
		"outputs": [
			{
				"internalType": "contract LKK",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "packageAmounts",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "token",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			}
		],
		"name": "setTokenPrice",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "supportedTokens",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "tokenList",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "tokenPrices",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "tradeHistory",
		"outputs": [
			{
				"internalType": "address",
				"name": "buyer",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "seller",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "lkkPrice",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "tokenAddresses",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "trades",
		"outputs": [
			{
				"internalType": "address",
				"name": "seller",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "lkkPrice",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "tokenAddresses",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]

//Chuẩn ERC20
export const ERC20ABI = 
[
    {
      "constant": true,
      "inputs": [{"name": "_owner", "type": "address"}],
      "name": "balanceOf",
      "outputs": [{"name": "balance", "type": "uint256"}],
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {"name": "_to", "type": "address"},
        {"name": "_value", "type": "uint256"}
      ],
      "name": "transfer",
      "outputs": [{"name": "success", "type": "bool"}],
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {"name": "_from", "type": "address"},
        {"name": "_to", "type": "address"},
        {"name": "_value", "type": "uint256"}
      ],
      "name": "transferFrom",
      "outputs": [{"name": "success", "type": "bool"}],
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "name",
      "outputs": [{"name": "_name", "type": "string"}],
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "symbol",
      "outputs": [{"name": "_symbol", "type": "string"}],
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {"name": "_spender", "type": "address"},
        {"name": "_value", "type": "uint256"}
      ],
      "name": "approve",
      "outputs": [{"name": "success", "type": "bool"}],
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [{"name": "_owner", "type": "address"}],
      "name": "allowance",
      "outputs": [
        {"name": "remaining", "type": "uint256"}
      ],
      "type": "function"
    }
  ]
