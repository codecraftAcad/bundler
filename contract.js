const { ethers } = require("ethers");
const contractABI = require("./contractABI");
const dotenv = require("dotenv").config();
const TokenABI = require("./ABIs/Token.json");
const providerUrl = "https://light-tetra-upright.ngrok-free.app";
const provider = new ethers.providers.JsonRpcProvider(providerUrl);

const contractAddress = "0xE634d83f8E016B04e51F2516e6086b5f238675C7";
const contract = new ethers.Contract(contractAddress, contractABI, provider);
const privateKey = process.env.PRIVATE_KEY;

const signer = new ethers.Wallet(privateKey, provider);
const contractWithSigner = contract.connect(signer);

async function getAdminAddress() {
  try {
    const adminAddress = await contract.adminAddress();
    console.log("Admin Address:", adminAddress);
  } catch (error) {
    console.error("Error fetching admin address:", error);
  }
}

getAdminAddress();

async function deployToken(
  tokenName,
  tokenSymbol,
  totalSupply,
  tokenDecimals,
  taxWallet
) {
  try {
    const tx = await contractWithSigner.createNewToken(
      taxWallet,
      tokenName,
      tokenSymbol,
      totalSupply,
      tokenDecimals
    );

    await tx.wait();

    console.log("Token deployed successfully:", tx.hash);
  } catch (error) {
    console.error("Error deploying token:", error);
  }
}

async function getDeployedTokens() {
  const tokens = await contract.getTokens();
  console.log(tokens);
  return tokens;
}

async function enableTradingAddLpPeformSwap(
  tokenAddress,
  buyTax,
  sellTax,
  ethToAddToLP,
  amountOfTokenToAddToLp,
  amountOfMinTokens, // can be zero - unavoidable slippage
  amountOfMinEth, // can be zero - unavoidable slippage
  addressToSendLPTo,
  deadline, // time range before transaction fails
  listOfSwapTransactions // list of objects according to SwapTransaction struct
) {
  try {
    const taxes = [buyTax, sellTax];
    let totalValue = 0;
    for (let i = 0; i < listOfSwapTransactions.length; i++) {
      const value = listOfSwapTransactions[i].etherBuyAmount;
      totalValue += Number(value);
    }

    const fee = ethers.utils.parseEther(
      ethers.utils.formatEther(String(totalValue + Number(ethToAddToLP)))
    );
    const tx = await contractWithSigner.enableTradingWithLqToUniswap(
      tokenAddress,
      taxes,
      ethToAddToLP,
      amountOfTokenToAddToLp,
      amountOfMinTokens,
      amountOfMinEth,
      addressToSendLPTo,
      deadline,
      listOfSwapTransactions,
      { value: fee }
    );
    console.log(tx);
  } catch (error) {
    console.log("Error from enableTradingAddLpPeformSwap()", error);
  }
}

// console.log(privateKey);

// await deployToken(
//   "TestToken",
//   "TST",
//   10000000,
//   18,
//   "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
// );
async function ExamplePerimeterForTx() {
  // struct SwapTransaction {
  //     address to;
  //     uint256 etherBuyAmount;
  //     uint256 minAmountToken;
  //     uint256 swapDeadline;
  // }

  const swapTransactions = [
    {
      to: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
      etherBuyAmount: ethers.utils.parseEther("0.05"),
      minAmountToken: 0,
      swapDeadline: Math.floor(Date.now() / 1000),
    },
    {
      to: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
      etherBuyAmount: ethers.utils.parseEther("0.05"),
      minAmountToken: 0,
      swapDeadline: Math.floor(Date.now() / 1000),
    },
    {
      to: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
      etherBuyAmount: ethers.utils.parseEther("0.05"),
      minAmountToken: 0,
      swapDeadline: Math.floor(Date.now() / 1000),
    },
  ];

  const tokens = await getDeployedTokens();
  const tokenAddress = tokens[tokens.length - 1];
  console.log(tokenAddress);
  const buyTax = 5;
  const sellTax = 10;
  const ethLP = ethers.utils.parseEther("10");
  const tokenAmount = ethers.utils.parseEther("100000");
  const now = Math.floor(Date.now() / 1000);
  const token = new ethers.Contract(tokenAddress, TokenABI, signer);
  const tradingEnabled = await token.tradingEnabled();
  const bal = await token.balanceOf(signer.address);
  console.log(signer.address);
  console.log(bal, ethers.utils.formatEther(bal));

  await enableTradingAddLpPeformSwap(
    tokenAddress,
    buyTax,
    sellTax,
    ethLP,
    tokenAmount,
    0,
    0,
    signer.address,
    now,
    swapTransactions
  );
}
