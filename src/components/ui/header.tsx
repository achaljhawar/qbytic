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
    <nav className="hidden md:flex space-x-8">
      <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
        Features
      </a>
      <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
        How it Works
      </a>
      <a href="#security" className="text-muted-foreground hover:text-foreground transition-colors">
        Security
      </a>
    </nav>
  );
});

// Memoized logo component
const Logo = React.memo(function Logo() {
  return (
    <div className="flex items-center space-x-2">
      <HandCoins className="h-8 w-8 text-primary" />
      <span className="text-xl font-bold text-foreground">Qbytic</span>
    </div>
  );
});

// Memoized connect button wrapper
const ConnectButtonWrapper = React.memo(function ConnectButtonWrapper() {
  return (
    <div className="flex items-center space-x-4">
      <ConnectButton />
    </div>
  );
});

export const Header = React.memo(function Header({ 
  showNavigation = false, 
  showConnectButton = true 
}: HeaderProps) {
  return (
    <header className="border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Logo />
          {showNavigation && <Navigation />}
          {showConnectButton && <ConnectButtonWrapper />}
        </div>
      </div>
    </header>
  );
});