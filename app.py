from flask import Flask, request, jsonify
from flask_cors import CORS
from agents.scout_agent import expand_query_only, run_tavily_search, get_model_name_list
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY")


@app.route("/api/models", methods=["GET"])
def get_models():
    """Fetch the list of available Gemini models."""
    try:
        models = get_model_name_list(GEMINI_API_KEY)
        return jsonify({"models": models}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/analyse", methods=["POST"])
def analyse():
    """
    Step 1 — Query expansion only (Gemini).
    Accepts: { query, model }
    Returns: { expanded: "..." }
    """
    try:
        data = request.json
        query = data.get("query", "").strip()
        model = data.get("model", "").strip()

        if not query:
            return jsonify({"error": "Query is required"}), 400
        if not model:
            return jsonify({"error": "Model is required"}), 400

        expanded = expand_query_only(query, model)
        return jsonify({"expanded": expanded}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/search", methods=["POST"])
def search():
    """
    Step 2 — Tavily web search only.
    Accepts: { query }
    Returns: { results: [ { type, title, url, content, score } ] }
    """
    try:
        data = request.json
        query = data.get("query", "").strip()

        if not query:
            return jsonify({"error": "Query is required"}), 400

        results = run_tavily_search(query)
        return jsonify({"results": results}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/health", methods=["GET"])
def health():
    """Health check endpoint."""
    return jsonify({"status": "ok"}), 200


if __name__ == "__main__":
    app.run(debug=True, port=5000)
