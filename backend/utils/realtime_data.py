import requests
import os
from datetime import datetime

# Free football API — no key needed for basic data
FOOTBALL_API = "https://api.football-data.org/v4"
FOOTBALL_KEY = os.getenv("FOOTBALL_API_KEY", "")  # optional paid key

def get_live_matches():
    """Get live/today's World Cup 2026 or major tournament matches"""
    try:
        headers = {}
        if FOOTBALL_KEY:
            headers["X-Auth-Token"] = FOOTBALL_KEY

        # Try World Cup 2026 (competition code WC)
        r = requests.get(
            f"{FOOTBALL_API}/competitions/WC/matches?status=LIVE",
            headers=headers, timeout=5
        )
        if r.status_code == 200:
            data = r.json()
            matches = data.get("matches", [])
            return format_matches(matches)
    except Exception as e:
        print(f"[Realtime] API error: {e}")

    # Fallback — return demo data so app still works
    return get_demo_matches()

def format_matches(matches):
    result = []
    for m in matches[:5]:
        result.append({
            "home": m.get("homeTeam", {}).get("shortName", "TBD"),
            "away": m.get("awayTeam", {}).get("shortName", "TBD"),
            "home_score": m.get("score", {}).get("fullTime", {}).get("home", 0) or 0,
            "away_score": m.get("score", {}).get("fullTime", {}).get("away", 0) or 0,
            "minute": m.get("minute", "?"),
            "status": m.get("status", "SCHEDULED"),
            "stage": m.get("stage", "GROUP_STAGE"),
        })
    return result

def get_demo_matches():
    """Demo data for when API is unavailable"""
    return [
        {"home":"Brazil","away":"Argentina","home_score":2,"away_score":1,"minute":74,"status":"IN_PLAY","stage":"GROUP_STAGE"},
        {"home":"France","away":"Spain","home_score":0,"away_score":0,"minute":22,"status":"IN_PLAY","stage":"GROUP_STAGE"},
    ]

def get_standings():
    """Get World Cup group standings"""
    try:
        headers = {}
        if FOOTBALL_KEY:
            headers["X-Auth-Token"] = FOOTBALL_KEY
        r = requests.get(f"{FOOTBALL_API}/competitions/WC/standings", headers=headers, timeout=5)
        if r.status_code == 200:
            return r.json().get("standings", [])[:2]
    except:
        pass
    return []

def get_top_scorers():
    """Get World Cup top scorers"""
    try:
        headers = {}
        if FOOTBALL_KEY:
            headers["X-Auth-Token"] = FOOTBALL_KEY
        r = requests.get(f"{FOOTBALL_API}/competitions/WC/scorers?limit=5", headers=headers, timeout=5)
        if r.status_code == 200:
            scorers = r.json().get("scorers", [])
            return [
                {
                    "name": s.get("player", {}).get("name", ""),
                    "team": s.get("team", {}).get("shortName", ""),
                    "goals": s.get("goals", 0),
                }
                for s in scorers
            ]
    except:
        pass
    return [
        {"name":"Mbappé","team":"France","goals":4},
        {"name":"Vinicius Jr","team":"Brazil","goals":3},
        {"name":"Lewandowski","team":"Poland","goals":3},
    ]