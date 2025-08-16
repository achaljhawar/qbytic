'use client';

import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const accountData = useAccount();
  const isConnected = accountData.isConnected;
  const address = accountData.address as string | undefined;
  const router = useRouter();

  useEffect(() => {
    const authenticateWallet = async () => {
      if (isConnected && address) {
        try {
          const response = await fetch('/api/auth/wallet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address }),
          });

          if (response.ok) {
            // Add a longer delay to ensure session cookie is properly set
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Check if user needs onboarding (no username)
            const profileResponse = await fetch('/api/user/profile');
            if (profileResponse.ok) {
              const userData = await profileResponse.json() as { username?: string };
              if (!userData.username) {
                router.push('/onboarding');
              } else {
                router.push('/dashboard');
              }
            } else {
              // If profile fetch fails, go to onboarding anyway
              router.push('/onboarding');
            }
          } else {
            console.error('Failed to authenticate wallet');
          }
        } catch (error) {
          console.error('Error authenticating wallet:', error);
        }
      }
    };

    void authenticateWallet();
  }, [isConnected, address, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
          Welcome to <span className="text-[hsl(280,100%,70%)]">Qbytic</span>
        </h1>
        
        <p className="text-xl text-white/80 text-center max-w-2xl">
          Connect your wallet to access your dashboard, view your balance, and manage your account.
        </p>

        <div className="flex flex-col items-center gap-6">
          <ConnectButton />
          
          <div className="text-center text-white/60">
            <p className="text-sm">
              New to crypto wallets? Learn how to get started with{" "}
              <a 
                href="https://rainbow.me/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[hsl(280,100%,70%)] hover:underline"
              >
                Rainbow Wallet
              </a>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8 mt-12">
          <div className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white">
            <h3 className="text-2xl font-bold">🔐 Secure</h3>
            <div className="text-lg">
              Your wallet connection is secure and decentralized. We never store your private keys.
            </div>
          </div>
          <div className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white">
            <h3 className="text-2xl font-bold">⚡ Fast</h3>
            <div className="text-lg">
              Lightning-fast wallet integration with support for multiple networks and tokens.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
