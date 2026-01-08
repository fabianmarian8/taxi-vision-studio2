'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PartnerDraft {
  id: string;
  status: string;
  company_name: string | null;
  description: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  hero_image_url: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  services: string[] | null;
  gallery: string[] | null;
  social_facebook: string | null;
  social_instagram: string | null;
  admin_notes: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  partners: {
    id: string;
    name: string;
    slug: string;
    city_slug: string;
    email: string;
  };
}

export default function PartnerDraftsPage() {
  const [drafts, setDrafts] = useState<PartnerDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDraft, setSelectedDraft] = useState<PartnerDraft | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');

  const fetchDrafts = async (status: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/partner-drafts?status=${status}`);
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setDrafts(data.drafts || []);
      }
    } catch (err) {
      setError('Chyba pri načítaní dát');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDrafts(activeTab);
  }, [activeTab]);

  const handleAction = async (action: 'approve' | 'reject') => {
    if (!selectedDraft) return;

    setProcessing(true);
    try {
      const res = await fetch(`/api/admin/partner-drafts/${selectedDraft.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, admin_notes: adminNotes }),
      });
      const data = await res.json();

      if (data.success) {
        setSelectedDraft(null);
        setAdminNotes('');
        fetchDrafts(activeTab);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Chyba pri spracovaní');
    }
    setProcessing(false);
  };

  const statusLabels: Record<string, { label: string; color: string }> = {
    pending: { label: 'Čaká na schválenie', color: 'bg-yellow-100 text-yellow-700' },
    approved: { label: 'Schválené', color: 'bg-green-100 text-green-700' },
    rejected: { label: 'Zamietnuté', color: 'bg-red-100 text-red-700' },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-muted-foreground hover:text-foreground">
              ← Späť
            </Link>
            <h1 className="text-2xl font-bold">Partner úpravy</h1>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex gap-2 border-b">
          {(['pending', 'approved', 'rejected'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {statusLabels[tab].label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8 text-gray-500">Načítavam...</div>
        ) : drafts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Žiadne {activeTab === 'pending' ? 'čakajúce' : activeTab === 'approved' ? 'schválené' : 'zamietnuté'} úpravy
          </div>
        ) : (
          <div className="grid gap-4">
            {drafts.map((draft) => (
              <Card
                key={draft.id}
                className={`cursor-pointer hover:shadow-md transition-shadow ${
                  selectedDraft?.id === draft.id ? 'ring-2 ring-purple-500' : ''
                }`}
                onClick={() => setSelectedDraft(draft)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{draft.partners?.name || 'Neznámy partner'}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {draft.partners?.city_slug} • {draft.partners?.email}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusLabels[draft.status].color}`}>
                      {statusLabels[draft.status].label}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Názov:</p>
                      <p className="font-medium">{draft.company_name || '-'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Telefón:</p>
                      <p className="font-medium">{draft.phone || '-'}</p>
                    </div>
                    {draft.submitted_at && (
                      <div>
                        <p className="text-muted-foreground">Odoslané:</p>
                        <p className="font-medium">
                          {new Date(draft.submitted_at).toLocaleDateString('sk-SK')}
                        </p>
                      </div>
                    )}
                    {draft.services && draft.services.length > 0 && (
                      <div className="col-span-2">
                        <p className="text-muted-foreground mb-1">Služby:</p>
                        <div className="flex flex-wrap gap-1">
                          {draft.services.map((service) => (
                            <span
                              key={service}
                              className="px-2 py-0.5 bg-gray-100 rounded text-xs"
                            >
                              {service}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        {selectedDraft && activeTab === 'pending' && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle>{selectedDraft.partners?.name}</CardTitle>
                  <button
                    onClick={() => setSelectedDraft(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Preview */}
                {selectedDraft.hero_image_url && (
                  <div className="rounded-lg overflow-hidden aspect-video bg-gray-100">
                    <img
                      src={selectedDraft.hero_image_url}
                      alt="Hero"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Názov</p>
                    <p className="font-medium">{selectedDraft.company_name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Telefón</p>
                    <p className="font-medium">{selectedDraft.phone || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedDraft.email || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Web</p>
                    <p className="font-medium">{selectedDraft.website || '-'}</p>
                  </div>
                </div>

                {selectedDraft.description && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Popis</p>
                    <p className="text-sm">{selectedDraft.description}</p>
                  </div>
                )}

                {/* Gallery */}
                {selectedDraft.gallery && selectedDraft.gallery.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Galéria ({selectedDraft.gallery.length} obrázkov)
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedDraft.gallery.map((url, idx) => (
                        <div key={idx} className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                          <img
                            src={url}
                            alt={`Galéria ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Social Links */}
                {(selectedDraft.social_facebook || selectedDraft.social_instagram) && (
                  <div className="grid grid-cols-2 gap-4">
                    {selectedDraft.social_facebook && (
                      <div>
                        <p className="text-sm text-muted-foreground">Facebook</p>
                        <a href={selectedDraft.social_facebook} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate block">
                          {selectedDraft.social_facebook}
                        </a>
                      </div>
                    )}
                    {selectedDraft.social_instagram && (
                      <div>
                        <p className="text-sm text-muted-foreground">Instagram</p>
                        <a href={selectedDraft.social_instagram} target="_blank" rel="noopener noreferrer" className="text-sm text-pink-600 hover:underline truncate block">
                          {selectedDraft.social_instagram}
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Admin notes */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Poznámka pre partnera (voliteľné)
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg resize-none"
                    rows={3}
                    placeholder="Dôvod zamietnutia alebo poznámky..."
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    onClick={() => handleAction('approve')}
                    disabled={processing}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {processing ? 'Spracúvam...' : 'Schváliť'}
                  </Button>
                  <Button
                    onClick={() => handleAction('reject')}
                    disabled={processing}
                    variant="destructive"
                    className="flex-1"
                  >
                    {processing ? 'Spracúvam...' : 'Zamietnuť'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
