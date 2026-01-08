'use client';

import { useState, useEffect, useRef, useContext } from 'react';
import { User, LogOut, LayoutDashboard, Edit3, Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { EditorContext } from './inline-editor/InlineEditorProvider';

interface UserMenuProps {
  // Ak sme na stránke partnera, tieto props sú vyplnené
  partnerSlug?: string;
  isOwner?: boolean;
}

export function UserMenu({
  partnerSlug,
  isOwner = false
}: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  // Získaj editor context (môže byť null ak nie sme v InlineEditorProvider)
  const editorContext = useContext(EditorContext);
  const isEditMode = editorContext?.isEditMode ?? false;
  const toggleEditMode = editorContext?.toggleEditMode;

  // Auth state detection
  useEffect(() => {
    const supabase = createClient();

    // Get initial user
    supabase.auth.getUser()
      .then(({ data: { user } }) => setUser(user))
      .catch(() => {}) // Silent fail - user ostane null
      .finally(() => setIsLoading(false));

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setIsOpen(false);
    // Use the signout route
    window.location.href = '/partner/auth/signout';
  };

  const handleToggleEdit = () => {
    if (toggleEditMode) {
      toggleEditMode();
    }
    setIsOpen(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Rozlíšiť typy chýb
        if (error.message.includes('Invalid login') || error.message.includes('invalid_credentials')) {
          setLoginError('Nesprávny email alebo heslo');
        } else {
          setLoginError('Chyba pripojenia. Skúste znova.');
        }
      } else {
        // Úspešné prihlásenie - vyčistiť formulár
        setEmail('');
        setPassword('');
        // User state sa aktualizuje automaticky cez onAuthStateChange
      }
    } catch {
      setLoginError('Chyba siete. Skontrolujte pripojenie.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="relative z-[200]" ref={menuRef}>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="home-button flex items-center justify-center relative"
        title={user ? 'Môj účet' : 'Prihlásiť sa'}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <User className="h-4 w-4 text-[#1a1a1a]" />
        {/* Green dot indicator when logged in */}
        {!isLoading && user && (
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#f5a623]" />
        )}
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className={`absolute right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-[100] ${user ? 'w-56' : 'w-64'}`}>
          {isLoading ? (
            <div className="px-4 py-3 text-sm text-gray-500">Načítavam...</div>
          ) : user ? (
            <>
              {/* User info */}
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.email}
                </p>
                <p className="text-xs text-gray-500">Prihlásený</p>
              </div>

              {/* Owner on their page - show live edit toggle */}
              {isOwner && partnerSlug && toggleEditMode ? (
                <>
                  {/* Live edit toggle */}
                  <button
                    onClick={handleToggleEdit}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {isEditMode ? (
                      <>
                        <EyeOff className="w-4 h-4 text-yellow-600" />
                        <span>Ukončiť live úpravy</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 text-green-600" />
                        <span>Live úpravy</span>
                      </>
                    )}
                  </button>

                  {/* Editor page link */}
                  <Link
                    href={`/partner/edit/${partnerSlug}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Edit3 className="w-4 h-4 text-gray-500" />
                    Editor stránky
                  </Link>

                  <div className="border-t border-gray-100 my-1" />

                  {/* Dashboard link */}
                  <Link
                    href="/partner"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-gray-500" />
                    Dashboard
                  </Link>
                </>
              ) : (
                <>
                  {/* Not on own page - show dashboard with hint about live edit */}
                  <Link
                    href="/partner"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-gray-500" />
                    <div>
                      <span>Moje taxislužby</span>
                      <p className="text-xs text-gray-400">Spravovať profily</p>
                    </div>
                  </Link>
                </>
              )}

              <div className="border-t border-gray-100 my-1" />

              {/* Sign out */}
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Odhlásiť sa
              </button>
            </>
          ) : (
            <div className="px-4 py-3">
              {/* Login form */}
              <form onSubmit={handleLogin} className="space-y-3" autoComplete="on">
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    required
                    disabled={isLoggingIn}
                    autoComplete="email"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    name="password"
                    placeholder="Heslo"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    required
                    disabled={isLoggingIn}
                    autoComplete="current-password"
                  />
                </div>

                {loginError && (
                  <p className="text-xs text-red-600">{loginError}</p>
                )}

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-2 px-4 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Prihlasujem...
                    </>
                  ) : (
                    'Prihlásiť sa'
                  )}
                </button>

                <Link
                  href="/partner/login"
                  onClick={() => setIsOpen(false)}
                  className="block text-center text-xs text-gray-500 hover:text-yellow-600 mt-2"
                >
                  Zabudol som heslo
                </Link>
              </form>

            </div>
          )}
        </div>
      )}
    </div>
  );
}
