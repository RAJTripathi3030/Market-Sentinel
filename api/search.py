from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agents.scout_agent import run_tavily_search
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)


def _extract_key(data, field):
    val = data.get(field, "").strip()
    return val if val else None


@app.route("/api/search", methods=["POST"])
def search():
    try:
        data = request.json
        query = data.get("query", "").strip()
        tavily_key = _extract_key(data, "tavily_key")

        if not query:
            return jsonify({"error": "Query is required"}), 400

        results = run_tavily_search(query, tavily_api_key=tavily_key)
        return jsonify({"results": results}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
