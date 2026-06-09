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