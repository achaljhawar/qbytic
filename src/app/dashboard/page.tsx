'use client';

import React, { useCallback, useMemo } from 'react';
import { useAccount, useBalance, useDisconnect } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '~/components/ui/card';
import { LoadingSpinner } from '~/components/ui/loading-spinner';
import { formatAddress, copyToClipboard } from '~/lib/utils';
import { RoleNavbar, type UserRole } from '~/components/ui/role-navbar';

// Memoized wallet address card component
const WalletAddressCard = React.memo(function WalletAddressCard({ 
  address 
}: { 
  address?: string;
}) {
  const handleCopy = useCallback(async () => {
    if (address) {
      try {
        await copyToClipboard(address);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  }, [address]);

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-primary">Wallet Address</h2>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Public Address</p>
          <div className="flex items-center justify-between bg-muted p-3 rounded-lg">
            <span className="font-mono text-sm text-card-foreground">{formatAddress(address)}</span>
            <button
              onClick={handleCopy}
              className="px-3 py-1 text-xs bg-primary hover:bg-primary/90 text-primary-foreground rounded transition-colors"
            >
              Copy
            </button>
          </div>
          <p className="text-xs text-muted-foreground">Click to copy full address</p>
        </div>
      </CardContent>
    </Card>
  );
});

// Memoized balance card component
const BalanceCard = React.memo(function BalanceCard({ 
  balance 
}: { 
  balance?: { value: bigint; decimals: number; symbol: string };
}) {
  const formattedBalance = useMemo(() => {
    if (!balance) return null;
    return (Number(balance.value) / 10**balance.decimals).toFixed(4);
  }, [balance]);

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-primary">Wallet Balance</h2>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Current Balance</p>
          <div className="bg-muted p-3 rounded-lg">
            {balance ? (
              <div>
                <span className="text-2xl font-bold text-card-foreground">
                  {formattedBalance}
                </span>
                <span className="text-lg ml-2 text-muted-foreground">{balance.symbol}</span>
              </div>
            ) : (
              <span className="text-muted-foreground">Loading...</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Network: {balance?.symbol === 'ETH' ? 'Localhost' : 'Unknown'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
});

// Memoized account details card component
const AccountDetailsCard = React.memo(function AccountDetailsCard({ 
  username 
}: { 
  username?: string;
}) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-primary">Account Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Username</p>
            <p className="font-medium text-card-foreground">{username}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Connection Status</p>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              Connected
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export default function DashboardPage() {
  const accountData = useAccount();
  const address = accountData.address as string | undefined;
  const isConnected = accountData.isConnected;
  const { data: balance } = useBalance({ 
    address: address as `0x${string}` | undefined,
    query: {
      refetchInterval: 30000, // Refetch every 30 seconds
      staleTime: 10000, // Consider data stale after 10 seconds
    }
  });
  const { disconnect } = useDisconnect();
  const router = useRouter();
  const [user, setUser] = useState<{ username?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentRole, setCurrentRole] = useState<UserRole>('borrower');

  // Memoize the fetch user function
  const fetchUser = useCallback(async () => {
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
  }, [router]);

  useEffect(() => {
    // Only fetch user data if wallet is connected
    if (isConnected) {
      void fetchUser();
    } else {
      // If wallet is not connected, redirect to home
      setIsLoading(false);
      void router.push('/');
    }
  }, [isConnected, fetchUser, router]);

  const handleDisconnect = useCallback(async () => {
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
  }, [disconnect, router]);

  // Handle role change
  const handleRoleChange = useCallback((role: UserRole) => {
    setCurrentRole(role);
    // Here you could also persist the role preference to localStorage or API
    localStorage.setItem('userRole', role);
  }, []);

  // Load saved role preference on mount
  useEffect(() => {
    const savedRole = localStorage.getItem('userRole') as UserRole;
    if (savedRole && (savedRole === 'borrower' || savedRole === 'lender')) {
      setCurrentRole(savedRole);
    }
  }, []);


  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <LoadingSpinner className="border-white" />
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
    <div className="min-h-screen bg-background">
      <RoleNavbar 
        currentRole={currentRole} 
        onRoleChange={handleRoleChange}
        username={user?.username}
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {currentRole === 'borrower' ? 'Borrower' : 'Lender'} Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              {currentRole === 'borrower' 
                ? 'Find and manage your loans' 
                : 'Manage your lending portfolio'
              }
            </p>
          </div>
          <button
            onClick={handleDisconnect}
            className="px-4 py-2 bg-destructive/20 hover:bg-destructive/30 border border-destructive/50 rounded-md text-destructive-foreground transition-colors"
          >
            Disconnect
          </button>
        </div>

        {/* Wallet Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <WalletAddressCard address={address} />
          <BalanceCard balance={balance} />
        </div>

        {/* Account Details */}
        <AccountDetailsCard username={user?.username} />

        <div className="mt-8 text-center">
          <Link href="/credit-score">
            <button className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors">
              Check Credit Score
            </button>
          </Link>
        </div>

        {/* Connect Button for wallet changes */}
        <div className="mt-8 flex justify-center">
          <ConnectButton />
        </div>
      </div>
    </div>
  );
}