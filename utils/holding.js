const { getTokenBalance } = require("../contract")
const Token = require("../TokenModel")

const PAGE_SIZE = 5; // Number of wallets to show per page

// Function to display a paginated list of wallets with their balances
const handleSell25 = async (ctx, contractAddress, page = 1) => {
      const token = await Token.findOne({ contractAddress }).exec();
    
    if (!token) {
      ctx.reply("Token not found.");
      return;
    }

    const { bundledWallets } = token;

    if (!bundledWallets || bundledWallets.length === 0) {
      ctx.reply("No bundled wallets available.");
      return;
    }

  const totalPages = Math.ceil(bundledWallets.length / PAGE_SIZE);

  // Slice the wallet list for the current page
  const walletsToShow = bundledWallets.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Fetch balances for each wallet on the current page
  const walletDetails = await Promise.all(
    walletsToShow.map(async (wallet) => {
      const balance = await getTokenBalance(contractAddress, wallet.address); // Fetch wallet balance
      const formattedBalance = Number(balance).toFixed(2); // Format the balance
      return {
        address: wallet.address,
        formattedBalance: formattedBalance,
      };
    })
  );

  // Create buttons for each wallet (shortened address)
  const walletButtons = walletDetails.map((wallet) => ({
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
  const walletText = walletDetails
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
};

// Callback for navigating between pages and selecting wallets

module.exports= {
    handleSell25
}



