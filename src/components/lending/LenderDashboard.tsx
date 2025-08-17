"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { LoadingSpinner } from "~/components/ui/loading-spinner";
import { useLendingContract, type LoanDetails } from "~/hooks/useLendingContract";
import { useUSDTContract } from "~/hooks/useTokenContract";
import { LOAN_STATUSES } from "~/config/contracts";

interface LoanWithCreditScore extends LoanDetails {
  borrowerCreditScore?: number;
  isLoadingCreditScore?: boolean;
}

export function LenderDashboard() {
  const [loans, setLoans] = useState<LoanWithCreditScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState<LoanWithCreditScore | null>(null);
  
  const { activeLoanRequests, getLoanDetails, acceptLoan, isWritePending } = useLendingContract();
  const { balance: usdtBalance, approve, allowance, faucet } = useUSDTContract();

  // Fetch loan details and credit scores
  useEffect(() => {
    const fetchLoansData = async () => {
      if (!activeLoanRequests.length) {
        setIsLoading(false);
        return;
      }

      const loanPromises = activeLoanRequests.map(async (loanId) => {
        const loanDetails = await getLoanDetails(Number(loanId));
        if (!loanDetails) return null;

        // Fetch credit score for borrower
        const loanWithCreditScore: LoanWithCreditScore = {
          ...loanDetails,
          isLoadingCreditScore: true
        };

        // Fetch credit score in background
        fetchCreditScore(loanDetails.borrower).then((creditScore) => {
          setLoans(prev => prev.map(loan => 
            loan.loanId === loanDetails.loanId 
              ? { ...loan, borrowerCreditScore: creditScore, isLoadingCreditScore: false }
              : loan
          ));
        });

        return loanWithCreditScore;
      });

      const resolvedLoans = (await Promise.all(loanPromises)).filter(Boolean) as LoanWithCreditScore[];
      setLoans(resolvedLoans);
      setIsLoading(false);
    };

    fetchLoansData();
  }, [activeLoanRequests, getLoanDetails]);

  const fetchCreditScore = async (borrowerAddress: string): Promise<number | undefined> => {
    try {
      const response = await fetch(`http://localhost:8001/api/credit-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: borrowerAddress })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.credit_data) {
          return Math.floor(data.credit_data.basic_credit_score * 1000);
        }
      }
    } catch (error) {
      console.error('Error fetching credit score:', error);
    }
    return undefined;
  };

  const handleAcceptLoan = async (loan: LoanWithCreditScore) => {
    try {
      // Check if we need approval
      const loanAmount = parseFloat(loan.outstandingDebt || "0");
      const currentAllowance = parseFloat(allowance);
      
      if (currentAllowance < loanAmount) {
        // Need to approve first
        await approve(loan.outstandingDebt || "0");
        return;
      }
      
      await acceptLoan(loan.loanId);
    } catch (error) {
      console.error('Error accepting loan:', error);
    }
  };

  const getCreditScoreColor = (score?: number) => {
    if (!score) return "text-gray-500";
    if (score >= 750) return "text-green-600 dark:text-green-400";
    if (score >= 650) return "text-yellow-600 dark:text-yellow-400";
    if (score >= 550) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  const getCreditScoreLabel = (score?: number) => {
    if (!score) return "Unknown";
    if (score >= 750) return "Excellent";
    if (score >= 650) return "Good";
    if (score >= 550) return "Fair";
    return "Poor";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Lender Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600 dark:text-gray-300">USDT Balance</div>
            <div className="text-2xl font-bold">{parseFloat(usdtBalance).toFixed(2)}</div>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => faucet("1000")}
              className="mt-2"
            >
              Get Test USDT
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600 dark:text-gray-300">Available Loans</div>
            <div className="text-2xl font-bold">{loans.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600 dark:text-gray-300">Avg Interest Rate</div>
            <div className="text-2xl font-bold">8.5%</div>
          </CardContent>
        </Card>
      </div>

      {/* Available Loans */}
      <Card>
        <CardHeader>
          <CardTitle>Available Loan Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {loans.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No loan requests available at the moment.
            </div>
          ) : (
            <div className="space-y-4">
              {loans.map((loan) => (
                <div key={loan.loanId} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-4">
                        <span className="font-semibold">Loan #{loan.loanId}</span>
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm">
                          {LOAN_STATUSES[loan.status]}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        Borrower: {`${loan.borrower.slice(0, 6)}...${loan.borrower.slice(-4)}`}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold">{loan.outstandingDebt} USDT</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        Collateral: {loan.collateralAmount} ETH
                      </div>
                    </div>
                  </div>

                  {/* Credit Score Display */}
                  <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Borrower Credit Score:</span>
                      {loan.isLoadingCreditScore ? (
                        <LoadingSpinner />
                      ) : loan.borrowerCreditScore ? (
                        <div className="text-right">
                          <div className={`text-lg font-bold ${getCreditScoreColor(loan.borrowerCreditScore)}`}>
                            {loan.borrowerCreditScore}
                          </div>
                          <div className={`text-sm ${getCreditScoreColor(loan.borrowerCreditScore)}`}>
                            {getCreditScoreLabel(loan.borrowerCreditScore)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-500">Unable to fetch</span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-gray-600 dark:text-gray-300">Interest Rate:</span>
                      <div className="font-medium">
                        {loan.borrowerCreditScore && loan.borrowerCreditScore >= 750 ? "5%" : 
                         loan.borrowerCreditScore && loan.borrowerCreditScore >= 650 ? "7.5%" : 
                         loan.borrowerCreditScore && loan.borrowerCreditScore >= 550 ? "10%" : "15%"} APR
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-300">LTV:</span>
                      <div className="font-medium">{loan.currentLTV}</div>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-300">Health Factor:</span>
                      <div className="font-medium">{loan.healthFactor}</div>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-300">Expires:</span>
                      <div className="font-medium">
                        {new Date(loan.proposalExpiration * 1000).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => handleAcceptLoan(loan)}
                      disabled={isWritePending}
                      className="flex-1"
                    >
                      {isWritePending ? "Processing..." : "Accept Loan"}
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setSelectedLoan(loan)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loan Details Modal */}
      {selectedLoan && (
        <Card className="fixed inset-0 z-50 m-4 max-w-2xl mx-auto my-auto h-fit bg-white dark:bg-gray-900 shadow-xl">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              Loan Details #{selectedLoan.loanId}
              <Button 
                variant="ghost" 
                onClick={() => setSelectedLoan(null)}
                className="h-8 w-8 p-0"
              >
                ×
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Borrower Address</label>
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono">
                  {selectedLoan.borrower}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Loan Amount</label>
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
                  {selectedLoan.outstandingDebt} USDT
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Collateral Amount</label>
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
                  {selectedLoan.collateralAmount} ETH
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Credit Score</label>
                <div className={`p-2 bg-gray-100 dark:bg-gray-800 rounded font-bold ${getCreditScoreColor(selectedLoan.borrowerCreditScore)}`}>
                  {selectedLoan.borrowerCreditScore || "Unknown"} - {getCreditScoreLabel(selectedLoan.borrowerCreditScore)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}