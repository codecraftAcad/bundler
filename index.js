const { Scenes, session, Telegraf, Markup } = require("telegraf");
const dotenv = require("dotenv").config();
const {
  handleDeploySteps1,
  handleDeploySteps2,
  handleDeploySteps3,
  handleDeploySteps4,
  handleDeploySteps5,
  handleDeploySteps6,
  handleDeploySteps7,
  handleSkip,
  handleDeploySteps8,
  handleDeploySteps9,
  handleDeploySteps10,
} = require("./steps");
const connectDB = require("./connect");
const {
  generateWallet,
  importWallet,
  fetchAllWalletsFromDB,
  saveWalletToDB,
  fetchWalletFromDB,
  createBundledWallet,
} = require("./wallet");
const {
  deployToken,
  getDeployedTokens,
  enableTradingAddLpPeformSwap,
} = require("./contract");
const Token = require("./TokenModel");
const {
  handleBundleStep1,
  handleBundleStep2,
  handleBundleStep3,
  handleBundleStep4,
  handleBundleStep5,
} = require("./bundleSteps");
const { parseEther } = require("ethers/lib/utils");
const {
  calculatePriceForBundlePercent,
  floor,
  getPriceEstimates,
} = require("./misc");
const { ethers } = require("ethers");

connectDB();

const botToken = process.env.BOT_TOKEN || "";
console.log(botToken);

const bot = new Telegraf(botToken);

const deployScene = new Scenes.BaseScene("deployScene");
const walletScene = new Scenes.BaseScene("walletScene");
const AddWalletScene = new Scenes.BaseScene("addWalletScene");
const tokenScene = new Scenes.BaseScene("tokenScene");
const bundleScene = new Scenes.BaseScene("bundleScene");

const stage = new Scenes.Stage([
  deployScene,
  walletScene,
  AddWalletScene,
  tokenScene,
  bundleScene,
]);
bot.use(session());
bot.use(stage.middleware());

deployScene.enter(async (ctx) => {
  ctx.session.tokenDetails = {};

  await ctx.reply("Please provide the token name");

  ctx.session.stepCount = 1;
});

deployScene.on("message", async (ctx) => {
  const currentStep = ctx.session.stepCount || 1;
  console.log("Entering switch statement. Current step:", currentStep);

  switch (currentStep) {
    case 1:
      await handleDeploySteps1(ctx);
      break;

    case 2:
      await handleDeploySteps2(ctx);
      break;

    case 3:
      await handleDeploySteps3(ctx);
      break;

    case 4:
      await handleDeploySteps4(ctx);
      break;

    case 5:
      await handleDeploySteps5(ctx);
      break;

    case 6:
      await handleDeploySteps6(ctx);
      break;

    case 7:
      await handleDeploySteps7(ctx);
      break;

    case 8:
      await handleDeploySteps8(ctx);
      break;

    case 9:
      await handleDeploySteps9(ctx);
      break;

    case 10:
      await handleDeploySteps10(ctx);
      ctx.reply(
        `Thank you for the info. We've got all we need to deploy your token`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "Proceed to deploy", callback_data: "deploy_token" }],
            ],
          },
        }
      );

      break;

    default:
      // Handle unexpected steps or do nothing
      ctx.reply("Unexpected input. Please follow the conversation flow.");
      ctx.session.stepCount = null;
      ctx.scene.leave();
      break;
  }
});

walletScene.enter(async (ctx) => {
  const wallets = await fetchAllWalletsFromDB();

  if (wallets.length === 0) {
    ctx.reply(
      "You currently have no wallets created or imported. Please use the options below to either generate a new wallet or import an existing one:",
      {
        reply_markup: {
          inline_keyboard: [
            [
              { text: "Generate Wallet", callback_data: "generate_wallet" },
              { text: "Import Wallet", callback_data: "import_wallet" },
            ],
          ],
        },
      }
    );
  } else {
    const walletList = wallets
      .map(
        (wallet) => `Name: ${wallet.name} \n Address: ${wallet.walletAddress}`
      )
      .join("\n\n");
    ctx.reply(
      `Here are your existing wallets \n\n ${walletList} \n\n\n 💡To rename or export your wallets, click the button with the wallet's name.`,
      {
        reply_markup: {
          inline_keyboard: [
            ...wallets.map((wallet) => [
              { text: `✅ ${wallet.name}`, callback_data: wallet.name },
            ]),
            [
              { text: "Generate Wallet", callback_data: "generate_wallet" },
              { text: "Import wallet", callback_data: "import_wallet" },
            ],
            [{ text: "back", callback_data: "back_button" }],
          ],
        },
      }
    );
  }
});

walletScene.action("generate_wallet", async (ctx) => {
  try {
    const { privateKey, walletAddress } = await generateWallet();
    const wallets = await fetchAllWalletsFromDB();
    const walletName = wallets.length + 1;
    await saveWalletToDB(walletAddress, privateKey, `w${walletName}`);
    ctx.replyWithHTML(
      `Created new wallet\n\n
        <b>Wallet</b>\n${walletAddress}  \n\n <b>Private Key</b>\n ${privateKey} `,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "Delete Message", callback_data: "delete_message" }],
          ],
        },
      }
    );
  } catch (error) {
    console.log("error creating wallet..", error);
    ctx.reply(
      "An error occurred while generating the wallet. Please try again later."
    );
  }
});

AddWalletScene.enter(async (ctx) => {
  ctx.reply("Please send your private key to add the wallet.", {
    reply_markup: {
      force_reply: true,
    },
  });
});

AddWalletScene.on("message", async (ctx) => {
  const privateKey = ctx.message.text.trim();

  try {
    // Import the wallet using the private key
    const { walletAddress } = await importWallet(privateKey);

    // Check if the wallet already exists in the database
    const existing = await fetchWalletFromDB(walletAddress);

    if (existing) {
      // If the wallet already exists, notify the user and exit the scene
      ctx.reply("The wallet has been imported before.");
      ctx.scene.leave();
    } else {
      // Fetch all wallets to create a unique name for the new wallet
      const wallets = await fetchAllWalletsFromDB();
      const walletName = `w${wallets.length + 1}`;

      // Save the new wallet to the database
      await saveWalletToDB(walletAddress, privateKey, walletName);

      // Send a confirmation message to the user
      ctx.replyWithHTML(
        `✅ Wallet imported successfully!\n\n` +
          `<b>Wallet Address:</b>\n${walletAddress}\n\n` +
          `<b>Private Key:</b>\n${privateKey}`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "Delete Message", callback_data: "delete_message" }],
            ],
          },
        }
      );
    }
  } catch (error) {
    console.error("Error importing wallet:", error);
    ctx.reply(
      "❌ Error importing the wallet. Please make sure the private key is valid."
    );
  }
});
tokenScene.enter(async (ctx) => {
  try {
    const deployedTokens = await Token.find().exec();

    if (deployedTokens.length === 0) {
      // No tokens found
      ctx.reply("You've not created any token", {
        reply_markup: {
          inline_keyboard: [[{ text: "Back", callback_data: "back_button" }]],
        },
      });
    } else {
      // Tokens exist, show inline keyboard with token names and tickers side by side
      const tokenButtons = [];
      for (let i = 0; i < deployedTokens.length; i += 2) {
        const row = [];
        row.push({
          text: deployedTokens[i].name,
          callback_data: deployedTokens[i].contractAddress,
        });
        if (deployedTokens[i + 1]) {
          row.push({
            text: deployedTokens[i + 1].name,
            callback_data: deployedTokens[i + 1].contractAddress,
          });
        }
        tokenButtons.push(row);
      }

      ctx.replyWithHTML(
        "<b>List of deployed tokens</b>\nPlease click on any token to view more details:",
        {
          reply_markup: {
            inline_keyboard: tokenButtons,
          },
        }
      );
    }
  } catch (error) {
    // Handle error
    console.error("Error fetching deployed tokens:", error);
    ctx.reply(
      "An error occurred while fetching deployed tokens. Please try again later."
    );
  }
});
bundleScene.enter(async (ctx) => {
  const contractAddress = ctx.scene.state.contractAddress;
  console.log(contractAddress);
  ctx.reply("Please provide the buy tax value");

  ctx.session.bundleDetails = {};

  ctx.session.bundleSteps = 1;
});

bundleScene.on("message", async (ctx) => {
  const bundleSteps = ctx.session.bundleSteps || 1;

  switch (bundleSteps) {
    case 1:
      await handleBundleStep1(ctx);
      break;

    case 2:
      await handleBundleStep2(ctx);
      break;

    case 3:
      await handleBundleStep3(ctx);
      break;

    case 4:
      await handleBundleStep4(ctx);
      break;

    case 5:
      await handleBundleStep5(ctx);
      break;

    case 6:
      ctx.session.bundleDetails.bundlePercent = ctx.message.text;

      // Display collected  details for confirmation
      const {
        buyTax,
        sellTax,
        ethToAddToLP,
        percentageTokenToAddToLp,
        addressToSendLPTo,
        bundlePercent,
      } = ctx.session.bundleDetails;

      await ctx.replyWithHTML(
        `<b>Confirm the Bundle Details:</b>
Buy Tax: ${buyTax}%
Sell Tax: ${sellTax}%
ETH to Add to LP: ${ethToAddToLP}
Token Percent to add to LP: ${percentageTokenToAddToLp}%
Address to send LP tokens to: ${addressToSendLPTo}
Bundle Percent: ${bundlePercent}%`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "Proceed with Bundle",
                  callback_data: "confirm_bundle",
                },
              ],
              [{ text: "Simulate Bundle", callback_data: "simulate_bundle" }],
            ],
          },
        }
      );

      break;
    default:
      // Handle unexpected steps or do nothing
      ctx.reply("Unexpected input. Please follow the conversation flow.");
      ctx.session.stepCount = null;
      ctx.scene.leave();
      break;
  }
});

bundleScene.action("simulate_bundle", async (ctx) => {
  const numOfWallets = parseInt(ctx.session.bundleDetails.bundlePercent);
  const ethToAddToLP = parseInt(ctx.session.bundleDetails.ethToAddToLP);
  const percentageTokenToAddToLp = parseInt(
    ctx.session.bundleDetails.percentageTokenToAddToLp
  );
  const tokenDetails = await Token.findOne({ contractAddress }).exec();
  if (!tokenDetails) {
    console.log("Token not found");
    return null;
  }
  const totalSupply = tokenDetails.totalSupply;
  try {
    const {
      startPriceOfToken,
      startMarketCap,
      totalPriceForBundlerPercent,
      currentTokenPrice,
      endMarketCap,
      pricePerTransaction,
      percentagePriceMoved,
      amountOfTokenToAddToLp,
    } = getPriceEstimates(
      ethToAddToLP,
      percentageTokenToAddToLp,
      numOfWallets,
      totalSupply
    );

    ctx.replyWithHTML(
      `
<b>Bundler Simulation Result:  </b>
Initial Token Price: ${startPriceOfToken}
Initial MC: ${startMarketCap}
Total Bundler Cost: ${totalPriceForBundlerPercent}
Cost Per Bundler wallet: ${pricePerTransaction}
Token quantity to LP : ${amountOfTokenToAddToLp}
Percentage Increase(after bundle buys): ${percentagePriceMoved}
Final MC(after bundle buy): ${endMarketCap}
    `,
      {
        reply_markup: {
          inline_keyboard: [[{ text: "back", callback_data: "back_button" }]],
        },
      }
    );
  } catch (error) {
    console.log(error);
  }
});

bundleScene.action("confirm_bundle", async (ctx) => {
  await ctx.reply(
    "Enabling trading, Adding Lp and buying with bundled wallets..."
  );
  const numOfWallets = parseInt(ctx.session.bundleDetails.bundlePercent);
  const ethToAddToLP = parseInt(ctx.session.bundleDetails.ethToAddToLP);
  const ethToAddToLP2 = ethers.utils.parseEther(
    ctx.session.bundleDetails.ethToAddToLP
  );
  const buyTax = parseInt(ctx.session.bundleDetails.buyTax);
  const sellTax = parseInt(ctx.session.bundleDetails.sellTax);
  const percentageTokenToAddToLp = parseInt(
    ctx.session.bundleDetails.percentageTokenToAddToLp
  );
  const contractAddress = ctx.scene.state.contractAddress;
  const amountOfMinTokens = 0;
  const amountOfMinEth = 0;
  const addressToSendLPTo = ctx.session.bundleDetails.addressToSendLPTo;
  console.log(contractAddress);
  const tokenDetails = await Token.findOne({ contractAddress }).exec();
  if (!tokenDetails) {
    console.log("Token not found");
    return null;
  }
  const totalSupply = tokenDetails.totalSupply;
  const ethNeededToPurchaseTokens = calculatePriceForBundlePercent(
    ethToAddToLP,
    percentageTokenToAddToLp,
    numOfWallets,
    totalSupply
  );
  const amountOfTokenToAddToLp = floor(
    (totalSupply * percentageTokenToAddToLp) / 100
  );
  const ethPerWallet = ethNeededToPurchaseTokens / numOfWallets;
  console.log(ethNeededToPurchaseTokens);
  const now = Math.floor(Date.now() / 1000);
  try {
    const bundledWallets = await createBundledWallet(numOfWallets);
    tokenDetails.bundledWallets = bundledWallets;
    await tokenDetails.save();

    // Create swap transactions
    const swapTransactions = bundledWallets.map((wallet) => ({
      to: wallet.address,
      etherBuyAmount: ethers.utils.parseEther(ethPerWallet.toString()), // Convert ETH per wallet to wei
      minAmountToken: 0, // Set your required min token amount
      swapDeadline: Math.floor(Date.now() / 1000) + 3600, // Set deadline to 1 hour from current time
    }));

    console.log("Generated Swap Transactions: ", swapTransactions);

    const bundled = await enableTradingAddLpPeformSwap(
      contractAddress,
      buyTax,
      sellTax,
      ethToAddToLP2,
      amountOfTokenToAddToLp,
      amountOfMinTokens,
      amountOfMinEth,
      addressToSendLPTo,
      now,
      swapTransactions
    );

    ctx.reply(
      `Bundle successful, Check transaction using this transaction hash: ${bundled} `
    );
    ctx.scene.leave();
    ctx.scene.enter("tokenScene");

    // Here you can proceed with sending the transactions or processing them
  } catch (error) {
    console.error("Error bundling wallets or creating transactions: ", error);
  }
});

deployScene.action("deploy_token", async (ctx) => {
  const tokenName = ctx.session.tokenDetails.tokenName;
  const tokenSymbol = ctx.session.tokenDetails.tokenTicker;
  const tokenDecimals = ctx.session.tokenDetails.tokenDecimals;
  const totalSupply = ctx.session.tokenDetails.totalSupply;
  const taxWallet = ctx.session.tokenDetails.taxWallet;
  console.log("deploying the token");

  try {
    console.log("trying to deploying the token");
    const token = await deployToken(
      tokenName,
      tokenSymbol,
      totalSupply,
      tokenDecimals,
      taxWallet
    );
    console.log(token);
    const newToken = new Token({
      name: tokenName,
      ticker: tokenSymbol,
      totalSupply: totalSupply,
      contractAddress: token,
      tokenDecimal: tokenDecimals
    });
    ctx.session.tokenContractAddress = token;
    await newToken.save();
    ctx.reply(
      `Token contract successfully deployed \n\n Contract address : ${token}`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "proceed with bundle", callback_data: "bundle" }],
          ],
        },
      }
    );
  } catch (error) {
    console.log(error);
  }
});
tokenScene.on("callback_query", async (ctx) => {
  try {
    const contractAddress = ctx.callbackQuery.data; // Get the ticker from the callback data

    // Find the token associated with the ticker
    const token = await Token.findOne({ contractAddress }).exec();

    if (token) {
      // Respond with token details
      ctx.replyWithHTML(
        `
<b>Token Details</b>
Name: ${token.name}
Ticker: ${token.ticker}
Total Supply: ${token.totalSupply}
Contract Address: ${token.contractAddress}
      `,
        {
          reply_markup: {
            inline_keyboard: [
              [
                { text: "Update Buy Tax", callback_data: "change_buyTax" },
                { text: "Update Buy Tax", callback_data: "change_sellTax" },
              ],
              [
                { text: "Sell Holdings", callback_data: "sell_holdings" },
                { text: "Sell all Holdings", callback_data: "sell_all" },
              ],
            ],
          },
        }
      );
      ctx.scene.leave();
    } else {
      // If no token is found with the given ticker
      ctx.reply("Token not found.");
      ctx.scene.leave();
    }
  } catch (error) {
    console.error("Error handling callback query:", error);
    ctx.reply(
      "An error occurred while fetching token details. Please try again."
    );
  }
});
deployScene.action("bundle", async (ctx) => {
  await ctx.scene.enter("bundleScene", {
    contractAddress: ctx.session.tokenContractAddress,
  });
});

bot.start(async (ctx) => {
  const username = ctx.from.username;
  ctx.reply(`Hi ${username}, \n\n Welcome to the ETH bundler bot`, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "Deploy Token", callback_data: "deploy" },
          { text: "Tokens", callback_data: "tokendeets" },
        ],
        [{ text: "Wallet", callback_data: "wallet" }],
        [
          { text: "Support", callback_data: "support" },
          { text: "Settings", callback_data: "settings" },
        ],
      ],
    },
  });
});

bot.action("deploy", async (ctx) => {
  ctx.scene.enter("deployScene");
});
bot.action("tokendeets", async (ctx) => {
  ctx.scene.enter("tokenScene");
});
bot.action("wallet", async (ctx) => {
  ctx.scene.enter("walletScene");
});
walletScene.action("import_wallet", async (ctx) => {
  ctx.scene.enter("addWalletScene");
});
deployScene.on("callback_query", handleSkip);
bot.action("delete_message", async (ctx) => {
  ctx.deleteMessage();
});
bot.action("back_button", async (ctx) => {
  ctx.deleteMessage();
});

bot.launch();
