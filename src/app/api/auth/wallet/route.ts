import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '~/server/db';
import { users, accounts, sessions } from '~/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json() as { address: string };

    if (!address || typeof address !== 'string') {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    // Check if user already exists with this wallet address
    const user = await db.query.users.findFirst({
      where: eq(users.email, address.toLowerCase()),
    });

    let userId: string;

    if (!user) {
      // Create new user
      const newUser = await db
        .insert(users)
        .values({
          email: address.toLowerCase(),
          name: `User ${address.slice(0, 6)}...${address.slice(-4)}`,
          emailVerified: new Date(),
        })
        .returning();

      userId = newUser[0]!.id;

      // Create account record
      await db.insert(accounts).values({
        userId,
        type: 'oauth' as const,
        provider: 'wallet',
        providerAccountId: address.toLowerCase(),
      });
    } else {
      userId = user.id;
      
      // Check if account exists, create if not
      const existingAccount = await db.query.accounts.findFirst({
        where: and(
          eq(accounts.providerAccountId, address.toLowerCase()),
          eq(accounts.provider, 'wallet')
        ),
      });
      
      if (!existingAccount) {
        await db.insert(accounts).values({
          userId,
          type: 'oauth' as const,
          provider: 'wallet',
          providerAccountId: address.toLowerCase(),
        });
      }
    }

    // Create session
    const sessionToken = crypto.randomUUID();
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await db.insert(sessions).values({
      sessionToken,
      userId,
      expires,
    });

    // Set session cookie (NextAuth v5 cookie name)
    const cookieStore = await cookies();
    const cookieName = process.env.NODE_ENV === 'production' 
      ? '__Secure-authjs.session-token' 
      : 'authjs.session-token';
    
    cookieStore.set(cookieName, sessionToken, {
      expires,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return NextResponse.json({ 
      success: true, 
      user: { id: userId, address: address.toLowerCase() } 
    });
  } catch (error) {
    console.error('Error creating wallet session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}