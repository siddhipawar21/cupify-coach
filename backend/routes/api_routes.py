"""
Flask API Routes for Cupify Coach
-------------------------------
Endpoints:
  POST /api/ask       — Main Q&A endpoint
  POST /api/explain   — VAR / rule explanation mode
  GET  /api/health    — Health check
  GET  /api/topics    — Suggested topics
"""

from flask import Blueprint, request, jsonify
from utils.rag_engine import get_engine

api = Blueprint("api", __name__)
api_bp = api

SUPPORTED_LANGUAGES = ["English", "Hindi", "Marathi", "Spanish"]
SUPPORTED_LEVELS = ["Beginner", "Intermediate", "Fan"]

SUGGESTED_TOPICS = [
    {"id": 1, "emoji": "🟨", "title": "What is VAR?",                    "category": "Rules"},
    {"id": 2, "emoji": "⚽", "title": "How does offside work?",           "category": "Rules"},
    {"id": 3, "emoji": "🔄", "title": "What is a 4-3-3 formation?",       "category": "Tactics"},
    {"id": 4, "emoji": "⚡", "title": "What is a high press?",            "category": "Tactics"},
    {"id": 5, "emoji": "🌍", "title": "How does the World Cup work?",     "category": "World Cup"},
    {"id": 6, "emoji": "🏆", "title": "Who is hosting the 2026 World Cup?","category": "World Cup"},
    {"id": 7, "emoji": "🔴", "title": "When is a red card given?",        "category": "Rules"},
    {"id": 8, "emoji": "💨", "title": "What is momentum in soccer?",      "category": "Tactics"},
]


@api.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "service": "Cupify Coach API",
        "version": "1.0.0"
    })


@api.route("/topics", methods=["GET"])
def get_topics():
    return jsonify({"topics": SUGGESTED_TOPICS})


@api.route("/ask", methods=["POST"])
def ask():
    """
    Request body:
    {
        "question": "What is VAR?",
        "level": "Beginner",
        "language": "English"
    }
    """
    data = request.get_json()

    # Validate question exists
    if not data or not data.get("question"):
        return jsonify({"error": "Missing 'question' field"}), 400

    question = data["question"].strip()
    level    = data.get("level", "Beginner")
    language = data.get("language", "English")

    # Validate level and language
    if level not in SUPPORTED_LEVELS:
        return jsonify({"error": f"Invalid level. Choose from: {SUPPORTED_LEVELS}"}), 400
    if language not in SUPPORTED_LANGUAGES:
        return jsonify({"error": f"Invalid language. Choose from: {SUPPORTED_LANGUAGES}"}), 400

    # Validate question length
    if len(question) > 500:
        return jsonify({"error": "Question too long (max 500 characters)"}), 400

    try:
        engine = get_engine()
        result = engine.generate_answer(question, level=level, language=language)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": f"Internal error: {str(e)}"}), 500


@api.route("/explain", methods=["POST"])
def explain_var():
    """
    Request body:
    {
        "incident": "The referee gave a penalty but VAR overturned it",
        "level": "Beginner",
        "language": "English"
    }
    """
    data = request.get_json()

    if not data or not data.get("incident"):
        return jsonify({"error": "Missing 'incident' field"}), 400

    incident = data["incident"].strip()
    level    = data.get("level", "Beginner")
    language = data.get("language", "English")

    # Frame the question with VAR context for better retrieval
    question = f"Explain this VAR or referee decision in soccer: {incident}"

    try:
        engine = get_engine()
        result = engine.generate_answer(question, level=level, language=language)
        result["mode"] = "VAR Explainer"
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": f"Internal error: {str(e)}"}), 500