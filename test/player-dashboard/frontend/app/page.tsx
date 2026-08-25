type Position = "投手" | "捕手" | "内野手" | "外野手";

type Player = {
  name: string;
  position: Position;
  birthDate: string;
};

const players: Player[] = [
  { name: "選手A", position: "投手", birthDate: "2000-01-15" },
  { name: "選手B", position: "投手", birthDate: "1998-06-20" },
  { name: "選手C", position: "捕手", birthDate: "2001-03-08" },
  { name: "選手D", position: "内野手", birthDate: "1999-11-30" },
  { name: "選手E", position: "内野手", birthDate: "2000-09-12" },
  { name: "選手F", position: "外野手", birthDate: "2002-04-05" },
];

const positions: Position[] = ["投手", "捕手", "内野手", "外野手"];

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
  const playersWithAge = players.map((player) => ({
    ...player,
    age: calculateAge(player.birthDate),
  }));

  const ages = Array.from(
    new Set(playersWithAge.map((player) => player.age)),
  ).sort((a, b) => a - b);

  return (
    <main className="page-container">
      <section className="dashboard-card">
        <header className="page-header">
          <p className="eyebrow">SRE Portfolio / Frontend Test</p>
          <h1>選手 年齢・ポジション分布</h1>
          <p className="description">
            横軸にポジション、縦軸に年齢を配置した検証用テーブルです。
          </p>
        </header>

        <div className="summary-grid" aria-label="選手サマリー">
          <div className="summary-item">
            <span>選手数</span>
            <strong>{playersWithAge.length}</strong>
          </div>
          <div className="summary-item">
            <span>平均年齢</span>
            <strong>
              {(
                playersWithAge.reduce((sum, player) => sum + player.age, 0) /
                playersWithAge.length
              ).toFixed(1)}
            </strong>
          </div>
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
              {ages.map((age) => (
                <tr key={age}>
                  <th scope="row">{age}歳</th>
                  {positions.map((position) => {
                    const matchedPlayers = playersWithAge.filter(
                      (player) =>
                        player.age === age && player.position === position,
                    );

                    return (
                      <td key={position}>
                        {matchedPlayers.length > 0 ? (
                          <ul className="player-list">
                            {matchedPlayers.map((player) => (
                              <li key={player.name}>
                                <span>{player.name}</span>
                                <small>{player.birthDate}</small>
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
