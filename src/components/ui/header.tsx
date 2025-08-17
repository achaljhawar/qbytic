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
      <a href="#features" className="dark-nav-link">Features</a>
      <a href="#how-it-works" className="dark-nav-link">How it Works</a>
      <a href="#benefits" className="dark-nav-link">Benefits</a>
      <a href="#about" className="dark-nav-link">About</a>
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