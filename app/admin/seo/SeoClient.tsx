'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import {
  MousePointer,
  Eye,
  TrendingUp,
  Target,
  AlertCircle,
  Search,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SeoData {
  summary: {
    totalClicks: number;
    totalImpressions: number;
    avgPosition: number;
    avgCtr: number;
  };
  trend: TrendPoint[];
  topPages: PageSnapshot[];
  keywords: KeywordRanking[];
  weakCities: PageSnapshot[];
  lastSync: string | null;
}

interface TrendPoint {
  date: string;
  clicks: number;
  impressions: number;
  position: number;
  ctr: number;
}

interface PageSnapshot {
  id: string;
  page_url: string;
  city_slug: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface KeywordRanking {
  id: string;
  keyword: string;
  city_slug: string;
  position: number;
  previous_position: number;
  clicks: number;
  impressions: number;
}

export function SeoClient() {
  const [data, setData] = useState<SeoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const response = await fetch('/api/admin/seo');
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

  async function handleSync() {
    setSyncing(true);
    try {
      const response = await fetch('/api/admin/seo/sync', { method: 'POST' });
      if (!response.ok) throw new Error('Sync failed');
      await fetchData();
    } catch (err) {
      console.error('Sync error:', err);
    } finally {
      setSyncing(false);
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

  const hasData = data.topPages.length > 0;

  return (
    <div className="space-y-8">
      {/* Sync Status */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Posledna synchronizacia:{' '}
          {data.lastSync
            ? new Date(data.lastSync).toLocaleString('sk-SK')
            : 'Nikdy'}
        </div>
        <Button onClick={handleSync} disabled={syncing} variant="outline">
          {syncing ? 'Synchronizujem...' : 'Synchronizovat z GSC'}
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <MousePointer className="h-4 w-4 text-blue-500" />
              Celkove kliky
            </CardDescription>
            <CardTitle className="text-3xl font-bold text-blue-700">
              {data.summary.totalClicks.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">za poslednych 30 dni</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Celkove zobrazenia
            </CardDescription>
            <CardTitle className="text-3xl font-bold">
              {data.summary.totalImpressions.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">za poslednych 30 dni</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Priemerne CTR
            </CardDescription>
            <CardTitle className="text-3xl font-bold">{data.summary.avgCtr}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {data.summary.avgCtr > 3 ? 'Dobre!' : 'Mozno zlepsit'}
            </p>
          </CardContent>
        </Card>

        <Card className={data.summary.avgPosition > 10 ? 'border-orange-200 bg-orange-50/50' : 'border-green-200 bg-green-50/50'}>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Priemerna pozicia
            </CardDescription>
            <CardTitle className="text-3xl font-bold">{data.summary.avgPosition}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {data.summary.avgPosition <= 3
                ? 'TOP 3!'
                : data.summary.avgPosition <= 10
                ? 'Prva stranka'
                : 'Mimo prvej stranky'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {hasData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Clicks & Impressions Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Kliky a zobrazenia (30 dni)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.trend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getDate()}.${date.getMonth() + 1}`;
                    }}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(label) =>
                      new Date(label).toLocaleDateString('sk-SK')
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="impressions"
                    name="Zobrazenia"
                    stroke="#3b82f6"
                    fill="#3b82f633"
                  />
                  <Area
                    type="monotone"
                    dataKey="clicks"
                    name="Kliky"
                    stroke="#10b981"
                    fill="#10b98133"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Position Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Priemerna pozicia (30 dni)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.trend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getDate()}.${date.getMonth() + 1}`;
                    }}
                  />
                  <YAxis reversed domain={[1, 'auto']} />
                  <Tooltip
                    labelFormatter={(label) =>
                      new Date(label).toLocaleDateString('sk-SK')
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="position"
                    name="Pozicia"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ fill: '#f59e0b' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top Pages */}
      {data.topPages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Top 10 stranok
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3">Stranka</th>
                    <th className="text-right py-2 px-3">Kliky</th>
                    <th className="text-right py-2 px-3">Zobrazenia</th>
                    <th className="text-right py-2 px-3">CTR</th>
                    <th className="text-right py-2 px-3">Pozicia</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topPages.map((page) => (
                    <tr key={page.id} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate max-w-[300px]">
                            {page.page_url.replace('https://www.taxinearme.sk', '')}
                          </span>
                          <a
                            href={page.page_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                        {page.city_slug && (
                          <span className="text-xs text-muted-foreground">
                            {page.city_slug}
                          </span>
                        )}
                      </td>
                      <td className="text-right py-2 px-3 font-medium text-blue-600">
                        {page.clicks}
                      </td>
                      <td className="text-right py-2 px-3">{page.impressions}</td>
                      <td className="text-right py-2 px-3">
                        {(page.ctr * 100).toFixed(1)}%
                      </td>
                      <td className="text-right py-2 px-3">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            page.position <= 3
                              ? 'bg-green-100 text-green-800'
                              : page.position <= 10
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {page.position.toFixed(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weak Cities (Opportunities) */}
      {data.weakCities.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Prilezitosti na zlepsenie
            </CardTitle>
            <CardDescription>
              Tieto mesta maju vela zobrazeni ale malo klikov - mozno treba
              zlepsit meta title/description
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.weakCities.map((city) => (
                <div
                  key={city.id}
                  className="flex justify-between items-center p-3 bg-white rounded-lg border"
                >
                  <div>
                    <p className="font-medium">{city.city_slug}</p>
                    <p className="text-sm text-muted-foreground">
                      Pozicia: {city.position.toFixed(1)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">
                      <span className="text-blue-600 font-medium">{city.clicks}</span>{' '}
                      kliky
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">{city.impressions}</span>{' '}
                      zobrazeni
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Keywords */}
      {data.keywords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top keywords</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3">Keyword</th>
                    <th className="text-left py-2 px-3">Mesto</th>
                    <th className="text-right py-2 px-3">Pozicia</th>
                    <th className="text-right py-2 px-3">Zmena</th>
                    <th className="text-right py-2 px-3">Kliky</th>
                  </tr>
                </thead>
                <tbody>
                  {data.keywords.slice(0, 20).map((kw) => {
                    const change = kw.previous_position
                      ? kw.previous_position - kw.position
                      : 0;
                    return (
                      <tr key={kw.id} className="border-b hover:bg-muted/50">
                        <td className="py-2 px-3 font-medium">{kw.keyword}</td>
                        <td className="py-2 px-3 text-muted-foreground">
                          {kw.city_slug || '-'}
                        </td>
                        <td className="text-right py-2 px-3">
                          {kw.position.toFixed(1)}
                        </td>
                        <td className="text-right py-2 px-3">
                          {change !== 0 && (
                            <span
                              className={
                                change > 0 ? 'text-green-600' : 'text-red-600'
                              }
                            >
                              {change > 0 ? '+' : ''}
                              {change.toFixed(1)}
                            </span>
                          )}
                        </td>
                        <td className="text-right py-2 px-3 font-medium text-blue-600">
                          {kw.clicks}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!hasData && (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">
              Zatial ziadne SEO data. Kliknite na &quot;Synchronizovat z GSC&quot; pre
              import dat z Google Search Console.
            </p>
            <Button onClick={handleSync} disabled={syncing}>
              {syncing ? 'Synchronizujem...' : 'Synchronizovat teraz'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
