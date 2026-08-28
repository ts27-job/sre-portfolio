import requests
from bs4 import BeautifulSoup


URL = "https://baseballdata.jp/c/index.html"


def get_team_metrics(table, target_team, metric_mapping):
    header_row = table.find("tr")

    headers = [
        cell.get_text(strip=True)
        for cell in header_row.find_all(["th", "td"])
    ]

    for row in table.find_all("tr"):
        cells = [
            cell.get_text(strip=True)
            for cell in row.find_all(["th", "td"])
        ]

        if cells and cells[0] == target_team:
            metrics = {}

            for source_name, metric_name in metric_mapping.items():
                index = headers.index(source_name)
                value = cells[index]

                if "%" in value:
                    value = value.replace("%", "")

                metrics[metric_name] = float(value)

            return metrics

    raise ValueError(f"{target_team} のデータが見つかりません")


def fetch_team_metrics():
    response = requests.get(URL, timeout=10)
    response.raise_for_status()
    response.encoding = "utf-8"

    soup = BeautifulSoup(response.text, "html.parser")
    tables = soup.find_all("table")

    batting_table = tables[1]
    pitching_table = tables[2]

    batting_metrics = get_team_metrics(
        batting_table,
        "巨人",
        {
            "打率": "team_avg",
            "出塁率": "team_obp",
            "長打率": "team_slg",
            "OPS": "team_ops",
            "得点圏打率": "risp_avg",
        },
    )

    pitching_metrics = get_team_metrics(
        pitching_table,
        "巨人",
        {
            "防御率": "team_era",
            "先発防御率": "starter_era",
            "救援防御率": "bullpen_era",
            "QS率": "qs_rate",
        },
    )

    team_metrics = {
        **batting_metrics,
        **pitching_metrics,
    }

    return [
        (metric_name, metric_value)
        for metric_name, metric_value in team_metrics.items()
    ]


if __name__ == "__main__":
    print(fetch_team_metrics())