const contractABI = [
  {
    inputs: [
      { internalType: "address", name: "_coAdminAddress", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  { inputs: [], name: "Bundler__HolderDoesNotExist", type: "error" },
  { inputs: [], name: "Bundler__NotEnoughEtherSent", type: "error" },
  { inputs: [], name: "Bundler__OnlyAdmin", type: "error" },
  { inputs: [], name: "Bundler__PercentToSellCannotExceed100", type: "error" },
  { inputs: [], name: "Bundler__PercentToSellCannotSubceed1", type: "error" },
  { inputs: [], name: "Bundler__TokenAddressDoesNotExist", type: "error" },
  { inputs: [], name: "Bundler__TokenIndexOutOfRange", type: "error" },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "contract Token",
        name: "tokenAddress",
        type: "address",
      },
      { indexed: false, internalType: "uint256", name: "id", type: "uint256" },
    ],
    name: "NewTokenCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "tokenAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "ethAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "liquidity",
        type: "uint256",
      },
    ],
    name: "TradingEnabledLqAdded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "bool", name: "status", type: "bool" },
      { indexed: false, internalType: "bytes", name: "data", type: "bytes" },
    ],
    name: "TransactionSent",
    type: "event",
  },
  {
    inputs: [],
    name: "adminAddress",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "tokenAddress", type: "address" },
      {
        components: [
          { internalType: "address", name: "to", type: "address" },
          { internalType: "uint256", name: "etherBuyAmount", type: "uint256" },
          { internalType: "uint256", name: "minAmountToken", type: "uint256" },
          { internalType: "uint256", name: "swapDeadline", type: "uint256" },
        ],
        internalType: "struct Bundler.SwapTransaction[]",
        name: "swapTransactions",
        type: "tuple[]",
      },
    ],
    name: "bundleBuys",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "tokenAddress", type: "address" },
      { internalType: "address", name: "sendEthTo", type: "address" },
      { internalType: "uint256", name: "percentToSell", type: "uint256" },
    ],
    name: "bundleSells",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "coAdminAddress",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "taxWallet", type: "address" },
      { internalType: "string", name: "tokenName", type: "string" },
      { internalType: "string", name: "tokenSym", type: "string" },
      { internalType: "uint256", name: "totalSupply", type: "uint256" },
      { internalType: "uint8", name: "tokenDecimals", type: "uint8" },
    ],
    name: "createNewToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "tokenAddress", type: "address" },
      { internalType: "uint256[2]", name: "taxes", type: "uint256[2]" },
      { internalType: "uint256", name: "ethLpValue", type: "uint256" },
      { internalType: "uint256", name: "amountTokenDesired", type: "uint256" },
      { internalType: "uint256", name: "amountTokenMin", type: "uint256" },
      { internalType: "uint256", name: "amountETHMin", type: "uint256" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "deadline", type: "uint256" },
      {
        components: [
          { internalType: "address", name: "to", type: "address" },
          { internalType: "uint256", name: "etherBuyAmount", type: "uint256" },
          { internalType: "uint256", name: "minAmountToken", type: "uint256" },
          { internalType: "uint256", name: "swapDeadline", type: "uint256" },
        ],
        internalType: "struct Bundler.SwapTransaction[]",
        name: "swapTransactions",
        type: "tuple[]",
      },
    ],
    name: "enableTradingWithLqToUniswap",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "tokenAddress", type: "address" },
    ],
    name: "getListOfHolders",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getNumberOfTokens",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "tokenAddress", type: "address" },
    ],
    name: "getTokenByAddress",
    outputs: [{ internalType: "contract Token", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "id", type: "uint256" }],
    name: "getTokenById",
    outputs: [{ internalType: "contract Token", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTokens",
    outputs: [
      { internalType: "contract Token[]", name: "", type: "address[]" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "tokenAddress", type: "address" },
      { internalType: "address", name: "ownerAddress", type: "address" },
      { internalType: "uint256", name: "percentToSell", type: "uint256" },
      { internalType: "address", name: "sendEthTo", type: "address" },
      { internalType: "uint256", name: "minAmount", type: "uint256" },
      { internalType: "uint256", name: "deadline", type: "uint256" },
    ],
    name: "sellPerAddress",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "address", name: "to", type: "address" },
          { internalType: "bytes", name: "functionSignature", type: "bytes" },
          { internalType: "uint256", name: "value", type: "uint256" },
        ],
        internalType: "struct Bundler.Transaction[]",
        name: "transactions",
        type: "tuple[]",
      },
    ],
    name: "sendTransactions",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "tokenAddress", type: "address" },
    ],
    name: "tokenExists",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
];

module.exports = contractABI;
