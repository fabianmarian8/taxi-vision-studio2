'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

// Helper to translate Supabase errors to Slovak
function translateError(error: { message: string; status?: number }): string {
  const msg = error.message.toLowerCase();

  // Rate limit errors
  if (msg.includes('rate limit') || msg.includes('too many requests') || error.status === 429) {
    return 'Príliš veľa pokusov. Počkajte prosím minútu a skúste znova.';
  }

  // Email not found / user not found
  if (msg.includes('user not found') || msg.includes('no user found')) {
    return 'Používateľ s týmto emailom neexistuje.';
  }

  // Signups not allowed
  if (msg.includes('signups not allowed') || msg.includes('signup')) {
    return 'Registrácia nie je povolená. Kontaktujte administrátora.';
  }

  // Invalid credentials
  if (msg.includes('invalid login credentials') || msg.includes('invalid password')) {
    return 'Nesprávny email alebo heslo.';
  }

  // OTP expired
  if (msg.includes('expired') || msg.includes('token has expired')) {
    return 'Kód vypršal. Vyžiadajte si nový kód.';
  }

  // Invalid OTP
  if (msg.includes('invalid') && msg.includes('otp')) {
    return 'Nesprávny overovací kód.';
  }

  // Network errors
  if (msg.includes('network') || msg.includes('fetch') || msg.includes('failed to fetch')) {
    return 'Chyba siete. Skontrolujte pripojenie k internetu.';
  }

  // Email sending failed
  if (msg.includes('email') && (msg.includes('send') || msg.includes('deliver'))) {
    return 'Nepodarilo sa odoslať email. Skúste to znova neskôr.';
  }

  // Default - return original message
  return error.message;
}

export default function PartnerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loginMode, setLoginMode] = useState<'password' | 'otp'>('password');
  const [otpSent, setOtpSent] = useState(false);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage({ type: 'error', text: translateError(error) });
      } else {
        router.push('/partner');
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Neočakávaná chyba. Skúste to znova.' });
    }

    setLoading(false);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const supabase = createClient();

      // Create a promise that rejects after 15 seconds
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Časový limit vypršal. Server neodpovedá.')), 15000);
      });

      // Send OTP code (not magic link)
      const otpPromise = supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false, // Don't create new users, only existing partners
        },
      });

      // Race between the OTP request and timeout
      const { error } = await Promise.race([otpPromise, timeoutPromise]) as { error: { message: string; status?: number } | null };

      if (error) {
        setMessage({ type: 'error', text: translateError(error) });
      } else {
        setOtpSent(true);
        setMessage({
          type: 'success',
          text: 'Kód bol odoslaný na váš email. Zadajte ho nižšie.',
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Neočakávaná chyba. Skúste to znova.';
      setMessage({ type: 'error', text: errorMessage });
    }

    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: 'email',
      });

      if (error) {
        setMessage({ type: 'error', text: translateError(error) });
      } else {
        router.push('/partner');
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Neočakávaná chyba. Skúste to znova.' });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Partner Portal</h1>
            <p className="text-gray-600 mt-2">
              Prihláste sa pre správu vašej taxislužby
            </p>
          </div>

          {/* Toggle buttons */}
          <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
            <button
              type="button"
              onClick={() => { setLoginMode('password'); setOtpSent(false); setMessage(null); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                loginMode === 'password'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Heslo
            </button>
            <button
              type="button"
              onClick={() => { setLoginMode('otp'); setMessage(null); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                loginMode === 'otp'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Email kód
            </button>
          </div>

          {/* Password Login Form */}
          {loginMode === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email adresa
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vas@email.sk"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Heslo
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Vaše heslo"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              {message && (
                <div
                  className={`p-4 rounded-lg ${
                    message.type === 'success'
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 focus:ring-4 focus:ring-purple-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Prihlasujem...
                  </span>
                ) : (
                  'Prihlásiť sa'
                )}
              </button>

              <button
                type="button"
                onClick={() => { setLoginMode('otp'); setMessage({ type: 'success', text: 'Zadajte váš email a pošleme vám prihlasovací kód.' }); }}
                className="w-full text-purple-600 py-2 text-sm hover:underline"
              >
                Zabudol som heslo
              </button>
            </form>
          )}

          {/* OTP Login Form */}
          {loginMode === 'otp' && !otpSent && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label htmlFor="email-otp" className="block text-sm font-medium text-gray-700 mb-2">
                  Email adresa
                </label>
                <input
                  id="email-otp"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vas@email.sk"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              {message && (
                <div
                  className={`p-4 rounded-lg ${
                    message.type === 'success'
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 focus:ring-4 focus:ring-purple-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Odosielam...
                  </span>
                ) : (
                  'Poslať prihlasovací kód'
                )}
              </button>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500 text-center">
                  Na váš email príde 6-miestny kód, ktorým sa prihlásite.
                </p>
              </div>
            </form>
          )}

          {/* OTP Verification Form */}
          {loginMode === 'otp' && otpSent && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600">
                  Kód bol odoslaný na <span className="font-medium">{email}</span>
                </p>
              </div>

              <div>
                <label htmlFor="otp-code" className="block text-sm font-medium text-gray-700 mb-2">
                  Overovací kód
                </label>
                <input
                  id="otp-code"
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  required
                  maxLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-center text-2xl tracking-widest font-mono"
                />
              </div>

              {message && (
                <div
                  className={`p-4 rounded-lg ${
                    message.type === 'success'
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || otpCode.length !== 6}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 focus:ring-4 focus:ring-purple-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Overujem...
                  </span>
                ) : (
                  'Overiť a prihlásiť'
                )}
              </button>

              <button
                type="button"
                onClick={() => { setOtpSent(false); setOtpCode(''); setMessage(null); }}
                className="w-full text-purple-600 py-2 text-sm hover:underline"
              >
                Použiť iný email
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          &copy; {new Date().getFullYear()} Taxi Vision Studio
        </p>
      </div>
    </div>
  );
}
