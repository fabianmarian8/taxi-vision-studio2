'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { TrendingUp, TrendingDown, Users, Crown, Star, AlertTriangle, Download, DollarSign, Target, XCircle } from 'lucide-react';

interface Subscription {
  id: string;
  taxi_service_name: string;
  city_slug: string;
  plan_type: string;
  status: string;
  amount_cents: number;
  current_period_end: string;
  customer_email: string;
  customer_name?: string;
  created_at: string;
  updated_at: string;
}

interface SubscriptionEvent {
  id: string;
  event_type: string;
  created_at: string;
  subscriptions: Subscription;
}

interface MonthlyData {
  month: string;
  mrr: number;
  premium_count: number;
  partner_count: number;
}

interface RevenueData {
  mrr: number;
  subscriptions: {
    total: number;
    premium: number;
    partner: number;
  };
  expiring: {
    sevenDays: Subscription[];
    thirtyDays: Subscription[];
  };
  history: MonthlyData[];
  metrics: {
    newThisMonth: number;
    canceledThisMonth: number;
    churnRate: number;
  };
  // New fields
  arpu: number;
  ltv: number;
  failedPayments: Subscription[];
  allSubscriptions: Subscription[];
  recentEvents: {
    created: SubscriptionEvent[];
    canceled: SubscriptionEvent[];
  };
}

export function RevenueClient() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'new' | 'canceled'>('active');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const response = await fetch('/api/admin/revenue');
      if (!response.ok) throw new Error('Failed to fetch');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError('Nepodarilo sa nacitat data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const mrrChange = data.history.length >= 2
    ? ((data.history[data.history.length - 1]?.mrr || 0) - (data.history[data.history.length - 2]?.mrr || 0))
    : 0;

  // CSV Export function
  function exportToCSV() {
    if (!data?.allSubscriptions) return;

    const headers = ['Email', 'Meno', 'Plan', 'Suma', 'Mesto', 'Status', 'Od'];
    const rows = data.allSubscriptions.map(sub => [
      sub.customer_email || '',
      sub.customer_name || sub.taxi_service_name || '',
      sub.plan_type,
      (sub.amount_cents / 100).toFixed(2) + ' EUR',
      sub.city_slug || '',
      sub.status,
      new Date(sub.created_at).toLocaleDateString('sk-SK')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `predplatne_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }

  return (
    <div className="space-y-8">
      {/* Header with Export */}
      <div className="flex justify-end">
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* KPI Cards - Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* MRR Card */}
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader className="pb-2">
            <CardDescription>Monthly Recurring Revenue</CardDescription>
            <CardTitle className="text-3xl font-bold text-green-700">
              {data.mrr.toFixed(2)} EUR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm">
              {mrrChange >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span className={mrrChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                {mrrChange >= 0 ? '+' : ''}{mrrChange.toFixed(2)} EUR vs minuly mesiac
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Premium Count */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-purple-500" />
              Premium predplatne
            </CardDescription>
            <CardTitle className="text-3xl font-bold">{data.subscriptions.premium}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {(data.subscriptions.premium * 3.99).toFixed(2)} EUR/mesiac
            </p>
          </CardContent>
        </Card>

        {/* Partner Count */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              Partner predplatne
            </CardDescription>
            <CardTitle className="text-3xl font-bold">{data.subscriptions.partner}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {(data.subscriptions.partner * 8.99).toFixed(2)} EUR/mesiac
            </p>
          </CardContent>
        </Card>

        {/* Churn Rate */}
        <Card className={data.metrics.churnRate > 5 ? 'border-red-200 bg-red-50/50' : ''}>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Churn Rate
            </CardDescription>
            <CardTitle className="text-3xl font-bold">
              {data.metrics.churnRate.toFixed(1)}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              +{data.metrics.newThisMonth} novych, -{data.metrics.canceledThisMonth} zrusenych
            </p>
          </CardContent>
        </Card>
      </div>

      {/* KPI Cards - Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* ARPU */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-blue-500" />
              ARPU (Avg Revenue Per User)
            </CardDescription>
            <CardTitle className="text-3xl font-bold text-blue-700">
              {data.arpu?.toFixed(2) || '0.00'} EUR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Priemerny vynos na predplatitela
            </p>
          </CardContent>
        </Card>

        {/* LTV */}
        <Card className="border-indigo-200 bg-indigo-50/50">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Target className="h-4 w-4 text-indigo-500" />
              LTV (Lifetime Value)
            </CardDescription>
            <CardTitle className="text-3xl font-bold text-indigo-700">
              {data.ltv?.toFixed(2) || '0.00'} EUR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Celkova hodnota zakaznika
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MRR Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>MRR Trend (12 mesiacov)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.history}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickFormatter={(value) => {
                    const [year, month] = value.split('-');
                    return `${month}/${year.slice(2)}`;
                  }}
                />
                <YAxis tickFormatter={(v) => `${v}€`} />
                <Tooltip
                  formatter={(value: number) => [`${value.toFixed(2)} EUR`, 'MRR']}
                  labelFormatter={(label) => `Mesiac: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="mrr"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Subscriptions Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Pocet predplatnych</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.history}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickFormatter={(value) => {
                    const [year, month] = value.split('-');
                    return `${month}/${year.slice(2)}`;
                  }}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="premium_count" name="Premium" fill="#8b5cf6" />
                <Bar dataKey="partner_count" name="Partner" fill="#eab308" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Failed Payments Alert */}
      {data.failedPayments && data.failedPayments.length > 0 && (
        <Card className="border-red-300 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <XCircle className="h-5 w-5" />
              Zlyhane platby ({data.failedPayments.length})
            </CardTitle>
            <CardDescription className="text-red-600">
              Kontaktujte tychto zakaznikov - ich platba nepresla
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {data.failedPayments.map((sub) => (
                <div
                  key={sub.id}
                  className="flex justify-between items-center p-3 bg-white rounded-lg border border-red-200"
                >
                  <div>
                    <p className="font-medium">{sub.taxi_service_name || sub.customer_email}</p>
                    <p className="text-sm text-muted-foreground">
                      {sub.customer_email} | {sub.city_slug || 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      sub.plan_type === 'partner'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {sub.plan_type?.toUpperCase()}
                    </span>
                    <p className="text-sm text-red-600 mt-1">
                      past_due od {new Date(sub.updated_at).toLocaleDateString('sk-SK')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscriptions Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Zoznam predplatnych</CardTitle>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'active'
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Aktivni ({data.allSubscriptions?.filter(s => s.status === 'active').length || 0})
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'new'
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Novi (30 dni) ({data.recentEvents?.created?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('canceled')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'canceled'
                  ? 'bg-red-100 text-red-700 border border-red-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Zruseni ({data.recentEvents?.canceled?.length || 0})
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 font-medium">Email</th>
                  <th className="text-left py-3 px-2 font-medium">Taxisluzba</th>
                  <th className="text-left py-3 px-2 font-medium">Plan</th>
                  <th className="text-left py-3 px-2 font-medium">Suma</th>
                  <th className="text-left py-3 px-2 font-medium">Mesto</th>
                  <th className="text-left py-3 px-2 font-medium">Datum</th>
                </tr>
              </thead>
              <tbody>
                {activeTab === 'active' && data.allSubscriptions?.filter(s => s.status === 'active').map((sub) => (
                  <tr key={sub.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-2">{sub.customer_email || '-'}</td>
                    <td className="py-3 px-2">{sub.taxi_service_name || '-'}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        sub.plan_type === 'partner'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {sub.plan_type?.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-2">{(sub.amount_cents / 100).toFixed(2)} EUR</td>
                    <td className="py-3 px-2">{sub.city_slug || '-'}</td>
                    <td className="py-3 px-2">{new Date(sub.created_at).toLocaleDateString('sk-SK')}</td>
                  </tr>
                ))}
                {activeTab === 'new' && data.recentEvents?.created?.map((event) => (
                  <tr key={event.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-2">{event.subscriptions?.customer_email || '-'}</td>
                    <td className="py-3 px-2">{event.subscriptions?.taxi_service_name || '-'}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        event.subscriptions?.plan_type === 'partner'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {event.subscriptions?.plan_type?.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-2">{((event.subscriptions?.amount_cents || 0) / 100).toFixed(2)} EUR</td>
                    <td className="py-3 px-2">{event.subscriptions?.city_slug || '-'}</td>
                    <td className="py-3 px-2 text-green-600 font-medium">
                      {new Date(event.created_at).toLocaleDateString('sk-SK')}
                    </td>
                  </tr>
                ))}
                {activeTab === 'canceled' && data.recentEvents?.canceled?.map((event) => (
                  <tr key={event.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-2">{event.subscriptions?.customer_email || '-'}</td>
                    <td className="py-3 px-2">{event.subscriptions?.taxi_service_name || '-'}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        event.subscriptions?.plan_type === 'partner'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {event.subscriptions?.plan_type?.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-2">{((event.subscriptions?.amount_cents || 0) / 100).toFixed(2)} EUR</td>
                    <td className="py-3 px-2">{event.subscriptions?.city_slug || '-'}</td>
                    <td className="py-3 px-2 text-red-600 font-medium">
                      Zrusene {new Date(event.created_at).toLocaleDateString('sk-SK')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Empty states */}
            {activeTab === 'active' && (!data.allSubscriptions || data.allSubscriptions.filter(s => s.status === 'active').length === 0) && (
              <p className="text-center text-muted-foreground py-8">Ziadne aktivne predplatne</p>
            )}
            {activeTab === 'new' && (!data.recentEvents?.created || data.recentEvents.created.length === 0) && (
              <p className="text-center text-muted-foreground py-8">Ziadne nove predplatne za poslednych 30 dni</p>
            )}
            {activeTab === 'canceled' && (!data.recentEvents?.canceled || data.recentEvents.canceled.length === 0) && (
              <p className="text-center text-muted-foreground py-8">Ziadne zrusene predplatne za poslednych 30 dni</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Expiring Subscriptions Alert */}
      {data.expiring.thirtyDays.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Konciace predplatne
            </CardTitle>
            <CardDescription>
              Tieto predplatne konci v najblizsich 30 dnoch
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 7 days */}
              {data.expiring.sevenDays.length > 0 && (
                <div>
                  <h4 className="font-semibold text-red-600 mb-2">
                    Do 7 dni ({data.expiring.sevenDays.length})
                  </h4>
                  <div className="grid gap-2">
                    {data.expiring.sevenDays.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex justify-between items-center p-3 bg-white rounded-lg border border-red-200"
                      >
                        <div>
                          <p className="font-medium">{sub.taxi_service_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {sub.city_slug} | {sub.customer_email}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            sub.plan_type === 'partner'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {sub.plan_type.toUpperCase()}
                          </span>
                          <p className="text-sm text-red-600 mt-1">
                            {new Date(sub.current_period_end).toLocaleDateString('sk-SK')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 8-30 days */}
              {data.expiring.thirtyDays.filter(
                (s) => !data.expiring.sevenDays.find((ss) => ss.id === s.id)
              ).length > 0 && (
                <div>
                  <h4 className="font-semibold text-orange-600 mb-2">
                    8-30 dni ({data.expiring.thirtyDays.length - data.expiring.sevenDays.length})
                  </h4>
                  <div className="grid gap-2">
                    {data.expiring.thirtyDays
                      .filter((s) => !data.expiring.sevenDays.find((ss) => ss.id === s.id))
                      .map((sub) => (
                        <div
                          key={sub.id}
                          className="flex justify-between items-center p-3 bg-white rounded-lg border"
                        >
                          <div>
                            <p className="font-medium">{sub.taxi_service_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {sub.city_slug} | {sub.customer_email}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              sub.plan_type === 'partner'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {sub.plan_type.toUpperCase()}
                            </span>
                            <p className="text-sm text-muted-foreground mt-1">
                              {new Date(sub.current_period_end).toLocaleDateString('sk-SK')}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {data.subscriptions.total === 0 && (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              Zatial ziadne predplatne. Data sa objavia po prvej platbe cez Stripe.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
