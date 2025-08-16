'use client';

import { useAccount, useBalance, useDisconnect } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const accountData = useAccount();
  const address = accountData.address as string | undefined;
  const isConnected = accountData.isConnected;
  const { data: balance } = useBalance({ 
    address: address as `0x${string}` | undefined 
  });
  const { disconnect } = useDisconnect();
  const router = useRouter();
  const [user, setUser] = useState<{ username?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Add a small delay to allow cookie to be set after wallet auth
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const userData = await response.json() as { username?: string };
          setUser(userData);
          
          // If user doesn't have username, redirect to onboarding
          if (!userData.username) {
            router.push('/onboarding');
            return;
          }
        } else if (response.status === 401) {
          // User not authenticated, redirect to home
          router.push('/');
          return;
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        // On error, redirect to home to restart auth flow
        router.push('/');
        return;
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch user data if wallet is connected
    if (isConnected) {
      void fetchUser();
    } else {
      // If wallet is not connected, redirect to home
      setIsLoading(false);
      void router.push('/');
    }
  }, [isConnected]);

  const handleDisconnect = async () => {
    try {
      // Clear NextAuth session
      await fetch('/api/auth/logout', { method: 'POST' });
      
      // Disconnect wallet
      disconnect();
      
      // Redirect to home
      router.push('/');
    } catch (error) {
      console.error('Error during logout:', error);
      // Still disconnect and redirect even if logout fails
      disconnect();
      router.push('/');
    }
  };

  const formatAddress = (addr: unknown) => {
    if (!addr || typeof addr !== 'string') return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </main>
    );
  }

  if (!isConnected) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-8 px-4 py-16">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-[3rem]">
            <span className="text-[hsl(280,100%,70%)]">Qbytic</span> Dashboard
          </h1>
          <p className="text-lg text-white/80 mb-8">Connect your wallet to continue</p>
          <ConnectButton />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, <span className="text-[hsl(280,100%,70%)]">{user?.username}</span>
            </h1>
            <p className="text-white/60 mt-1">Manage your wallet and view your balance</p>
          </div>
          <button
            onClick={handleDisconnect}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-md text-red-200 transition-colors"
          >
            Disconnect
          </button>
        </div>

        {/* Wallet Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Wallet Address Card */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4 text-[hsl(280,100%,70%)]">Wallet Address</h2>
            <div className="space-y-2">
              <p className="text-sm text-white/60">Public Address</p>
              <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
                <span className="font-mono text-sm">{formatAddress(address)}</span>
                <button
                  onClick={() => address && void copyToClipboard(address)}
                  className="px-3 py-1 text-xs bg-[hsl(280,100%,70%)] hover:bg-[hsl(280,100%,65%)] rounded transition-colors"
                >
                  Copy
                </button>
              </div>
              <p className="text-xs text-white/40">Click to copy full address</p>
            </div>
          </div>

          {/* Balance Card */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4 text-[hsl(280,100%,70%)]">Wallet Balance</h2>
            <div className="space-y-2">
              <p className="text-sm text-white/60">Current Balance</p>
              <div className="bg-white/5 p-3 rounded-lg">
                {balance ? (
                  <div>
                    <span className="text-2xl font-bold">
                      {(Number(balance.value) / 10**balance.decimals).toFixed(4)}
                    </span>
                    <span className="text-lg ml-2 text-white/80">{balance.symbol}</span>
                  </div>
                ) : (
                  <span className="text-white/60">Loading...</span>
                )}
              </div>
              <p className="text-xs text-white/40">
                Network: {balance?.symbol === 'ETH' ? 'Ethereum' : 'Unknown'}
              </p>
            </div>
          </div>
        </div>

        {/* Account Details */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-[hsl(280,100%,70%)]">Account Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-white/60 mb-1">Username</p>
              <p className="font-medium">{user?.username}</p>
            </div>
            <div>
              <p className="text-sm text-white/60 mb-1">Connection Status</p>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-200">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                Connected
              </span>
            </div>
          </div>
        </div>

        {/* Connect Button for wallet changes */}
        <div className="mt-8 flex justify-center">
          <ConnectButton />
        </div>
      </div>
    </main>
  );
}