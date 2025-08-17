import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, parseUnits, formatUnits, formatEther } from 'viem';
import { LENDING_CONTRACT_ADDRESS, LENDING_CONTRACT_ABI, USDT_CONTRACT_ADDRESS, ERC20_ABI, LOAN_STATUSES, type LoanStatus } from '~/config/contracts';

export interface LoanDetails {
  loanId: number;
  borrower: string;
  lender: string;
  collateralAmount: string;
  outstandingDebt: string;
  currentLTV: string;
  healthFactor: string;
  status: LoanStatus;
  collateralDeposited: boolean;
  proposalExpiration: number;
}

export function useLendingContract() {
  const { address } = useAccount();
  const { writeContract, data: hash, isPending: isWritePending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  // Read functions
  const { data: activeLoanRequests, refetch: refetchActiveLoans } = useReadContract({
    address: LENDING_CONTRACT_ADDRESS,
    abi: LENDING_CONTRACT_ABI,
    functionName: 'getActiveLoanRequests',
    query: { refetchInterval: 5000 }
  });

  const { data: ethPrice } = useReadContract({
    address: LENDING_CONTRACT_ADDRESS,
    abi: LENDING_CONTRACT_ABI,
    functionName: 'getETHPrice'
  });

  // Helper functions
  const proposeLoan = async (borrowAmount: string, duration: number, creditScore: number) => {
    if (!address) throw new Error('Wallet not connected');
    
    const borrowAmountWei = parseUnits(borrowAmount, 6); // USDT has 6 decimals
    const durationSeconds = duration * 24 * 60 * 60; // Convert days to seconds
    
    await writeContract({
      address: LENDING_CONTRACT_ADDRESS,
      abi: LENDING_CONTRACT_ABI,
      functionName: 'proposeLoan',
      args: [borrowAmountWei, BigInt(durationSeconds), USDT_CONTRACT_ADDRESS, BigInt(creditScore)]
    });
  };

  const acceptLoan = async (loanId: number) => {
    if (!address) throw new Error('Wallet not connected');
    
    writeContract({
      address: LENDING_CONTRACT_ADDRESS,
      abi: LENDING_CONTRACT_ABI,
      functionName: 'acceptLoan',
      args: [BigInt(loanId)]
    });
  };

  const activateLoan = async (loanId: number, collateralAmount: string) => {
    if (!address) throw new Error('Wallet not connected');
    
    writeContract({
      address: LENDING_CONTRACT_ADDRESS,
      abi: LENDING_CONTRACT_ABI,
      functionName: 'activateLoan',
      args: [BigInt(loanId)],
      value: parseEther(collateralAmount)
    });
  };

  const makePayment = async (loanId: number) => {
    if (!address) throw new Error('Wallet not connected');
    
    writeContract({
      address: LENDING_CONTRACT_ADDRESS,
      abi: LENDING_CONTRACT_ABI,
      functionName: 'makePayment',
      args: [BigInt(loanId)]
    });
  };

  const calculateRequiredCollateral = async (borrowAmount: string, creditScore: number) => {
    const borrowAmountWei = parseUnits(borrowAmount, 6);
    const result = await fetch('/api/contract-call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address: LENDING_CONTRACT_ADDRESS,
        abi: LENDING_CONTRACT_ABI,
        functionName: 'calculateRequiredCollateral',
        args: [borrowAmountWei, BigInt(creditScore)]
      })
    }).then(res => res.json());
    
    return result;
  };

  const getLoanDetails = async (loanId: number): Promise<LoanDetails | null> => {
    try {
      const result = await fetch('/api/contract-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: LENDING_CONTRACT_ADDRESS,
          abi: LENDING_CONTRACT_ABI,
          functionName: 'getLoanDetails',
          args: [BigInt(loanId)]
        })
      }).then(res => res.json());

      if (!result) return null;

      return {
        loanId,
        borrower: result[0],
        lender: result[1],
        collateralAmount: formatEther(result[2]),
        outstandingDebt: formatUnits(result[3], 6),
        currentLTV: result[4].toString(),
        healthFactor: result[5].toString(),
        status: result[6] as LoanStatus,
        collateralDeposited: result[7],
        proposalExpiration: Number(result[8])
      };
    } catch (error) {
      console.error('Error fetching loan details:', error);
      return null;
    }
  };

  return {
    // Write functions
    proposeLoan,
    acceptLoan,
    activateLoan,
    makePayment,
    
    // Read functions
    activeLoanRequests: activeLoanRequests as bigint[] || [],
    ethPrice: '4403',
    getLoanDetails,
    calculateRequiredCollateral,
    
    // Transaction state
    isWritePending,
    isConfirming,
    isConfirmed,
    hash,
    
    // Utility
    refetchActiveLoans
  };
}