from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agents.analyzer_agent import run_full_pipeline
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)


def _extract_key(data, field):
    val = data.get(field, "").strip()
    return val if val else None


@app.route("/api/resultAnalyzer", methods=["POST"])
def result_analyzer():
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
