'use client';

import React, { useCallback } from 'react';
import { HandCoins, User, Building2, CreditCard, LogOut, ChevronDown } from "lucide-react";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Dropdown, DropdownItem } from './dropdown';

export type UserRole = 'borrower' | 'lender';

interface RoleNavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  username?: string;
}

// Memoized logo component
const Logo = React.memo(function Logo() {
  return (
    <div className="flex items-center gap-3">
      <HandCoins className="h-8 w-8 text-brand-primary" />
      <span className="text-2xl font-bold text-brand-primary">Qbytic</span>
    </div>
  );
});

// Memoized role switch component
const RoleSwitch = React.memo(function RoleSwitch({
  currentRole,
  onRoleChange
}: {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}) {
  const handleRoleChange = useCallback((role: UserRole) => {
    onRoleChange(role);
  }, [onRoleChange]);

  return (
    <div className="flex items-center bg-muted rounded-lg p-1">
      <button
        onClick={() => handleRoleChange('borrower')}
        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
          currentRole === 'borrower'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
        }`}
      >
        <User className="h-4 w-4" />
        <span className="font-medium">Borrower</span>
      </button>
      <button
        onClick={() => handleRoleChange('lender')}
        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
          currentRole === 'lender'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
        }`}
      >
        <Building2 className="h-4 w-4" />
        <span className="font-medium">Lender</span>
      </button>
    </div>
  );
});

// Memoized user info component
const UserInfo = React.memo(function UserInfo({ username }: { username?: string }) {
  return (
    <div className="flex items-center gap-4">
      {username && (
        <Dropdown
          trigger={
            <div className="hidden sm:flex items-center gap-2 text-sm cursor-pointer">
              <span className="text-muted-foreground">Welcome,</span>
              <span className="font-medium text-foreground">{username}</span>
              <ChevronDown className="h-4 w-4" />
            </div>
          }
        >
          <DropdownItem href="/credit-score">
            <CreditCard className="h-4 w-4 mr-2" />
            Credit Score
          </DropdownItem>
          <DropdownItem onClick={() => {
            // Handle logout
          }}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </DropdownItem>
        </Dropdown>
      )}
      <div className="custom-connect-button [&>button]:btn-secondary [&>button]:dark-button-animate">
        <ConnectButton />
      </div>
    </div>
  );
});

export const RoleNavbar = React.memo(function RoleNavbar({
  currentRole,
  onRoleChange,
  username
}: RoleNavbarProps) {
  return (
    <header className="dark-header border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Logo />

          <div className="flex items-center gap-6">
            <RoleSwitch currentRole={currentRole} onRoleChange={onRoleChange} />
            <UserInfo username={username} />
          </div>
        </div>
      </div>
    </header>
  );
});