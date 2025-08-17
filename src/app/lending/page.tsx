"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Header } from "~/components/ui/header";
import { BorrowForm } from "~/components/lending/BorrowForm";
import { LenderDashboard } from "~/components/lending/LenderDashboard";
import { MyLoans } from "~/components/lending/MyLoans";

type Tab = "borrow" | "lend" | "my-loans";

export default function LendingPage() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<Tab>("borrow");

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Connect Wallet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600 dark:text-gray-300">
              Please connect your wallet to access the lending platform.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header showNavigation={true} showConnectButton={true} />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-center mb-4">
            Decentralized Lending Platform
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
            Borrow USDT against your ETH collateral or lend to earn interest
          </p>
          
          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-1 shadow-md">
              <Button
                variant={activeTab === "borrow" ? "default" : "ghost"}
                onClick={() => setActiveTab("borrow")}
                className="mr-1"
              >
                Borrow
              </Button>
              <Button
                variant={activeTab === "lend" ? "default" : "ghost"}
                onClick={() => setActiveTab("lend")}
                className="mr-1"
              >
                Lend
              </Button>
              <Button
                variant={activeTab === "my-loans" ? "default" : "ghost"}
                onClick={() => setActiveTab("my-loans")}
              >
                My Loans
              </Button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "borrow" && <BorrowForm />}
        {activeTab === "lend" && <LenderDashboard />}
        {activeTab === "my-loans" && <MyLoans />}
      </div>
    </div>
  );
}