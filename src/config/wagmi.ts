import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { env } from '~/env.js';

export const config = getDefaultConfig({
  appName: 'Qbytic',
  projectId: env.NEXT_PUBLIC_WC_PROJECT_ID,
  chains: [
    {
      id: 1337,
      name: 'Localhost',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: {
        default: { http: ['http://localhost:8545'] },
      },
      blockExplorers: {
        default: { name: 'Local Explorer', url: 'http://localhost:8545' },
      },
    },
    {
      id: 1,
      name: 'Ethereum',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: {
        default: { http: ['https://eth.llamarpc.com'] },
      },
      blockExplorers: {
        default: { name: 'Etherscan', url: 'https://etherscan.io' },
      },
    },
  ],
  ssr: true,
});