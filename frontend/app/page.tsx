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

type Position =
  | "投手(右)"
  | "投手(左)"
  | "捕手"
  | "内野手"
  | "外野手";

type Player = {
  name: string;
  position: Position;
  birthDate: string;
};

const players: Player[] = [
// 投手(右)
{ name: "田中 将大", position: "投手(右)", birthDate: "1988-11-01" },
{ name: "大勢", position: "投手(右)", birthDate: "1999-06-29" },
{ name: "西舘 勇陽", position: "投手(右)", birthDate: "2002-03-11" },
{ name: "山﨑 伊織", position: "投手(右)", birthDate: "1998-10-10" },
{ name: "戸郷 翔征", position: "投手(右)", birthDate: "2000-04-04" },
{ name: "ウィットリー", position: "投手(右)", birthDate: "1997-09-15" },
{ name: "ハワード", position: "投手(右)", birthDate: "1996-07-28" },
{ name: "田和 廉", position: "投手(右)", birthDate: "2003-05-02" },
{ name: "赤星 優志", position: "投手(右)", birthDate: "1999-07-02" },
{ name: "マタ", position: "投手(右)", birthDate: "1999-05-03" },
{ name: "則本 昂大", position: "投手(右)", birthDate: "1990-12-17" },
{ name: "田中 瑛斗", position: "投手(右)", birthDate: "1999-07-13" },
{ name: "ルシアーノ", position: "投手(右)", birthDate: "2000-02-15" },
{ name: "船迫 大雅", position: "投手(右)", birthDate: "1996-10-16" },
{ name: "泉 圭輔", position: "投手(右)", birthDate: "1997-03-02" },
{ name: "平内 龍太", position: "投手(右)", birthDate: "1998-08-01" },
{ name: "堀田 賢慎", position: "投手(右)", birthDate: "2001-05-21" },
{ name: "マルティネス", position: "投手(右)", birthDate: "1996-10-11" },

// 投手(左)
{ name: "竹丸 和幸", position: "投手(左)", birthDate: "2002-02-26" },
{ name: "代木 大和", position: "投手(左)", birthDate: "2003-09-08" },
{ name: "山城 京平", position: "投手(左)", birthDate: "2003-09-20" },
{ name: "中川 皓太", position: "投手(左)", birthDate: "1994-02-24" },
{ name: "又木 鉄平", position: "投手(左)", birthDate: "1999-02-12" },
{ name: "森田 駿哉", position: "投手(左)", birthDate: "1997-02-11" },
{ name: "バルドナード", position: "投手(左)", birthDate: "1993-02-01" },
{ name: "高梨 雄平", position: "投手(左)", birthDate: "1992-07-13" },
{ name: "松浦 慶斗", position: "投手(左)", birthDate: "2003-07-01" },
{ name: "北浦 竜次", position: "投手(左)", birthDate: "2000-01-12" },
{ name: "宮原 駿介", position: "投手(左)", birthDate: "2002-09-12" },
{ name: "横川 凱", position: "投手(左)", birthDate: "2000-08-30" },
{ name: "山田 龍聖", position: "投手(左)", birthDate: "2000-09-07" },
{ name: "石川 達也", position: "投手(左)", birthDate: "1998-04-15" },
{ name: "井上 温大", position: "投手(左)", birthDate: "2001-05-13" },
{ name: "小笠原 慎之介", position: "投手(左)", birthDate: "1997-10-08" },

// 捕手
{ name: "甲斐 拓也", position: "捕手", birthDate: "1992-11-05" },
{ name: "小林 誠司", position: "捕手", birthDate: "1989-06-07" },
{ name: "大城 卓三", position: "捕手", birthDate: "1993-02-11" },
{ name: "岸田 行倫", position: "捕手", birthDate: "1996-10-10" },
{ name: "郡 拓也", position: "捕手", birthDate: "1998-04-25" },
{ name: "山瀬 慎之助", position: "捕手", birthDate: "2001-05-04" },

// 内野手
{ name: "湯浅 大", position: "内野手", birthDate: "2000-01-24" },
{ name: "増田 大輝", position: "内野手", birthDate: "1993-07-29" },
{ name: "吉川 尚輝", position: "内野手", birthDate: "1995-02-08" },
{ name: "門脇 誠", position: "内野手", birthDate: "2001-01-24" },
{ name: "坂本 勇人", position: "内野手", birthDate: "1988-12-14" },
{ name: "石塚 裕惺", position: "内野手", birthDate: "2006-04-06" },
{ name: "ダルベック", position: "内野手", birthDate: "1995-06-29" },
{ name: "浦田 俊輔", position: "内野手", birthDate: "2002-08-30" },
{ name: "小濱 佑斗", position: "内野手", birthDate: "2001-10-05" },
{ name: "泉口 友汰", position: "内野手", birthDate: "1999-05-17" },
{ name: "リチャード", position: "内野手", birthDate: "1999-06-18" },
{ name: "荒巻 悠", position: "内野手", birthDate: "2002-12-23" },
{ name: "増田 陸", position: "内野手", birthDate: "2000-06-17" },
{ name: "宇都宮 葵星", position: "内野手", birthDate: "2004-06-23" },
{ name: "平山 功太", position: "内野手", birthDate: "2004-03-16" },
{ name: "藤井 健翔", position: "内野手", birthDate: "2007-08-15" },

// 外野手
{ name: "丸 佳浩", position: "外野手", birthDate: "1989-04-11" },
{ name: "松本 剛", position: "外野手", birthDate: "1993-08-11" },
{ name: "萩尾 匡也", position: "外野手", birthDate: "2000-12-28" },
{ name: "キャベッジ", position: "外野手", birthDate: "1997-05-03" },
{ name: "岡田 悠希", position: "外野手", birthDate: "2000-01-19" },
{ name: "皆川 岳飛", position: "外野手", birthDate: "2003-04-30" },
{ name: "中山 礼都", position: "外野手", birthDate: "2002-04-12" },
{ name: "佐々木 俊輔", position: "外野手", birthDate: "1999-11-06" },
{ name: "ティマ", position: "外野手", birthDate: "2004-09-25" },
{ name: "浅野 翔吾", position: "外野手", birthDate: "2004-11-24" },
{ name: "鈴木 大和", position: "外野手", birthDate: "1999-04-27" },
{ name: "知念 大成", position: "外野手", birthDate: "2000-04-27" },
{ name: "笹原 操希", position: "外野手", birthDate: "2004-02-09" },
{ name: "三塚 琉生", position: "外野手", birthDate: "2004-05-10" },
];

const positions: Position[] = [
  "投手(右)",
  "投手(左)",
  "捕手",
  "内野手",
  "外野手",
];

const ageGroups = [
  { label: "18〜20歳", min: 18, max: 20 },
  { label: "21〜25歳", min: 21, max: 25 },
  { label: "26〜30歳", min: 26, max: 30 },
  { label: "31〜35歳", min: 31, max: 35 },
  { label: "36歳以上", min: 36, max: Infinity },
];

const seasonBaseDate = new Date("2026-03-27T00:00:00");

function calculateAge(birthDate: string, baseDate = new Date()): number {
  const birth = new Date(`${birthDate}T00:00:00`);
  let age = baseDate.getFullYear() - birth.getFullYear();
  const birthdayPassed =
    baseDate.getMonth() > birth.getMonth() ||
    (baseDate.getMonth() === birth.getMonth() &&
      baseDate.getDate() >= birth.getDate());

  if (!birthdayPassed) {
    age -= 1;
  }

  return age;
}

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
      team_avg: '打率',
      team_obp: '出塁率',
      team_slg: '長打率',
      team_ops: 'OPS',
      risp_avg: '得点圏打率',
      team_era: '防御率',
      starter_era: '先発防御率',
      bullpen_era: '救援防御率',
      qs_rate: 'QS率',
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

  const playersWithAge = players.map((player) => ({
  ...player,
  age: calculateAge(player.birthDate, seasonBaseDate),
}));

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
          {teamMetrics
            .filter((metric) => metric.metric_name !== "whip")
            .map((metric) => (
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
      
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-semibold text-gray-900">
          年齢・ポジション分布
        </h2>

        <div className="age-chart">
          <div className="chart-legend">
            {ageGroups.map((group) => (
              <span
                key={group.label}
                className={`legend-item age-${group.min}`}
              >
                {group.label}
              </span>
            ))}
          </div>

          {positions.map((position) => {
            const positionPlayers = playersWithAge.filter(
              (player) => player.position === position,
            );

            return (
              <div className="chart-row" key={position}>
                <div className="chart-label">{position}</div>

                <div className="chart-bar">
                  {ageGroups.map((group) => {
                    const count = positionPlayers.filter(
                      (player) =>
                        player.age >= group.min &&
                        player.age <= group.max,
                    ).length;

                    if (count === 0) {
                      return null;
                    }

                    return (
                      <div
                        key={group.label}
                        className={`bar-segment age-${group.min}`}
                        style={{
                          width: `${(count / positionPlayers.length) * 100}%`,
                        }}
                      >
                        {count}
                      </div>
                    );
                  })}
                </div>
                <div className="chart-total">{positionPlayers.length}人</div>
              </div>
            );
          })}
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th scope="col">年齢</th>
                {positions.map((position) => (
                  <th key={position} scope="col">
                    {position}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {ageGroups.map((group) => (
                <tr key={group.label}>
                  <th scope="row">{group.label}</th>

                  {positions.map((position) => {
                    const matchedPlayers = playersWithAge.filter(
                      (player) =>
                        player.position === position &&
                        player.age >= group.min &&
                        player.age <= group.max,
                    );

                    return (
                      <td key={position}>
                        {matchedPlayers.length > 0 ? (
                          <ul className="player-list">
                            {matchedPlayers.map((player) => (
                              <li key={player.name}>
                                <span>{player.name}</span>
                                <small>{player.age}歳</small>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="empty-cell">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}