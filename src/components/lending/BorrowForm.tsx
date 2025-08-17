"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { LoadingSpinner } from "~/components/ui/loading-spinner";
import { useLendingContract } from "~/hooks/useLendingContract";

export function BorrowForm() {
  const { address } = useAccount();
  const [borrowAmount, setBorrowAmount] = useState("");
  const [duration, setDuration] = useState(30);
  const [creditScore] = useState<number>(813);
  const [requiredCollateral, setRequiredCollateral] = useState<string>("");
  const [step, setStep] = useState<"form" | "collateral">("form");
  const [proposedLoanId, setProposedLoanId] = useState<number | null>(null);

  const { proposeLoan, activateLoan, ethPrice, isWritePending, isConfirmed } = useLendingContract();


  // Calculate required collateral
  useEffect(() => {
    if (borrowAmount && creditScore && ethPrice) {
      const calculateCollateral = async () => {
        try {
          // Simplified calculation: (borrowAmount * collateralRatio) / ethPrice
          let collateralRatio = 1.75; // 175% for low credit
          if (creditScore >= 750) collateralRatio = 1.30; // 130% for excellent
          else if (creditScore >= 650) collateralRatio = 1.40; // 140% for good
          else if (creditScore >= 550) collateralRatio = 1.50; // 150% for fair
          
          const collateralUSD = parseFloat(borrowAmount) * collateralRatio;
          const collateralETH = collateralUSD / parseFloat(ethPrice);
          setRequiredCollateral(collateralETH.toFixed(6));
        } catch (error) {
          console.error('Error calculating collateral:', error);
        }
      };
      
      calculateCollateral();
    }
  }, [borrowAmount, creditScore, ethPrice]);

  const handleProposeLoan = async () => {
    if (!borrowAmount) return;
    
    try {
      await proposeLoan(borrowAmount, duration, creditScore);
      // In a real app, you'd get the loan ID from the transaction receipt
      setProposedLoanId(1); // Placeholder
      setStep("collateral");
    } catch (error) {
      console.error('Error proposing loan:', error);
    }
  };

  const handleActivateLoan = async () => {
    if (!proposedLoanId || !requiredCollateral) return;
    
    try {
      await activateLoan(proposedLoanId, requiredCollateral);
    } catch (error) {
      console.error('Error activating loan:', error);
    }
  };


  if (step === "collateral") {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Add Collateral to Activate Loan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Loan Proposed Successfully!</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Your loan request has been created. Once a lender accepts it, you'll need to add collateral to activate the loan.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Borrow Amount</label>
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">{borrowAmount} USDT</div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Required Collateral</label>
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">{requiredCollateral} ETH</div>
            </div>
          </div>

          <div className="space-y-2">
            <Button 
              onClick={handleActivateLoan}
              disabled={isWritePending}
              className="w-full"
            >
              {isWritePending ? "Adding Collateral..." : "Add Collateral & Activate Loan"}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setStep("form")}
              className="w-full"
            >
              Back to Form
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Borrow USDT Against ETH</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium">Your Credit Score:</span>
            <span className="text-2xl font-bold text-green-600 dark:text-green-400">
              {creditScore}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Borrow Amount (USDT)
            </label>
            <input
              type="number"
              value={borrowAmount}
              onChange={(e) => setBorrowAmount(e.target.value)}
              placeholder="Enter amount to borrow"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Loan Duration (Days)
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            >
              <option value={30}>30 days</option>
              <option value={60}>60 days</option>
              <option value={90}>90 days</option>
              <option value={180}>180 days</option>
              <option value={365}>365 days</option>
            </select>
          </div>

          {borrowAmount && requiredCollateral && (
            <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Loan Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-300">Required Collateral:</span>
                  <div className="font-medium">{requiredCollateral} ETH</div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-300">Current ETH Price:</span>
                  <div className="font-medium">${parseFloat(ethPrice).toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-300">Interest Rate:</span>
                  <div className="font-medium">
                    {creditScore && creditScore >= 750 ? "5%" : 
                     creditScore && creditScore >= 650 ? "7.5%" : 
                     creditScore && creditScore >= 550 ? "10%" : "15%"} APR
                  </div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-300">Collateral Ratio:</span>
                  <div className="font-medium">
                    {creditScore && creditScore >= 750 ? "130%" : 
                     creditScore && creditScore >= 650 ? "140%" : 
                     creditScore && creditScore >= 550 ? "150%" : "175%"}
                  </div>
                </div>
              </div>
            </div>
          )}

          <Button 
            onClick={handleProposeLoan}
            disabled={!borrowAmount || isWritePending}
            className="w-full"
          >
            {isWritePending ? "Proposing Loan..." : "Propose Loan"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}