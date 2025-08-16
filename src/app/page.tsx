'use client';

import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Header } from "~/components/ui/header";
import { Shield, Zap, Users, HandCoins, TrendingUp } from "lucide-react";

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
    <div className="min-h-screen bg-background">
      <Header showNavigation={true} />

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Lend & Borrow <span className="text-primary">Crypto</span> Directly
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect directly with other users to lend or borrow cryptocurrency. No banks, no middlemen, just
            peer-to-peer finance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <ConnectButton />
            <Button
              size="lg"
              variant="outline"
              className="border-border text-foreground hover:bg-muted bg-transparent rounded-2xl"
            >
              Browse Loans
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Why Choose Qbytic?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Experience the future of decentralized finance with our secure, transparent platform.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-2">Secure & Trustless</h3>
                <p className="text-muted-foreground">
                  Smart contracts ensure automatic execution and eliminate counterparty risk.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-2">Instant Matching</h3>
                <p className="text-muted-foreground">
                  Advanced algorithms match lenders and borrowers in real-time for optimal rates.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-2">Community Driven</h3>
                <p className="text-muted-foreground">
                  Join thousands of users earning and borrowing with competitive rates.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-8 w-8 text-primary mr-2" />
                <span className="text-3xl font-bold text-card-foreground">$50M+</span>
              </div>
              <p className="text-muted-foreground">Total Volume Lent</p>
            </div>
            <div>
              <div className="flex items-center justify-center mb-2">
                <Users className="h-8 w-8 text-primary mr-2" />
                <span className="text-3xl font-bold text-card-foreground">10K+</span>
              </div>
              <p className="text-muted-foreground">Active Users</p>
            </div>
            <div>
              <div className="flex items-center justify-center mb-2">
                <Shield className="h-8 w-8 text-primary mr-2" />
                <span className="text-3xl font-bold text-card-foreground">99.9%</span>
              </div>
              <p className="text-muted-foreground">Uptime</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Ready to Start?</h2>
          <p className="text-muted-foreground text-lg mb-8">Join the decentralized finance revolution today.</p>
          <Button size="lg" className="rounded-2xl">
            Get Started
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <HandCoins className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold text-foreground">Qbytic</span>
            </div>
            <div className="flex space-x-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Support
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            © 2025 Qbytic. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
