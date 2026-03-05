from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agents.scout_agent import expand_query_only
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY")


def _extract_key(data, field):
    val = data.get(field, "").strip()
    return val if val else None


@app.route("/api/analyse", methods=["POST"])
def analyse():
    try:
        data = request.json
        query = data.get("query", "").strip()
        model = data.get("model", "").strip()
        gemini_key = _extract_key(data, "gemini_key")

        if not query:
            return jsonify({"error": "Query is required"}), 400
        if not model:
            return jsonify({"error": "Model is required"}), 400

        expanded = expand_query_only(query, model, gemini_api_key=gemini_key)
        return jsonify({"expanded": expanded}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
