from fastapi import FastAPI

app = FastAPI()

players = [
    {
        "id": 1,
        "name": "岡本和真",
        "position": "内野手"
    },
    {
        "id": 2,
        "name": "吉川尚輝",
        "position": "内野手"
    },
    {
        "id": 3,
        "name": "戸郷翔征",
        "position": "投手"
    }
]

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/players")
def get_players():
    return players