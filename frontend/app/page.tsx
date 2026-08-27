'use client';

import { useEffect, useState } from 'react';

type TeamMetric = {
  id: number;
  metric_name: string;
  metric_value: number;
  updated_at: string;
};

type Alert = {
  rule_name?: string;
  metric_name: string;
  metric_value: number;
  threshold: number;
  severity: string;
  status?: string;
  is_triggered?: boolean;
};

export default function Home() {
  const [teamMetrics, setTeamMetrics] = useState<TeamMetric[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsResponse, alertsResponse] = await Promise.all([
          fetch("/team-metrics"),
          fetch("/alerts"),
        ]);

        if (!metricsResponse.ok || !alertsResponse.ok) {
          throw new Error('API request failed');
        }

        const metricsData = await metricsResponse.json();
        const alertsData = await alertsResponse.json();

        setTeamMetrics(metricsData);
        setAlerts(alertsData);
      } catch (err) {
        setError('データ取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

    const metricLabels: Record<string, string> = {
      team_avg: 'チーム打率',
      team_obp: 'チーム出塁率',
      team_slg: 'チーム長打率',
      team_ops: 'チームOPS',
      risp_avg: '得点圏打率',
      team_era: 'チーム防御率',
      starter_era: '先発防御率',
      bullpen_era: '救援防御率',
      qs_rate: 'QS率',
      whip: 'WHIP',
    };

  const isCriticalMetric = (metricName: string) => {
    return alerts.some(
      (alert) =>
        alert.metric_name === metricName &&
        (alert.is_triggered === true ||
          alert.status === 'Triggered' ||
          alert.status === 'ALERT') &&
        alert.severity === 'Critical'
    );
  };

  const isWarningMetric = (metricName: string) => {
    return alerts.some(
      (alert) =>
        alert.metric_name === metricName &&
        (alert.is_triggered === true ||
          alert.status === 'Triggered' ||
          alert.status === 'ALERT') &&
        alert.severity === 'Warning'
    );
  };

  const getMetricCardClass = (metricName: string) => {
    if (isCriticalMetric(metricName)) {
      return 'border-red-400 bg-red-100 text-red-800';
    }

    if (isWarningMetric(metricName)) {
      return 'border-yellow-400 bg-yellow-100 text-yellow-800';
    }

    return 'border-gray-200 bg-white text-gray-800';
  };


  if (loading) {
    return <main className="p-8">Loading...</main>;
  }

  if (error) {
    return <main className="p-8 text-red-600">{error}</main>;
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">
        Giants SRE Dashboard
      </h1>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-semibold text-gray-900">
          Team Metrics
        </h2>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teamMetrics.map((metric) => (
            <div
              key={metric.id}
              className={`rounded-lg border p-6 shadow ${getMetricCardClass(
                metric.metric_name
              )}`}
            >
              <p className="text-sm font-medium">
                 {metricLabels[metric.metric_name] ?? metric.metric_name}
              </p>
              <p className="mt-2 text-4xl font-bold">{metric.metric_value}</p>
              <p className="mt-4 text-xs">Updated: {metric.updated_at}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}