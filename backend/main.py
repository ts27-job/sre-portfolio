from fastapi import FastAPI
from sqlalchemy import text
from database import engine

app = FastAPI()


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/team-metrics")
def get_team_metrics():
    with engine.connect() as conn:
        result = conn.execute(
            text("SELECT * FROM team_metrics")
        )

        metrics = []

        for row in result:
            metrics.append({
                "id": row.id,
                "metric_name": row.metric_name,
                "metric_value": float(row.metric_value),
                "updated_at": row.updated_at
            })

        return metrics

@app.get("/alerts")
def get_alerts():

    alerts = []

    with engine.connect() as conn:

        result = conn.execute(
            text("SELECT * FROM team_metrics")
        )

        for row in result:

            if row.metric_name == "bullpen_era" and row.metric_value > 4.50:
                alerts.append({
                    "severity": "Critical",
                    "message": "Bullpen ERA exceeded threshold"
                })

            if row.metric_name == "team_ops" and row.metric_value < 0.70:
                alerts.append({
                    "severity": "Warning",
                    "message": "Team OPS below threshold"
                })

    return alerts

@app.get("/team-health")
def get_team_health():
    health = {
        "batting": "Healthy",
        "pitching": "Healthy",
        "bullpen": "Healthy",
        "overall": "Healthy"
    }

    with engine.connect() as conn:
        result = conn.execute(
            text("SELECT * FROM team_metrics")
        )

        for row in result:
            metric_name = row.metric_name
            metric_value = float(row.metric_value)

            if metric_name == "team_ops" and metric_value < 0.70:
                health["batting"] = "Warning"

            if metric_name == "team_era" and metric_value > 4.00:
                health["pitching"] = "Warning"

            if metric_name == "bullpen_era" and metric_value > 4.50:
                health["bullpen"] = "Critical"

            if metric_name == "games_under_500" and metric_value >= 5:
                health["overall"] = "Critical"

            if metric_name == "losing_streak" and metric_value >= 3:
                health["overall"] = "Warning"

    if "Critical" in health.values():
        health["overall"] = "Critical"
    elif "Warning" in health.values():
        health["overall"] = "Warning"

    return health