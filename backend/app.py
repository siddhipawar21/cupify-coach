import os
import threading
import time
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = 'cupify-coach-2026'
CORS(app, origins=["http://localhost:3000", "http://localhost:5173"])

# Use threading instead of eventlet (no deprecation warning)
socketio = SocketIO(
    app,
    cors_allowed_origins="*",
    async_mode='threading',
    logger=False,
    engineio_logger=False
)

# ── Import your existing routes ─────────────────────────────────
# We import safely — works even if api_bp name differs
try:
    from routes.api_routes import api_bp
    app.register_blueprint(api_bp, url_prefix='/api')
    print("[OK] api_routes loaded via api_bp")
except ImportError:
    try:
        from routes.api_routes import bp as api_bp
        app.register_blueprint(api_bp, url_prefix='/api')
        print("[OK] api_routes loaded via bp")
    except ImportError:
        try:
            from routes.api_routes import api as api_bp
            app.register_blueprint(api_bp, url_prefix='/api')
            print("[OK] api_routes loaded via api")
        except ImportError:
            print("[WARN] Could not load api_routes — check the Blueprint variable name")

# ── Realtime data ───────────────────────────────────────────────
try:
    from utils.realtime_data import get_live_matches, get_top_scorers
    print("[OK] realtime_data loaded")
except Exception as e:
    print(f"[WARN] realtime_data not found: {e}")
    def get_live_matches():
        return [
            {"home":"Brazil","away":"Argentina","home_score":2,"away_score":1,"minute":74,"status":"IN_PLAY","stage":"GROUP_STAGE"},
            {"home":"France","away":"Spain","home_score":1,"away_score":0,"minute":38,"status":"IN_PLAY","stage":"GROUP_STAGE"},
        ]
    def get_top_scorers():
        return [
            {"name":"Mbappé","team":"France","goals":4},
            {"name":"Vinicius Jr","team":"Brazil","goals":3},
        ]

# ── Socket events ───────────────────────────────────────────────
@socketio.on('connect')
def on_connect():
    print('[Socket] Client connected')
    try:
        emit('live_update', {
            'matches': get_live_matches(),
            'scorers': get_top_scorers(),
            'timestamp': time.strftime('%H:%M:%S')
        })
    except Exception as e:
        print(f"[Socket] emit error: {e}")

@socketio.on('disconnect')
def on_disconnect():
    print('[Socket] Client disconnected')

@socketio.on('request_update')
def on_request_update():
    emit('live_update', {
        'matches': get_live_matches(),
        'scorers': get_top_scorers(),
        'timestamp': time.strftime('%H:%M:%S')
    })

# ── REST endpoints ──────────────────────────────────────────────
@app.route('/api/live', methods=['GET'])
def live_data():
    return jsonify({
        'matches': get_live_matches(),
        'scorers': get_top_scorers(),
        'timestamp': time.strftime('%H:%M:%S')
    })

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'app': 'Cupify Coach'})

# ── Background broadcast every 30s ─────────────────────────────
def broadcast_loop():
    while True:
        time.sleep(30)
        try:
            socketio.emit('live_update', {
                'matches': get_live_matches(),
                'scorers': get_top_scorers(),
                'timestamp': time.strftime('%H:%M:%S')
            })
            print(f"[Socket] Broadcast sent at {time.strftime('%H:%M:%S')}")
        except Exception as e:
            print(f"[Socket] Broadcast error: {e}")

if __name__ == '__main__':
    print("⚽ Cupify Coach API starting on http://localhost:5000")
    print("   Make sure you've run knowledge_pipeline.py first!")
    t = threading.Thread(target=broadcast_loop, daemon=True)
    t.start()
    socketio.run(app, debug=False, port=5000, host='0.0.0.0')