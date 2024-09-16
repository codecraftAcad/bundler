

const handleDeploySteps1 = async (ctx) => {
    ctx.session.tokenDetails.tokenName = ctx.message.text;
    ctx.reply("Got it, Please provide token ticker");
    ctx.session.stepCount = 2;
};

const handleDeploySteps2 = async (ctx) => {
    ctx.session.tokenDetails.tokenTicker = ctx.message.text;
    ctx.reply("Great, Please provide Token description");
    ctx.session.stepCount = 3;
};

const handleDeploySteps3 = async (ctx) => {
    ctx.session.tokenDetails.tokenDescription = ctx.message.text;
    ctx.reply("Awesome, Please provide the community telegram link", {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Skip', callback_data: 'skip_tg_link' }]
            ]
        }
    });
    ctx.session.stepCount = 4;
};

const handleDeploySteps4 = async (ctx) => {
    ctx.session.tokenDetails.tokenTG = ctx.message.text || '';
    ctx.reply("Great, Please provide X link for the token", {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Skip', callback_data: 'skip_x_link' }]
            ]
        }
    });
    ctx.session.stepCount = 5;
};

const handleDeploySteps5 = async (ctx) => {
    ctx.session.tokenDetails.tokenX = ctx.message.text || '';
    ctx.reply("Awesome, Please provide the website link for the token", {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Skip', callback_data: 'skip_website_link' }]
            ]
        }
    });
    ctx.session.stepCount = 6;
};

const handleDeploySteps6 = async (ctx) => {
    ctx.session.tokenDetails.tokenWeb = ctx.message.text || '';
    ctx.reply("Great, Please provide token logo");
    ctx.session.stepCount = 7;
};

const handleDeploySteps7 = async (ctx) => {
    if (ctx.message.photo) {
        ctx.session.tokenDetails.tokenLogo = ctx.message.photo.pop().file_id;
    } else {
        console.log('No valid image received.');
        ctx.reply('Error: No valid image received. Please send the logo as a document.');
    }
    console.log(ctx.session.tokenDetails);
    ctx.reply("Please provide the total supply for the token");
    ctx.session.stepCount = 8;
};

const handleDeploySteps8 = async (ctx) => {
    ctx.session.tokenDetails.totalSupply = ctx.message.text;
    ctx.reply("Great, Please provide the number of decimal places for the token");
    ctx.session.stepCount = 9;
};

const handleDeploySteps9 = async (ctx) => {
    ctx.session.tokenDetails.tokenDecimals = ctx.message.text;
    ctx.reply("Awesome, Please provide the tax wallet address")
    ctx.session.stepCount = 10;
};

const handleDeploySteps10 = async (ctx) => {
    ctx.session.tokenDetails.taxWallet = ctx.message.text ;
    console.log("Final Token Details:", ctx.session.tokenDetails);
    
    // Proceed with deployment or any other follow-up action
};

const handleSkip = async (ctx) => {
    const callbackData = ctx.callbackQuery.data;

    if (callbackData === 'skip_tg_link') {
        ctx.session.tokenDetails.tokenTG = '';
        ctx.answerCbQuery();
        await ctx.reply('Skipping Telegram link. Please provide the X link for the token', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Skip', callback_data: 'skip_x_link' }]
                ]
            }
        });
        ctx.session.stepCount = 5;
    } else if (callbackData === 'skip_x_link') {
        ctx.session.tokenDetails.tokenX = '';
        ctx.answerCbQuery();
        await ctx.reply('Skipping X link. Please provide the website link for the token', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Skip', callback_data: 'skip_website_link' }]
                ]
            }
        });
        ctx.session.stepCount = 6;
    } else if (callbackData === 'skip_website_link') {
        ctx.session.tokenDetails.tokenWeb = '';
        ctx.answerCbQuery();
        await ctx.reply('Skipping website link. Please provide the token logo');
        ctx.session.stepCount = 7;
    } 
};


const saveWebLogo = async (fileId) => {
    try {
        console.log('Requesting file link for file ID:', fileId);
        // Get the image link from Telegram
        const imageLink = await bot.telegram.getFileLink(fileId);
        console.log('Received image link:', imageLink);
        return imageLink;
    } catch (error) {
        console.error('Error processing image:', error.message);

        if (error.response && error.response.error_code === 401) {
            // Handle unauthorized error
            console.error('Unauthorized access. Check bot token and permissions.');
        }

        throw error;
    }
};




module.exports = {
    handleDeploySteps1,
    handleDeploySteps2,
    handleDeploySteps3,
    handleDeploySteps4,
    handleDeploySteps5,
    handleDeploySteps6,
    handleDeploySteps7,
    handleDeploySteps8,
    handleDeploySteps9,
    handleDeploySteps10,
    handleSkip
}