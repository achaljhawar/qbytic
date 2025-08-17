"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { LoadingSpinner } from "~/components/ui/loading-spinner";
import { useLendingContract, type LoanDetails } from "~/hooks/useLendingContract";
import { useUSDTContract } from "~/hooks/useTokenContract";
import { LOAN_STATUSES } from "~/config/contracts";

export function MyLoans() {
  const { address } = useAccount();
  const [borrowedLoans, setBorrowedLoans] = useState<LoanDetails[]>([]);
  const [lentLoans, setLentLoans] = useState<LoanDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"borrowed" | "lent">("borrowed");
  
  const { getLoanDetails, makePayment, isWritePending } = useLendingContract();
  const { balance: usdtBalance, approve, allowance } = useUSDTContract();

  useEffect(() => {
    const fetchMyLoans = async () => {
      if (!address) return;
      
      setIsLoading(true);
      
      try {
        // In a real implementation, you'd have a way to get loan IDs for a specific user
        // For now, we'll check loans 1-10 as an example
        const loanPromises = Array.from({ length: 10 }, (_, i) => getLoanDetails(i + 1));
        const allLoans = (await Promise.all(loanPromises)).filter(Boolean) as LoanDetails[];
        
        const borrowed = allLoans.filter(loan => 
          loan.borrower.toLowerCase() === address.toLowerCase()
        );
        const lent = allLoans.filter(loan => 
          loan.lender.toLowerCase() === address.toLowerCase()
        );
        
        setBorrowedLoans(borrowed);
        setLentLoans(lent);
      } catch (error) {
        console.error('Error fetching loans:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyLoans();
  }, [address, getLoanDetails]);

  const handleMakePayment = async (loanId: number, paymentAmount: string) => {
    try {
      // Check if we need approval
      const currentAllowance = parseFloat(allowance);
      const payment = parseFloat(paymentAmount);
      
      if (currentAllowance < payment) {
        await approve(paymentAmount);
        return;
      }
      
      await makePayment(loanId);
    } catch (error) {
      console.error('Error making payment:', error);
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1: return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case 2: return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case 3: return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case 4: return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case 5: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const calculateMonthlyPayment = (outstandingDebt: string, duration: number = 30) => {
    // Simplified calculation - in reality this would come from the contract
    const debt = parseFloat(outstandingDebt);
    return (debt / (duration / 30)).toFixed(2);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const currentLoans = activeTab === "borrowed" ? borrowedLoans : lentLoans;

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-1 shadow-md">
          <Button
            variant={activeTab === "borrowed" ? "default" : "ghost"}
            onClick={() => setActiveTab("borrowed")}
            className="mr-1"
          >
            Borrowed ({borrowedLoans.length})
          </Button>
          <Button
            variant={activeTab === "lent" ? "default" : "ghost"}
            onClick={() => setActiveTab("lent")}
          >
            Lent ({lentLoans.length})
          </Button>
        </div>
      </div>

      {/* Loans List */}
      {currentLoans.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-gray-500 dark:text-gray-400">
              No {activeTab} loans found.
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {currentLoans.map((loan) => (
            <Card key={loan.loanId}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Loan #{loan.loanId}</CardTitle>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(loan.status)}`}>
                    {LOAN_STATUSES[loan.status]}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-300">Amount</label>
                    <div className="font-semibold">{loan.outstandingDebt} USDT</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-300">Collateral</label>
                    <div className="font-semibold">{loan.collateralAmount} ETH</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-300">Health Factor</label>
                    <div className={`font-semibold ${parseFloat(loan.healthFactor) < 1.1 ? 'text-red-600' : 'text-green-600'}`}>
                      {(parseFloat(loan.healthFactor) / 10000).toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-300">LTV</label>
                    <div className="font-semibold">{(parseFloat(loan.currentLTV) / 100).toFixed(1)}%</div>
                  </div>
                </div>

                {activeTab === "borrowed" && loan.status === 2 && (
                  <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-medium">Monthly Payment</span>
                      <span className="text-lg font-bold">
                        {calculateMonthlyPayment(loan.outstandingDebt)} USDT
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Your USDT Balance: {parseFloat(usdtBalance).toFixed(2)}
                      </span>
                    </div>
                    <Button 
                      onClick={() => handleMakePayment(loan.loanId, calculateMonthlyPayment(loan.outstandingDebt))}
                      disabled={isWritePending || parseFloat(usdtBalance) < parseFloat(calculateMonthlyPayment(loan.outstandingDebt))}
                      className="w-full"
                    >
                      {isWritePending ? "Processing Payment..." : "Make Payment"}
                    </Button>
                  </div>
                )}

                {activeTab === "lent" && (
                  <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-300">Borrower:</span>
                        <div className="font-mono text-xs">
                          {`${loan.borrower.slice(0, 10)}...${loan.borrower.slice(-8)}`}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-300">Expected Monthly:</span>
                        <div className="font-semibold">
                          {calculateMonthlyPayment(loan.outstandingDebt)} USDT
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {loan.status === 1 && activeTab === "borrowed" && (
                  <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg">
                    <div className="text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>Waiting for Lender:</strong> Your loan proposal is pending acceptance. 
                      Once accepted, you'll need to add {loan.collateralAmount} ETH as collateral.
                    </div>
                  </div>
                )}

                {loan.status === 4 && (
                  <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg">
                    <div className="text-sm text-red-800 dark:text-red-200">
                      <strong>Loan Defaulted:</strong> This loan has been liquidated due to insufficient collateral.
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}