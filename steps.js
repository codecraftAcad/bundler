

const handleDeploySteps1= async (ctx)=>{
    ctx.session.tokenDetails.tokenName = ctx.message.text

    ctx.reply("Got it, Please provide token ticker")

    ctx.session.stepCount = 2
}

const handleDeploySteps2 = async (ctx)=>{
    ctx.session.tokenDetails.tokenTicker = ctx.message.text

    ctx.reply("Great, Please provide Token description")

    ctx.session.stepCount = 3
}

const handleDeploySteps3 = async (ctx)=>{
    ctx.session.tokenDetails.tokenDescription = ctx.message.text

    ctx.reply("Awesome, Please provide the community telegram link", {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Skip', callback_data: 'skip_tg_link' }]
            ]
        }
    })

    ctx.session.stepCount = 4
}

const handleDeploySteps4 = async (ctx) => {
    ctx.session.tokenDetails.tokenTG = ctx.message.text || '';

    ctx.reply("Great, Please provide x link for the token", {
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

    ctx.reply("Great, Please provide token logo", {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Skip', callback_data: 'skip_logo' }]
            ]
        }
    });

    ctx.session.stepCount = 7;
};


const handleDeploySteps7 = async(ctx)=>{
    if (ctx.message.photo) {
        ctx.session.tokenDetails.tokenLogo = ctx.message.photo.file_id
    }else {
        // No valid image document received
        console.log('No valid image received.');
        ctx.reply('Error: No valid image received. Please send the logo as a document.');
    }
    console.log(ctx.session.tokenDetails);
}


const handleSkip = async (ctx) => {
    const callbackData = ctx.callbackQuery.data;

    if (callbackData === 'skip_tg_link') {
        ctx.session.tokenDetails.tokenTG = ''; // Skip Telegram link
        ctx.answerCbQuery(); // Acknowledge the callback query

        // Send the next step message immediately after skipping
        await ctx.reply('Skipping Telegram link. Please provide the X link for the token', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Skip', callback_data: 'skip_x_link' }]
                ]
            }
        });
        ctx.session.stepCount = 5;
    } else if (callbackData === 'skip_x_link') {
        ctx.session.tokenDetails.tokenX = ''; // Skip X link
        ctx.answerCbQuery(); // Acknowledge the callback query

        // Send the next step message immediately after skipping
        await ctx.reply('Skipping X link. Please provide the website link for the token', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Skip', callback_data: 'skip_website_link' }]
                ]
            }
        });
        ctx.session.stepCount = 6;
    } else if (callbackData === 'skip_website_link') {
        ctx.session.tokenDetails.tokenWeb = ''; // Skip website link
        ctx.answerCbQuery(); // Acknowledge the callback query

        // Send the next step message immediately after skipping
        await ctx.reply('Skipping website link. Please provide the token logo');
        ctx.session.stepCount = 7;
    } 

     // Log the token details for debugging
};





module.exports = {
    handleDeploySteps1,
    handleDeploySteps2,
    handleDeploySteps3,
    handleDeploySteps4,
    handleDeploySteps5,
    handleDeploySteps6,
    handleDeploySteps7,
    handleSkip
}