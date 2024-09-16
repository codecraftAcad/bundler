const calculatePriceForBundlePercent = (
  ethToAddToLP,
  percentOfTokenToAddToLP,
  bundlerPercent,
  totalSupply
) => {
  // return amount of eth needed for transaction and price of asset at last buy
  // multiply the price by the total tokens bought to get the marketcap

  // formula for pool - x * y = k
  if (percentOfTokenToAddToLP > 100 || bundlerPercent > 100) {
    throw new Error("percent to add to lp must be at most 100%");
  }
  if (percentOfTokenToAddToLP < bundlerPercent) {
    throw new Error("Not enough tokens added to pool");
  }

  const amountOfTokenToAddToLp = floor(
    (totalSupply * percentOfTokenToAddToLP) / 100
  );
  const poolConstant = floor(ethToAddToLP * amountOfTokenToAddToLp);

  const amountOfTokensToBeBought = floor((totalSupply * bundlerPercent) / 100);

  // x tokens + y eth = k
  // x tokens - tokens * yeth + eth = k
  // remove tokens from pool then add eth

  const tokensLeftInLP = amountOfTokenToAddToLp - amountOfTokensToBeBought;

  const ratioPoolConstantToTokensLeft = poolConstant / tokensLeftInLP;
  const ethNeededToPurchaseTokens =
    ratioPoolConstantToTokensLeft - ethToAddToLP;

  return ethNeededToPurchaseTokens;
};

const ethToAddToLP = 2; // 5eth
const percentOfTokenToAddToLP = 70; // 50%
const bundlerPercent = 20; // 20% to be bought
const totalSupply = 10_000_000; // 10m total supply

// calculatePriceForBundlePercent(
//   ethToAddToLP,
//   percentOfTokenToAddToLP,
//   bundlerPercent,
//   totalSupply
// );

const simulatePrices = (
  ethToAddToLP,
  percentOfTokenToAddToLP,
  bundlerPercent,
  totalSupply
) => {
  const numberOfBuyers = bundlerPercent;
  const totalPriceForBundlerPercent = calculatePriceForBundlePercent(
    ethToAddToLP,
    percentOfTokenToAddToLP,
    bundlerPercent,
    totalSupply
  );
  const ethNeededPerBuyer = totalPriceForBundlerPercent / numberOfBuyers;
  const amountOfTokenToAddToLp = floor(
    (totalSupply * percentOfTokenToAddToLP) / 100
  );
  const poolConstant = amountOfTokenToAddToLp * ethToAddToLP;
  const startPriceOfToken = ethToAddToLP / amountOfTokenToAddToLp;
  console.log(`Start - poolEth: ${ethToAddToLP} ETH`);
  console.log(`Start - poolTokenSupply: ${amountOfTokenToAddToLp}`);
  console.log(`Start - Price: ${startPriceOfToken} ETH`);
  console.log(`Total ETH used in trade: ${totalPriceForBundlerPercent} ETH`);
  console.log(
    `Start - MarketCap: ${amountOfTokenToAddToLp * startPriceOfToken} ETH`
  );
  let poolTokenSupply = floor((totalSupply * percentOfTokenToAddToLP) / 100);
  let poolEthSupply = ethToAddToLP;
  let totalTokensBought = 0;
  let currentTokenPrice = startPriceOfToken;
  // for each buys update the  pool supply
  // x token - token * y eth + eth = k
  for (let i = 1; i <= numberOfBuyers; i++) {
    console.log(
      "\n",
      `========================${i}=========================`,
      "\n"
    );
    poolEthSupply += ethNeededPerBuyer;
    console.log(`poolEthSupply at buyer ${i} - ${poolEthSupply}`);
    console.log("-------------------------------------------------");
    const ratioPoolConstantToPoolEth = poolConstant / poolEthSupply;
    let tokensAmountBought = poolTokenSupply - ratioPoolConstantToPoolEth;
    poolTokenSupply -= tokensAmountBought;
    totalTokensBought += tokensAmountBought;
    console.log(`amount tokens bought by buyer ${i} - ${tokensAmountBought}`);
    console.log(
      "-------------------------------------------------------------"
    );
    console.log(`poolTokenSupply at buyer ${i} - ${poolTokenSupply}`);
    console.log(
      "-------------------------------------------------------------"
    );
    const priceOfToken = poolEthSupply / poolTokenSupply;
    currentTokenPrice = priceOfToken;
    console.log(`price of the token after buyer ${i} - ${priceOfToken}`);
  }

  console.log("========================End Stats=======================");
  // calculate market cap
  // calculate % move in price
  const marketCap = currentTokenPrice * amountOfTokenToAddToLp;
  const perCentagePriceMoved = (currentTokenPrice / startPriceOfToken) * 100;

  console.log(`Current Marketcap Of Token - ${marketCap} ETH`);
  console.log(`percentage price moved - ${perCentagePriceMoved}%`);
};

const floor = (n) => {
  return Math.floor(n);
};

// simulatePrices(
//   ethToAddToLP,
//   percentOfTokenToAddToLP,
//   bundlerPercent,
//   totalSupply
// );



module.exports = {
    calculatePriceForBundlePercent,
    floor,
}