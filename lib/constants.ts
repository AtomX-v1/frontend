import { TokenInfo } from '@/types';

export const COMMON_TOKENS: TokenInfo[] = [
  {
    symbol: 'SOL',
    mint: 'So11111111111111111111111111111111111111112',
    decimals: 9,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
  },
  {
    symbol: 'USDC',
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    decimals: 6,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
  },
  {
    symbol: 'USDT',
    mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    decimals: 6,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.svg',
  },
  {
    symbol: 'RAY',
    mint: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
    decimals: 6,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R/logo.png',
  },
];

export const DEX_COLORS = {
  orca: '#FF4D94',
  raydium: '#8C50FF',
  meteora: '#00D4FF',
  jupiter: '#FCD535',
};

export const DEX_LOGOS = {
  orca: '🌊',
  raydium: '⚡',
  meteora: '☄️',
  jupiter: '🪐',
};

export const VAULT_PROGRAM_ID = 'VauLt1111111111111111111111111111111111111';
export const SWAP_ROUTER_PROGRAM_ID = 'SwapRouter1111111111111111111111111111111';
