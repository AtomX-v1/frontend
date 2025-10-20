import { TokenInfo, DexType } from '@/types';

const JUPITER_QUOTE_API = 'https://quote-api.jup.ag/v6';
const JUPITER_PRICE_API = 'https://price.jup.ag/v3';

export interface JupiterQuote {
  inputMint: string;
  inAmount: string;
  outputMint: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  priceImpactPct: string;
  routePlan: JupiterRoutePlan[];
}

export interface JupiterRoutePlan {
  swapInfo: {
    ammKey: string;
    label: string;
    inputMint: string;
    outputMint: string;
    inAmount: string;
    outAmount: string;
    feeAmount: string;
    feeMint: string;
  };
  percent: number;
}

export interface TokenPrice {
  id: string;
  type: string;
  price: string;
  extraInfo?: {
    lastSwappedPrice?: string;
    quotedPrice?: string;
  };
}

export async function getJupiterQuote(
  inputMint: string,
  outputMint: string,
  amount: number,
  slippageBps: number = 50
): Promise<JupiterQuote | null> {
  try {
    const params = new URLSearchParams({
      inputMint,
      outputMint,
      amount: amount.toString(),
      slippageBps: slippageBps.toString(),
    });

    const response = await fetch(`${JUPITER_QUOTE_API}/quote?${params}`);
    if (!response.ok) {
      console.error('Jupiter quote error:', response.statusText);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching Jupiter quote:', error);
    return null;
  }
}

export async function getTokenPrices(tokenIds: string[]): Promise<Record<string, TokenPrice>> {
  try {
    const ids = tokenIds.join(',');
    const response = await fetch(`${JUPITER_PRICE_API}/price?ids=${ids}`);

    if (!response.ok) {
      console.error('Jupiter price error:', response.statusText);
      return {};
    }

    const data = await response.json();
    return data.data || {};
  } catch (error) {
    console.error('Error fetching token prices:', error);
    return {};
  }
}

export async function findArbitrageOpportunities(
  tokenList: TokenInfo[],
  minProfitPercentage: number = 0.5
) {
  const opportunities = [];

  // Check triangular arbitrage: Token A -> Token B -> Token C -> Token A
  for (let i = 0; i < Math.min(tokenList.length, 4); i++) {
    for (let j = 0; j < Math.min(tokenList.length, 4); j++) {
      if (i === j) continue;

      const tokenA = tokenList[i];
      const tokenB = tokenList[j];
      const startAmount = 1000000000; // 1 SOL or 1000 USDC (depends on decimals)

      try {
        // Step 1: A -> B
        const quote1 = await getJupiterQuote(tokenA.mint, tokenB.mint, startAmount);
        if (!quote1) continue;

        // Step 2: B -> A (back to start)
        const quote2 = await getJupiterQuote(
          tokenB.mint,
          tokenA.mint,
          parseInt(quote1.outAmount)
        );
        if (!quote2) continue;

        const finalAmount = parseInt(quote2.outAmount);
        const profit = finalAmount - startAmount;
        const profitPercentage = (profit / startAmount) * 100;

        if (profitPercentage >= minProfitPercentage) {
          opportunities.push({
            path: [
              {
                dex: mapLabelToDex(quote1.routePlan[0]?.swapInfo.label || 'jupiter'),
                from: tokenA,
                to: tokenB,
                pool: quote1.routePlan[0]?.swapInfo.ammKey || 'unknown',
                expectedOutput: parseInt(quote1.outAmount) / Math.pow(10, tokenB.decimals),
              },
              {
                dex: mapLabelToDex(quote2.routePlan[0]?.swapInfo.label || 'jupiter'),
                from: tokenB,
                to: tokenA,
                pool: quote2.routePlan[0]?.swapInfo.ammKey || 'unknown',
                expectedOutput: finalAmount / Math.pow(10, tokenA.decimals),
              },
            ],
            estimatedProfit: (profit / Math.pow(10, tokenA.decimals)) * parseFloat(await getTokenPriceUSD(tokenA.mint)),
            profitPercentage,
            requiredAmount: startAmount / Math.pow(10, tokenA.decimals),
            timestamp: Date.now(),
          });
        }
      } catch (error) {
        console.error('Error checking arbitrage path:', error);
      }
    }
  }

  return opportunities;
}

async function getTokenPriceUSD(mint: string): Promise<string> {
  try {
    const prices = await getTokenPrices([mint]);
    return prices[mint]?.price || '1';
  } catch {
    return '1';
  }
}

function mapLabelToDex(label: string): DexType {
  const lowerLabel = label.toLowerCase();
  if (lowerLabel.includes('orca')) return 'orca';
  if (lowerLabel.includes('raydium')) return 'raydium';
  if (lowerLabel.includes('meteora')) return 'meteora';
  return 'jupiter';
}

export async function getSwapTransaction(
  quote: JupiterQuote,
  userPublicKey: string,
  wrapUnwrapSOL: boolean = true
) {
  try {
    const response = await fetch(`${JUPITER_QUOTE_API}/swap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        quoteResponse: quote,
        userPublicKey,
        wrapAndUnwrapSol: wrapUnwrapSOL,
        dynamicComputeUnitLimit: true,
        prioritizationFeeLamports: 'auto',
      }),
    });

    if (!response.ok) {
      console.error('Jupiter swap error:', response.statusText);
      return null;
    }

    const { swapTransaction } = await response.json();
    return swapTransaction;
  } catch (error) {
    console.error('Error getting swap transaction:', error);
    return null;
  }
}
