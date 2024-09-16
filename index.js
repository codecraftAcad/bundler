const {Scenes, session, Telegraf, Markup } = require('telegraf')
const dotenv = require('dotenv').config()
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
    handleDeploySteps10
}= require('./steps')
const connectDB = require('./connect')
const { generateWallet, importWallet, fetchAllWalletsFromDB, saveWalletToDB, fetchWalletFromDB  } = require('./wallet')
const { deployToken } = require('./contract')




connectDB()

const botToken = process.env.BOT_TOKEN  || ''
console.log(botToken)

const bot = new Telegraf(botToken)

const deployScene = new Scenes.BaseScene('deployScene')
const walletScene = new Scenes.BaseScene('walletScene')
const AddWalletScene = new Scenes.BaseScene('addWalletScene')

const stage = new Scenes.Stage([
    deployScene,
    walletScene,
    AddWalletScene
])
bot.use(session())
bot.use(stage.middleware())



deployScene.enter(async(ctx)=>{

        ctx.session.tokenDetails = {}

    await ctx.reply("Please provide the token name")



    ctx.session.stepCount = 1
})

deployScene.on('message', async (ctx)=>{
     const currentStep = ctx.session.stepCount || 1;
    console.log("Entering switch statement. Current step:", currentStep);

    switch(currentStep){
        case 1: 
        await handleDeploySteps1(ctx);
        break;

        case 2:
            await handleDeploySteps2(ctx)
            break;
        
        case 3:
                await handleDeploySteps3(ctx)
                break;
        
        case 4: 
        await handleDeploySteps4(ctx)
        break;

        case 5:
            await handleDeploySteps5(ctx)
            break;
        
        case 6:
            await handleDeploySteps6(ctx)
            break;
        
        case 7:
            await handleDeploySteps7(ctx)
            break;

        case 8: 
        await handleDeploySteps8(ctx)
        break;

        case 9: 
        await handleDeploySteps9(ctx)
        break;

        case 10: 
        await handleDeploySteps10(ctx)
          ctx.replyWithHTML(
                `Thank you for the info. We've got all we need to deploy your token`,
                Markup.inlineKeyboard([
                    Markup.button.callback("Proceed to Deploy", "deploy_token"),
                ])
            );
            // Reset the session state and leave the scene
            ctx.session.stepCount = null;
            break;


             default:
            // Handle unexpected steps or do nothing
            ctx.reply('Unexpected input. Please follow the conversation flow.');
            ctx.session.stepCount = null;
            ctx.scene.leave();
            break;
        
    }
})



walletScene.enter(async(ctx)=>{
    const wallets = await fetchAllWalletsFromDB()

        if (wallets.length === 0) {
        ctx.reply(
          'You currently have no wallets created or imported. Please use the options below to either generate a new wallet or import an existing one:',
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: 'Generate Wallet', callback_data: 'generate_wallet' },
                { text: 'Import Wallet', callback_data: 'import_wallet' }],
              ],
            },
          }
        );
      }else{
        const walletList = wallets.map(wallet => `Name: ${wallet.name} \n Address: ${wallet.walletAddress}`).join('\n\n')
        ctx.reply(`Here are your existing wallets \n\n ${walletList} \n\n\n 💡To rename or export your wallets, click the button with the wallet's name.`, {
            reply_markup: {
                inline_keyboard: [
                    ...wallets.map(wallet=>[
                        {text:`✅ ${wallet.name}`, callback_data: wallet.name}
                    ]),
                    [{text: 'Generate Wallet', callback_data: 'generate_wallet'},
                     {text: 'Import wallet', callback_data: 'import_wallet'}
                    ],
                    [{text: 'back', callback_data: 'back_button'}]
                ]
            }
        })
      } 
})

walletScene.action('generate_wallet', async(ctx)=>{
   try {
     const {privateKey, walletAddress} = await generateWallet()
     const wallets = await fetchAllWalletsFromDB()
     const walletName = wallets.length + 1
     await saveWalletToDB(walletAddress, privateKey, `w${walletName}` )
    ctx.replyWithHTML(`Created new wallet\n\n
        <b>Wallet</b>\n${walletAddress}  \n\n <b>Private Key</b>\n ${privateKey} `, {
            reply_markup: {
                inline_keyboard: [
                    [{text: 'Delete Message', callback_data: 'delete_message'}]
                ]
            }
        })
   } catch (error) {
    console.log('error creating wallet..', error)
    ctx.reply('An error occurred while generating the wallet. Please try again later.');
   }
})

AddWalletScene.enter(async(ctx)=>{
    ctx.reply('Please send your private key to add the wallet.', {
        reply_markup: {
            force_reply: true
        }
    });

})

AddWalletScene.on('message', async (ctx) => {
    const privateKey = ctx.message.text.trim();

    try {
        // Import the wallet using the private key
        const { walletAddress } = await importWallet(privateKey);
        
        // Check if the wallet already exists in the database
        const existing = await fetchWalletFromDB(walletAddress);

        if (existing) {
            // If the wallet already exists, notify the user and exit the scene
            ctx.reply('The wallet has been imported before.');
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
                `<b>Private Key:</b>\n${privateKey}`, {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Delete Message', callback_data: 'delete_message' }]
                        ]
                    }
                }
            );
        }
    } catch (error) {
        console.error('Error importing wallet:', error);
        ctx.reply('❌ Error importing the wallet. Please make sure the private key is valid.');
    }
});
deployScene.action('deploy_token', async(ctx)=>{
    const tokenName = ctx.session.tokenDetails.tokenName
    const tokenSymbol = ctx.session.tokenDetails.tokenTicker
    const tokenDecimals = ctx.session.tokenDetails.tokenDecimals
    const totalSupply = ctx.session.tokenDetails.totalSupply
    const taxWallet = ctx.session.tokenDetails.taxWallet

   try {
     const token = await deployToken(tokenName, tokenSymbol, totalSupply, tokenDecimals, taxWallet 
     )
   } catch (error) {
    
   }
})











bot.start(async (ctx)=>{
    const username = ctx.from.username
    ctx.reply(`Hi ${username}, \n\n Welcome to the ETH bundler bot`,{
        reply_markup: {
            inline_keyboard: [
                [{text: 'Deploy Token', callback_data: 'deploy'},
                    {text: 'Token Details', callback_data: 'tokendeets'}
                ],
                [{text: 'Wallet', callback_data: 'wallet'}],
                [
                    {text: 'Support', callback_data: 'support'},
                    {text: 'Settings', callback_data: 'settings'}
                ]
            ]
        }
    })
})


bot.action('deploy', async(ctx)=>{
    ctx.scene.enter('deployScene')
})
bot.action('wallet', async(ctx)=>{
    ctx.scene.enter('walletScene')
})
walletScene.action('import_wallet', async(ctx)=>{
    ctx.scene.enter('addWalletScene')
})
deployScene.on('callback_query', handleSkip)
bot.action('delete_message', async(ctx)=>{
    ctx.deleteMessage()
})
bot.action('back_button', async(ctx)=>{
    ctx.deleteMessage()
})



bot.launch()