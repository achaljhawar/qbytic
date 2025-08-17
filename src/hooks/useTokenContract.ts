import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { USDT_CONTRACT_ADDRESS, USDC_CONTRACT_ADDRESS, ERC20_ABI, LENDING_CONTRACT_ADDRESS } from '~/config/contracts';

export function useTokenContract(tokenAddress: string) {
  const { address } = useAccount();
  const { writeContract, data: hash, isPending: isWritePending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  // Read token info
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, LENDING_CONTRACT_ADDRESS] : undefined,
    query: { enabled: !!address }
  });

  const { data: decimals } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'decimals'
  });

  const { data: symbol } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'symbol'
  });

  // Write functions
  const approve = async (amount: string) => {
    if (!address || !decimals) throw new Error('Wallet not connected or token info not loaded');
    
    const amountWei = parseUnits(amount, decimals);
    
    writeContract({
      address: tokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [LENDING_CONTRACT_ADDRESS, amountWei]
    });
  };

  const faucet = async (amount: string) => {
    if (!address || !decimals) throw new Error('Wallet not connected or token info not loaded');
    
    const amountWei = parseUnits(amount, decimals);
    
    writeContract({
      address: tokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'faucet',
      args: [amountWei]
    });
  };

  return {
    // Token info
    balance: balance && decimals ? formatUnits(balance, decimals) : '0',
    allowance: allowance && decimals ? formatUnits(allowance, decimals) : '0',
    decimals: decimals || 18,
    symbol: symbol || 'TOKEN',
    
    // Write functions
    approve,
    faucet,
    
    // Transaction state
    isWritePending,
    isConfirming,
    isConfirmed,
    hash,
    
    // Refetch functions
    refetchBalance,
    refetchAllowance
  };
}

export function useUSDTContract() {
  return useTokenContract(USDT_CONTRACT_ADDRESS);
}

export function useUSDCContract() {
  return useTokenContract(USDC_CONTRACT_ADDRESS);
}