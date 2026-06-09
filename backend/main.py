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