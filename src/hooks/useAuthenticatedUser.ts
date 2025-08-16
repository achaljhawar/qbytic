import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { cachedFetch } from '~/lib/api-cache';

interface UserData {
  username?: string;
}

interface AuthState {
  user: UserData | null;
  isLoading: boolean;
  error: string | null;
}

export function useAuthenticatedUser() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  });
  
  const { isConnected, address } = useAccount();
  const router = useRouter();

  const authenticateWallet = useCallback(async () => {
    if (!isConnected || !address) {
      setAuthState({ user: null, isLoading: false, error: null });
      return;
    }

    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Authenticate wallet
      const authResponse = await fetch('/api/auth/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });

      if (!authResponse.ok) {
        throw new Error('Wallet authentication failed');
      }

      // Small delay to ensure session is set
      await new Promise(resolve => setTimeout(resolve, 300));

      // Get user profile with caching
      const userData = await cachedFetch<UserData>(
        '/api/user/profile',
        undefined,
        2 * 60 * 1000 // 2 minutes cache
      );

      setAuthState({ user: userData, isLoading: false, error: null });

      // Handle navigation based on user state
      if (!userData.username) {
        router.push('/onboarding');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      setAuthState({ user: null, isLoading: false, error: errorMessage });
      
      // Don't redirect on error if we're already on auth pages
      const currentPath = window.location.pathname;
      if (!['/onboarding', '/'].includes(currentPath)) {
        router.push('/');
      }
    }
  }, [isConnected, address, router]);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAuthState({ user: null, isLoading: false, error: null });
      router.push('/');
    }
  }, [router]);

  useEffect(() => {
    void authenticateWallet();
  }, [authenticateWallet]);

  return {
    ...authState,
    logout,
    refetch: authenticateWallet,
  };
}