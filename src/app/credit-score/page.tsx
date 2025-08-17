"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { LoadingSpinner } from "~/components/ui/loading-spinner";

export default function CreditScorePage() {
  const { address } = useAccount();
  const [creditScore, setCreditScore] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCreditScore = async () => {
      if (!address) {
        setIsLoading(false);
        setError("User address not found. Please connect your wallet.");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`http://localhost:8001/api/credit-score/${address}`);
        if (!response.ok) {
          throw new Error("Failed to fetch credit score.");
        }
        const data = await response.json();
        if (data.success && data.credit_data) {
          setCreditScore(data.credit_data.basic_credit_score);
        } else {
          throw new Error("Invalid API response.");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchCreditScore();
  }, [address]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Your Credit Score</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          {isLoading ? (
            <LoadingSpinner />
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : creditScore !== null ? (
            <div className="text-center">
              <p className="text-lg text-gray-600 dark:text-gray-300">Your Basic Credit Score is:</p>
              <p className="text-6xl font-bold text-primary">{creditScore.toFixed(3)}</p>
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">
              Could not retrieve credit score.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}