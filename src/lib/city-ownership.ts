import { createClient } from '@/lib/supabase/server';

// Superadmin emails - can edit ALL city pages
const SUPERADMIN_EMAILS = [
  'fabianmarian8@gmail.com',
  'fabianmarian8@users.noreply.github.com',
];

export interface CityOwnershipResult {
  isAdmin: boolean;
  userId: string | null;
  userEmail: string | null;
}

/**
 * Check if the current user is a superadmin who can edit city pages
 */
export async function checkCityEditAccess(): Promise<CityOwnershipResult> {
  const defaultResult: CityOwnershipResult = {
    isAdmin: false,
    userId: null,
    userEmail: null,
  };

  try {
    // During static generation, cookies() will throw - return default
    let supabase;
    try {
      supabase = await createClient();
    } catch {
      // Static generation - no cookies available
      return defaultResult;
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return defaultResult;
    }

    // Check if user is superadmin
    const isSuperadmin = user.email && SUPERADMIN_EMAILS.includes(user.email.toLowerCase());

    return {
      isAdmin: isSuperadmin || false,
      userId: user.id,
      userEmail: user.email || null,
    };

  } catch (error) {
    console.error('[checkCityEditAccess] Error:', error);
    return defaultResult;
  }
}
