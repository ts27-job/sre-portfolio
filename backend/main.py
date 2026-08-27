from fastapi import FastAPI
from sqlalchemy import text
from database import engine
from alert_logic import evaluate_rule
from team_metrics_updater import update_team_metrics
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.post("/team-metrics/refresh")
def refresh_team_metrics():
    update_team_metrics()

    return {
        "status": "ok",
        "message": "Team metrics updated"
    }

@app.get("/alerts")
def get_alerts():
    alerts = []

    with engine.connect() as conn:
        metrics_result = conn.execute(
            text("SELECT * FROM team_metrics")
        )

        rules_result = conn.execute(
            text("SELECT * FROM alert_rules")
        )

        metrics = {}

        for row in metrics_result:
            metrics[row.metric_name] = float(row.metric_value)

        for rule in rules_result:
            metric_name = rule.metric_name
            operator = rule.operator
            threshold = float(rule.threshold)
            severity = rule.severity

            if metric_name not in metrics:
                continue

            value = metrics[metric_name]
            message = f"{metric_name} {operator} {threshold}"

            if evaluate_rule(value, operator, threshold):
                alerts.append({
                    "metric_name": metric_name,
                    "metric_value": value,
                    "operator": operator,
                    "threshold": threshold,
                    "severity": severity,
                    "message": message,
                    "status": "Triggered",
                    "is_triggered": True
                })

    return alerts

@app.get("/alert-rules")
def get_alert_rules():

    with engine.connect() as conn:

        result = conn.execute(
            text("SELECT * FROM alert_rules")
        )

        rules = []

        for row in result:

            rules.append({
                "id": row.id,
                "metric_name": row.metric_name,
                "operator": row.operator,
                "threshold": float(row.threshold),
                "severity": row.severity
            })

        return rules

@app.get("/alert-history")
def get_alert_history():

    with engine.connect() as conn:

        result = conn.execute(
            text("SELECT * FROM alert_history")
        )

        alert_history = []

        for row in result:

            alert_history.append({
                "id": row.id,
                "metric_name": row.metric_name,
                "metric_value": float(row.metric_value),
                "severity": row.severity,
                "message": row.message,
                "detected_at": row.detected_at
            })

        return alert_history