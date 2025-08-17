import React from "react";
import { HandCoins } from "lucide-react";
import { ConnectButton } from '@rainbow-me/rainbowkit';

interface HeaderProps {
  showNavigation?: boolean;
  showConnectButton?: boolean;
}

// Memoized navigation component to prevent re-renders
const Navigation = React.memo(function Navigation() {
  return (
    <nav className="dark-nav hidden md:flex">
      <a href="/" className="dark-nav-link">Home</a>
      <a href="/lending" className="dark-nav-link">Lending</a>
      <a href="/credit-score" className="dark-nav-link">Credit Score</a>
      <a href="/dashboard" className="dark-nav-link">Dashboard</a>
    </nav>
  );
});

// Memoized logo component
const Logo = React.memo(function Logo() {
  return (
    <div className="flex items-center gap-3">
      <HandCoins className="h-8 w-8 text-brand-primary" />
      <span className="text-2xl font-bold text-brand-primary">Qbytic</span>
    </div>
  );
});

// Memoized connect button wrapper with dark styling
const ConnectButtonWrapper = React.memo(function ConnectButtonWrapper() {
  return (
    <div className="flex items-center gap-4">
      <div className="custom-connect-button [&>button]:btn-secondary [&>button]:dark-button-animate">
        <ConnectButton />
      </div>
    </div>
  );
});

export const Header = React.memo(function Header({ 
  showNavigation = false, 
  showConnectButton = true 
}: HeaderProps) {
  return (
    <header className="dark-header">
      <Logo />
      {showNavigation && <Navigation />}
      {showConnectButton && <ConnectButtonWrapper />}
    </header>
  );
});