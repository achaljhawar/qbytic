"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
}

export function Dropdown({ trigger, children }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={handleToggle} className="cursor-pointer">
        {trigger}
      </div>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-md shadow-lg z-10">
          {children}
        </div>
      )}
    </div>
  );
}

interface DropdownItemProps {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
}

export function DropdownItem({ href, onClick, children }: DropdownItemProps) {
  const content = href ? (
    <Link href={href} className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-muted">
      {children}
    </Link>
  ) : (
    <button onClick={onClick} className="flex items-center w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted">
      {children}
    </button>
  );

  return content;
}
