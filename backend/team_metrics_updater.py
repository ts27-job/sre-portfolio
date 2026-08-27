from sqlalchemy import text

from alert_logic import evaluate_rule
from baseball_fetcher import fetch_team_metrics
from database import engine


def update_team_metrics():
    metrics = fetch_team_metrics()

    with engine.begin() as connection:
        # team_metrics を最新値に更新
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

        # アラートルールを取得
        rules_result = connection.execute(
            text("SELECT * FROM alert_rules")
        )

        metric_values = dict(metrics)

        # 各指標をアラートルールと比較
        for rule in rules_result:
            metric_name = rule.metric_name

            if metric_name not in metric_values:
                continue

            metric_value = metric_values[metric_name]
            operator = rule.operator
            threshold = float(rule.threshold)
            severity = rule.severity

            if evaluate_rule(metric_value, operator, threshold):
                message = f"{metric_name} {operator} {threshold}"

                # この指標の直近アラートを取得
                latest_alert = connection.execute(
                    text(
                        """
                        SELECT metric_name, severity, message
                        FROM alert_history
                        WHERE metric_name = :metric_name
                        ORDER BY detected_at DESC
                        LIMIT 1
                        """
                    ),
                    {
                        "metric_name": metric_name,
                    },
                ).fetchone()

                # 直近と同じアラートか確認
                is_duplicate = (
                    latest_alert is not None
                    and latest_alert.severity == severity
                    and latest_alert.message == message
                )

                # 同じアラートでなければ履歴へ登録
                if not is_duplicate:
                    connection.execute(
                        text(
                            """
                            INSERT INTO alert_history
                            (metric_name, metric_value, severity, message, detected_at)
                            VALUES
                            (:metric_name, :metric_value, :severity, :message, NOW())
                            """
                        ),
                        {
                            "metric_name": metric_name,
                            "metric_value": metric_value,
                            "severity": severity,
                            "message": message,
                        },
                    )


if __name__ == "__main__":
    update_team_metrics()