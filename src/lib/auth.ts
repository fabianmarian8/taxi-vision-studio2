import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

// Lazy initialization - only validate when actually used (not at build time)
function getSecretKey(): Uint8Array {
  if (!process.env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET environment variable is required');
  }
  return new TextEncoder().encode(process.env.SESSION_SECRET);
}

export interface SessionPayload {
  username: string;
  expiresAt: number;
}

export async function createSession(username: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const session = await new SignJWT({ username, expiresAt: expiresAt.getTime() })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(expiresAt)
    .sign(getSecretKey());

  const cookieStore = await cookies();
  cookieStore.set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });

  return session;
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;

  if (!session) return null;

  try {
    const { payload } = await jwtVerify(session, getSecretKey());
    return payload as unknown as SessionPayload;
  } catch (error) {
    console.error('Session verification failed:', error);
    return null;
  }
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}

export async function verifyCredentials(username: string, password: string): Promise<boolean> {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

  // Fallback to plain password for backwards compatibility (remove after migration)
  const adminPasswordPlain = process.env.ADMIN_PASSWORD;

  if (!adminUsername) {
    throw new Error('ADMIN_USERNAME environment variable is required');
  }

  if (!adminPasswordHash && !adminPasswordPlain) {
    throw new Error('ADMIN_PASSWORD_HASH or ADMIN_PASSWORD environment variable is required');
  }

  // Check username first
  if (username !== adminUsername) {
    return false;
  }

  // Use bcrypt hash if available, otherwise fall back to plain text (temporary)
  if (adminPasswordHash) {
    return bcrypt.compare(password, adminPasswordHash);
  }

  // Fallback for migration period - remove this after setting ADMIN_PASSWORD_HASH
  return password === adminPasswordPlain;
}
