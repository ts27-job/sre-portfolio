from fastapi import FastAPI
from sqlalchemy import text
from database import engine

app = FastAPI()


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/players")
def get_players():

    with engine.connect() as conn:

        result = conn.execute(
            text("SELECT * FROM players")
        )

        players = []

        for row in result:
            players.append({
                "id": row.id,
                "name": row.name,
                "position": row.position
            })

        return players