

const handleBundleStep1 = async (ctx)=>{
    ctx.session.bundleDetails.buyTax = ctx.message.text
    ctx.reply("Please provide value for sell tax")

    ctx.session.bundleSteps = 2
}

const handleBundleStep2 = async(ctx)=>{
    ctx.session.bundleDetails.sellTax = ctx.message.text
    ctx.reply("Please reply with the amount of ETH to add to lp")
    ctx.session.bundleSteps = 3
}

const handleBundleStep3 = async(ctx)=>{
    ctx.session.bundleDetails.ethToAddToLP = ctx.message.text
    ctx.reply("Please reply with the percentage of token to add to lp")
    ctx.session.bundleSteps = 4
}

const handleBundleStep4 = async (ctx)=>{
    ctx.session.bundleDetails.percentageTokenToAddToLp = ctx.message.text
    ctx.reply("Please provide address to send lp tokens to \n\n Example: 50% supply = 50")
     ctx.session.bundleSteps = 5
}

const handleBundleStep5 = async(ctx)=>{
    ctx.session.bundleDetails.addressToSendLPTo = ctx.message.text
    ctx.reply("Please provide percent of the supply to buy with bundle wallets. \n\n Example: 50% supply = 50")
    
    ctx.session.bundleSteps = 6
}




module.exports ={
    handleBundleStep1,
    handleBundleStep2,
    handleBundleStep3,
    handleBundleStep4,
    handleBundleStep5
}