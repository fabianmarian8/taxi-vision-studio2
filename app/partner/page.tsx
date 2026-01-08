import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { PasswordSettings } from './PasswordSettings';

export default async function PartnerDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/partner/login');
  }

  // Get partner's taxi services
  const { data: partners, error } = await supabase
    .from('partners')
    .select(`
      *,
      partner_drafts (
        id,
        status,
        company_name,
        submitted_at,
        reviewed_at,
        updated_at
      )
    `)
    .eq('user_id', user.id);

  const statusLabels: Record<string, { label: string; color: string }> = {
    draft: { label: 'Rozpracované', color: 'bg-gray-100 text-gray-700' },
    pending: { label: 'Čaká na schválenie', color: 'bg-yellow-100 text-yellow-700' },
    approved: { label: 'Schválené', color: 'bg-green-100 text-green-700' },
    rejected: { label: 'Zamietnuté', color: 'bg-red-100 text-red-700' },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
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
              <div>
                <h1 className="text-xl font-bold text-gray-900">Partner Portal</h1>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <PasswordSettings />
              <form action="/partner/auth/signout" method="POST">
                <button
                  type="submit"
                  className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                >
                  Odhlásiť sa
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Vaše taxislužby</h2>
          <p className="text-gray-600 mt-1">
            Spravujte informácie o vašich taxislužbách
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
            Chyba pri načítaní dát: {error.message}
          </div>
        )}

        {partners && partners.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Žiadne taxislužby
            </h3>
            <p className="text-gray-500">
              Zatiaľ nemáte priradenú žiadnu taxislužbu.
              <br />
              Kontaktujte administrátora pre pridanie vašej taxislužby.
            </p>
          </div>
        )}

        {partners && partners.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2">
            {partners.map((partner) => {
              // Sort drafts by updated_at descending and get the latest
              const sortedDrafts = [...(partner.partner_drafts || [])].sort(
                (a, b) => new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime()
              );
              const latestDraft = sortedDrafts[0];
              const status = latestDraft?.status || 'draft';
              const statusInfo = statusLabels[status];

              return (
                <div
                  key={partner.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {partner.name}
                        </h3>
                        <p className="text-sm text-gray-500">{partner.city_slug}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
                      >
                        {statusInfo.label}
                      </span>
                    </div>

                    {latestDraft?.submitted_at && (
                      <p className="text-sm text-gray-500 mb-4">
                        Odoslané:{' '}
                        {new Date(latestDraft.submitted_at).toLocaleDateString('sk-SK')}
                      </p>
                    )}

                    <div className="flex gap-3">
                      <Link
                        href={`/partner/edit/${partner.slug}`}
                        className="flex-1 bg-purple-600 text-white text-center py-2 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                      >
                        Upraviť
                      </Link>
                      <Link
                        href={`/taxi/${partner.city_slug}/${partner.slug}`}
                        target="_blank"
                        className="flex-1 relative bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 text-center py-2 px-4 rounded-lg font-bold hover:from-yellow-500 hover:to-orange-600 transition-all shadow-md hover:shadow-lg"
                      >
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                          NEW
                        </span>
                        LIVE úpravy
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
