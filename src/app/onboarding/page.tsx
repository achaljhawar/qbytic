'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function OnboardingPage() {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const accountData = useAccount();
  const isConnected = accountData.isConnected;
  const address = accountData.address as string | undefined;
  const router = useRouter();

  useEffect(() => {
    const checkAuthentication = async () => {
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
    };

    void checkAuthentication();
  }, [isConnected, router]);

  const handleSubmit = async (e: React.FormEvent) => {
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
  };

  if (isCheckingAuth) {
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
            <span className="text-[hsl(280,100%,70%)]">Qbytic</span> Onboarding
          </h1>
          <p className="text-lg text-white/80 mb-8">Connect your wallet to continue with setup</p>
          <ConnectButton />
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-8 px-4 py-16">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-[3rem]">
          Welcome to <span className="text-[hsl(280,100%,70%)]">Qbytic</span>
        </h1>
        
        {/* Connected Wallet Info */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 w-full max-w-md">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <div>
              <p className="text-sm text-white/60">Connected Wallet</p>
              <p className="font-mono text-sm text-white">
                {address && typeof address === 'string' ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''}
              </p>
            </div>
          </div>
        </div>
        
        <div className="w-full max-w-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-white mb-2">
                Choose your username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[hsl(280,100%,70%)] focus:border-transparent"
                placeholder="Enter your username"
                required
                minLength={3}
                maxLength={20}
                pattern="^[a-zA-Z0-9_]+$"
                title="Username can only contain letters, numbers, and underscores"
              />
              <p className="mt-1 text-xs text-white/60">
                3-20 characters, letters, numbers and underscores only
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-md">
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || username.length < 3}
              className="w-full py-2 px-4 bg-[hsl(280,100%,70%)] text-white font-medium rounded-md hover:bg-[hsl(280,100%,65%)] focus:outline-none focus:ring-2 focus:ring-[hsl(280,100%,70%)] focus:ring-offset-2 focus:ring-offset-[#15162c] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Setting up...' : 'Continue'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}