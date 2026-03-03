from flask import Flask, request, jsonify
from flask_cors import CORS
from agents.scout_agent import expand_query_only, run_tavily_search, get_model_name_list
from agents.analyzer_agent import run_full_pipeline
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY")


def _extract_key(data: dict, field: str) -> str | None:
    """Extract an optional user-provided API key from the request body."""
    val = data.get(field, "").strip()
    return val if val else None


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
    Step 1 — Query expansion (Research Scout / Gemini).
    Accepts: { query, model, gemini_key? }
    Returns: { expanded: "..." }
    """
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


@app.route("/api/search", methods=["POST"])
def search():
    """
    Step 2 — Tavily web search (Research Scout).
    Accepts: { query, tavily_key? }
    Returns: { results: [ { type, title, url, content, score } ] }
    """
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


@app.route("/api/resultAnalyzer", methods=["POST"])
def result_analyzer():
    """
    Step 3 — Full 4-agent pipeline:
    Data Analyst → Critic (± revision) → Strategy Director.
    Accepts: { results, query, model, gemini_key? }
    Returns: { analyst_report, critic_verdict, strategy_report }
    """
    try:
        data = request.json
        results = data.get("results", [])
        query = data.get("query", "").strip()
        model = data.get("model", "").strip()
        gemini_key = _extract_key(data, "gemini_key")

        if not results:
            return jsonify({"error": "Search results are required"}), 400
        if not query:
            return jsonify({"error": "Query is required"}), 400
        if not model:
            return jsonify({"error": "Model is required"}), 400

        pipeline_output = run_full_pipeline(
            results, query, model, gemini_api_key=gemini_key
        )
        return jsonify(pipeline_output), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/health", methods=["GET"])
def health():
    """Health check endpoint."""
    return jsonify({"status": "ok"}), 200


if __name__ == "__main__":
    app.run(debug=True, port=5000)
