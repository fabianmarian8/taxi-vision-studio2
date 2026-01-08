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
} from 'recharts';
import { Phone, MessageCircle, MapPin, Building2, MousePointerClick, Download } from 'lucide-react';

interface ClickStat {
  city_slug: string;
  service_name: string;
  event_type: string;
  total_clicks: number;
}

interface DailyClickStat {
  date: string;
  total_clicks: number;
}

interface StatsData {
  summary: {
    total_clicks: number;
    phone_clicks: number;
    whatsapp_clicks: number;
    unique_cities: number;
    unique_services: number;
  };
  topServices: ClickStat[];
  dailyTrend: DailyClickStat[];
}

export function ClickStatsClient() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'phone_click' | 'whatsapp_click'>('all');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const response = await fetch('/api/admin/stats/clicks');
      if (!response.ok) throw new Error('Failed to fetch');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError('Nepodarilo sa načítať dáta');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function exportToCSV() {
    if (!data?.topServices) return;

    const headers = ['Mesto', 'Taxislužba', 'Typ', 'Počet kliknutí'];
    const rows = data.topServices.map(stat => [
      stat.city_slug,
      stat.service_name,
      stat.event_type === 'phone_click' ? 'Telefón' : 'WhatsApp',
      stat.total_clicks.toString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `click_stats_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
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

  const filteredServices = filterType === 'all'
    ? data.topServices
    : data.topServices.filter(s => s.event_type === filterType);

  // Aggregate by service for bar chart (top 10)
  const serviceAggregated: Record<string, { name: string; city: string; clicks: number }> = {};
  for (const stat of data.topServices) {
    const key = `${stat.city_slug}|${stat.service_name}`;
    if (!serviceAggregated[key]) {
      serviceAggregated[key] = {
        name: stat.service_name.length > 20 ? stat.service_name.substring(0, 20) + '...' : stat.service_name,
        city: stat.city_slug,
        clicks: 0
      };
    }
    serviceAggregated[key].clicks += stat.total_clicks;
  }
  const topServicesChart = Object.values(serviceAggregated)
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10);

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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <MousePointerClick className="h-4 w-4 text-blue-500" />
              Celkom kliknutí
            </CardDescription>
            <CardTitle className="text-3xl font-bold text-blue-700">
              {data.summary.total_clicks.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-green-200 bg-green-50/50">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-green-500" />
              Telefónne kliknutia
            </CardDescription>
            <CardTitle className="text-3xl font-bold text-green-700">
              {data.summary.phone_clicks.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-emerald-500" />
              WhatsApp kliknutia
            </CardDescription>
            <CardTitle className="text-3xl font-bold text-emerald-700">
              {data.summary.whatsapp_clicks.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-purple-500" />
              Aktívne mestá
            </CardDescription>
            <CardTitle className="text-3xl font-bold">
              {data.summary.unique_cities}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-yellow-500" />
              Aktívne služby
            </CardDescription>
            <CardTitle className="text-3xl font-bold">
              {data.summary.unique_services}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Kliknutia za posledných 30 dní</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.dailyTrend}>
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
                  formatter={(value: number) => [value, 'Kliknutí']}
                  labelFormatter={(label) => new Date(label).toLocaleDateString('sk-SK')}
                />
                <Line
                  type="monotone"
                  dataKey="total_clicks"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Services Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 taxislužieb</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topServicesChart} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={120}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  formatter={(value: number) => [value, 'Kliknutí']}
                  labelFormatter={(label) => {
                    const service = topServicesChart.find(s => s.name === label);
                    return service ? `${service.name} (${service.city})` : label;
                  }}
                />
                <Bar dataKey="clicks" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailné štatistiky kliknutí</CardTitle>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === 'all'
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Všetky ({data.topServices.length})
            </button>
            <button
              onClick={() => setFilterType('phone_click')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === 'phone_click'
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Phone className="h-4 w-4 inline mr-1" />
              Telefón ({data.topServices.filter(s => s.event_type === 'phone_click').length})
            </button>
            <button
              onClick={() => setFilterType('whatsapp_click')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === 'whatsapp_click'
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <MessageCircle className="h-4 w-4 inline mr-1" />
              WhatsApp ({data.topServices.filter(s => s.event_type === 'whatsapp_click').length})
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 font-medium">#</th>
                  <th className="text-left py-3 px-2 font-medium">Mesto</th>
                  <th className="text-left py-3 px-2 font-medium">Taxislužba</th>
                  <th className="text-left py-3 px-2 font-medium">Typ</th>
                  <th className="text-right py-3 px-2 font-medium">Kliknutia</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((stat, index) => (
                  <tr key={`${stat.city_slug}-${stat.service_name}-${stat.event_type}`} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-2 text-muted-foreground">{index + 1}</td>
                    <td className="py-3 px-2">
                      <a
                        href={`/taxi/${stat.city_slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {stat.city_slug}
                      </a>
                    </td>
                    <td className="py-3 px-2 font-medium">{stat.service_name}</td>
                    <td className="py-3 px-2">
                      {stat.event_type === 'phone_click' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                          <Phone className="h-3 w-3" />
                          Telefón
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-emerald-100 text-emerald-700">
                          <MessageCircle className="h-3 w-3" />
                          WhatsApp
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-right font-bold">{stat.total_clicks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredServices.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Zatiaľ žiadne kliknutia. Štatistiky sa objavia po prvom kliknutí na telefónne číslo.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
