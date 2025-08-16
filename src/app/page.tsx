'use client';

import React, { useCallback, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Header } from "~/components/ui/header";
import { LazyWrapper } from "~/components/ui/lazy-wrapper";
import { Shield, Zap, Users, HandCoins, TrendingUp } from "lucide-react";

// Memoized feature card component
const FeatureCard = React.memo(function FeatureCard({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: React.ComponentType<{ className?: string }>;
  title: string; 
  description: string;
}) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-card-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
});

// Memoized stat component
const StatCard = React.memo(function StatCard({ 
  icon: Icon, 
  value, 
  label 
}: { 
  icon: React.ComponentType<{ className?: string }>;
  value: string; 
  label: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-center mb-2">
        <Icon className="h-8 w-8 text-primary mr-2" />
        <span className="text-3xl font-bold text-card-foreground">{value}</span>
      </div>
      <p className="text-muted-foreground">{label}</p>
    </div>
  );
});

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

  // Memoize feature data to prevent recreation
  const features = useMemo(() => [
    {
      icon: Shield,
      title: "Secure & Trustless",
      description: "Smart contracts ensure automatic execution and eliminate counterparty risk."
    },
    {
      icon: Zap,
      title: "Instant Matching",
      description: "Advanced algorithms match lenders and borrowers in real-time for optimal rates."
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Join thousands of users earning and borrowing with competitive rates."
    }
  ], []);

  // Memoize stats data
  const stats = useMemo(() => [
    { icon: TrendingUp, value: "$50M+", label: "Total Volume Lent" },
    { icon: Users, value: "10K+", label: "Active Users" },
    { icon: Shield, value: "99.9%", label: "Uptime" }
  ], []);

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
      <LazyWrapper 
        fallback={<div className="py-20 px-4 sm:px-6 lg:px-8 h-96 bg-gradient-to-b from-transparent to-muted/20" />}
        rootMargin="100px"
      >
        <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Why Choose Qbytic?</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Experience the future of decentralized finance with our secure, transparent platform.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <FeatureCard
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              ))}
            </div>
          </div>
        </section>
      </LazyWrapper>

      {/* Stats Section */}
      <LazyWrapper 
        fallback={<div className="py-20 px-4 sm:px-6 lg:px-8 h-64 bg-card" />}
        rootMargin="50px"
      >
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              {stats.map((stat, index) => (
                <StatCard
                  key={index}
                  icon={stat.icon}
                  value={stat.value}
                  label={stat.label}
                />
              ))}
            </div>
          </div>
        </section>
      </LazyWrapper>

      {/* CTA Section */}
      <LazyWrapper 
        fallback={<div className="py-20 px-4 sm:px-6 lg:px-8 h-48" />}
        rootMargin="50px"
      >
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Ready to Start?</h2>
            <p className="text-muted-foreground text-lg mb-8">Join the decentralized finance revolution today.</p>
            <Button size="lg" className="rounded-2xl">
              Get Started
            </Button>
          </div>
        </section>
      </LazyWrapper>

      {/* Footer */}
      <LazyWrapper 
        fallback={<div className="border-t border-border py-12 px-4 sm:px-6 lg:px-8 h-32" />}
        rootMargin="0px"
      >
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
      </LazyWrapper>
    </div>
  );
}
