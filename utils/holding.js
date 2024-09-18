const { getTokenBalance } = require("../contract")
const Token = require("../TokenModel")
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');

const PAGE_SIZE = 5; // Number of wallets to show per page



const handleSell25 = async (ctx, contractAddress, page = 1) => {
  try {
    const token = await Token.findOne({ contractAddress }).exec();

    if (!token) {
      ctx.reply("❌ Token not found.");
      return;
    }

    const { bundledWallets } = token;
    console.log(bundledWallets);

    if (!bundledWallets || bundledWallets.length === 0) {
      ctx.reply("🚫 No bundled wallets available.");
      return;
    }

    const totalPages = Math.ceil(bundledWallets.length / PAGE_SIZE);

    // Slice the wallet list for the current page
    const walletsToShow = bundledWallets.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    // Fetch balances for each wallet on the current page
    const walletDetails = await Promise.all(
      walletsToShow.map(async (wallet) => {
        try {
          // Check if the wallet object contains privateKey and address or just address
          let address, privateKey;
          if (typeof wallet === 'string') {
            address = wallet;
          } else {
            address = wallet.address;
            privateKey = wallet.privateKey;
          }

          // Fetch wallet balance
          const balance = await getTokenBalance(contractAddress, address);
          const formattedBalance = Number(balance).toFixed(2); // Format the balance

          return {
            address: address,
            privateKey: privateKey,
            formattedBalance: formattedBalance,
          };
        } catch (err) {
          console.error(`Error fetching balance for wallet ${wallet}:`, err);
          return null; // Return null if there's an error
        }
      })
    );

    // Filter out any null values
    const filteredWalletDetails = walletDetails.filter(wallet => wallet !== null);

    // Create buttons for each wallet (shortened address)
    const walletButtons = filteredWalletDetails.map((wallet) => ({
      text: `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`, 
      callback_data: `select_wallet_${wallet.address}`,
    }));

    // Group buttons into rows
    const keyboardRows = [];
    for (let i = 0; i < walletButtons.length; i += 2) {
      const row = [walletButtons[i]];
      if (walletButtons[i + 1]) row.push(walletButtons[i + 1]);
      keyboardRows.push(row);
    }

    // Add navigation buttons (Next/Previous) and a back button
    const navigationButtons = [];
    if (page > 1) navigationButtons.push({ text: "⬅️ Previous", callback_data: `wallets_page_${page - 1}` });
    if (page < totalPages) navigationButtons.push({ text: "➡️ Next", callback_data: `wallets_page_${page + 1}` });

    keyboardRows.push(navigationButtons);
    keyboardRows.push([{ text: "Back", callback_data: "back_button" }]);

    // Generate the list of wallets and balances as text
    const walletText = filteredWalletDetails
      .map(wallet => `<code>${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}</code> | Balance: <b>${wallet.formattedBalance}</b>`)
      .join('\n');

    // Send message with the paginated wallets, balances, and inline keyboard
    ctx.replyWithHTML(
      `<b>Select a wallet to sell from (Page ${page}/${totalPages}):</b>\n\n${walletText}`,
      {
        reply_markup: {
          inline_keyboard: keyboardRows,
        },
      }
    );
  } catch (error) {
    console.error("Error handling sell operation:", error);
    ctx.reply("⚠️ An error occurred while processing the request. Please try again.");
  }
};



const exportPrivateKey = async(bundleWalletDetails, tokenName)=>{
  const filePath = `${tokenName}-bundleWallets.csv`
  const csvWriter = createCsvWriter({
    path: filePath,
    header: [
      { id: 'address', title: 'Wallet Address' },
      {id: 'privateKey', title: 'Private Key'}
    ],
  });
    try {
    // Write the details to the CSV file
    await csvWriter.writeRecords(bundleWalletDetails);
    console.log('Bundle Wallet details exported successfully to CSV.');
    return filePath;
  } catch (error) {
    console.error('Error exporting Bundle Wallet details to CSV:', error);
  }
};


module.exports= {
    handleSell25,
    exportPrivateKey
}



