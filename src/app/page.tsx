'use client';

import React, { useCallback } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Header } from "~/components/ui/header";
import { LazyWrapper } from "~/components/ui/lazy-wrapper";
import Hero from "~/components/ui/hero";
import HowItWorks from "~/components/ui/how-it-works";
import Benefits from "~/components/ui/benefits";
import { HandCoins } from "lucide-react";

export default function HomePage() {
  const accountData = useAccount();
  const isConnected = accountData.isConnected;
  const address = accountData.address as string | undefined;
  const router = useRouter();

  // Memoize the authentication function to prevent recreating on every render
  const authenticateWallet = useCallback(async () => {
    if (!isConnected || !address) return;
    
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
  }, [isConnected, address, router]);

  useEffect(() => {
    void authenticateWallet();
  }, [authenticateWallet]);

  return (
    <div className="min-h-screen bg-bg-primary">
      <Header showNavigation={true} />

      {/* Hero Section */}
      <Hero />

      {/* How It Works Section */}
      <LazyWrapper 
        fallback={<div className="py-32 h-96 bg-bg-primary" />}
        rootMargin="100px"
      >
        <HowItWorks />
      </LazyWrapper>

      {/* Benefits Section */}
      <LazyWrapper 
        fallback={<div className="py-32 h-96 bg-bg-primary" />}
        rootMargin="100px"
      >
        <Benefits />
      </LazyWrapper>

      {/* Footer */}
      <LazyWrapper 
        fallback={<div className="border-t border-border-subtle py-12 px-4 sm:px-6 lg:px-8 h-32" />}
        rootMargin="0px"
      >
        <footer className="border-t border-border-subtle py-12 px-4 sm:px-6 lg:px-8 bg-bg-primary">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <HandCoins className="h-6 w-6 text-brand-primary transition-all duration-[400ms] ease-in-out hover:scale-110 hover:drop-shadow-[0_0_12px_rgba(0,255,209,0.8)]" />
                <span className="text-lg font-semibold text-text-primary transition-colors duration-[400ms] ease-in-out hover:text-brand-primary">Qbytic</span>
              </div>
              <div className="flex space-x-6 text-sm text-text-muted">
                <a href="#" className="hover:text-text-primary transition-colors duration-[400ms] ease-in-out hover:scale-105 inline-block">
                  Privacy
                </a>
                <a href="#" className="hover:text-text-primary transition-colors duration-[400ms] ease-in-out hover:scale-105 inline-block">
                  Terms
                </a>
                <a href="#" className="hover:text-text-primary transition-colors duration-[400ms] ease-in-out hover:scale-105 inline-block">
                  Support
                </a>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-border-subtle text-center text-sm text-text-muted">
              © 2025 Qbytic. All rights reserved.
            </div>
          </div>
        </footer>
      </LazyWrapper>
    </div>
  );
}