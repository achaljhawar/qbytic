import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';

const client = createPublicClient({
  transport: http('http://127.0.0.1:8545')
});

export async function POST(request: NextRequest) {
  try {
    const { address, abi, functionName, args } = await request.json();

    const result = await client.readContract({
      address,
      abi,
      functionName,
      args
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Contract call error:', error);
    return NextResponse.json(
      { error: 'Contract call failed' },
      { status: 500 }
    );
  }
}