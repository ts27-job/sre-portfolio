from sqlalchemy import text

from baseball_fetcher import fetch_team_metrics
from database import engine


def update_team_metrics():
    metrics = fetch_team_metrics()

    with engine.begin() as connection:
        for metric_name, metric_value in metrics:
            connection.execute(
                text(
                    """
                    UPDATE team_metrics
                    SET metric_value = :metric_value,
                        updated_at = NOW()
                    WHERE metric_name = :metric_name
                    """
                ),
                {
                    "metric_value": metric_value,
                    "metric_name": metric_name,
                },
            )


if __name__ == "__main__":
    update_team_metrics()