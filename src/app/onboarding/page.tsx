'use client';

import React, { useCallback } from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Card, CardContent } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { LoadingSpinner } from '~/components/ui/loading-spinner';
import { HandCoins } from 'lucide-react';

export default function OnboardingPage() {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const accountData = useAccount();
  const isConnected = accountData.isConnected;
  const address = accountData.address as string | undefined;
  const router = useRouter();

  // Memoize authentication check function
  const checkAuthentication = useCallback(async () => {
    if (!isConnected) {
      setIsCheckingAuth(false);
      return;
    }

    try {
      // Add a longer delay to allow cookie to be set after wallet auth
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const userData = await response.json() as { username?: string };
        
        // If user already has username, redirect to dashboard
        if (userData.username) {
          router.push('/dashboard');
          return;
        }
      } else if (response.status === 401) {
        // Only redirect to home if we're really not authenticated
        // and not just experiencing a timing issue
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Try one more time before redirecting
        const retryResponse = await fetch('/api/user/profile');
        if (retryResponse.status === 401) {
          router.push('/');
          return;
        }
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      // Don't redirect on error, stay on onboarding to let user try again
    } finally {
      setIsCheckingAuth(false);
    }
  }, [isConnected, router]);

  useEffect(() => {
    void checkAuthentication();
  }, [checkAuthentication]);

  // Memoize form submit handler
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/user/username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        const data = await response.json() as { error?: string };
        throw new Error(data.error ?? 'Failed to set username');
      }

      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }, [username, router]);

  // Memoize username change handler
  const handleUsernameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  }, []);

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <div className="container flex flex-col items-center justify-center gap-8 px-4 py-16">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-[3rem]">
            <span className="text-primary">Qbytic</span> Onboarding
          </h1>
          <p className="text-lg text-muted-foreground mb-8">Connect your wallet to continue with setup</p>
          <ConnectButton />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="container flex flex-col items-center justify-center gap-8 px-4 py-16">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-[3rem]">
          Welcome to <span className="text-primary">Qbytic</span>
        </h1>
        
        {/* Connected Wallet Info */}
        <Card className="w-full max-w-md bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <div>
                <p className="text-sm text-muted-foreground">Connected Wallet</p>
                <p className="font-mono text-sm text-card-foreground">
                  {address && typeof address === 'string' ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="w-full max-w-md bg-card border-border">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-card-foreground mb-2">
                  Choose your username
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={handleUsernameChange}
                  className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  placeholder="Enter your username"
                  required
                  minLength={3}
                  maxLength={20}
                  pattern="^[a-zA-Z0-9_]+$"
                  title="Username can only contain letters, numbers, and underscores"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  3-20 characters, letters, numbers and underscores only
                </p>
              </div>

              {error && (
                <div className="p-3 bg-destructive/20 border border-destructive/50 rounded-md">
                  <p className="text-sm text-destructive-foreground">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading || username.length < 3}
                className="w-full"
              >
                {isLoading ? 'Setting up...' : 'Continue'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}