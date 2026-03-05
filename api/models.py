from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os

# Add the root project directory to path so we can import agents
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agents.scout_agent import get_model_name_list
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY")


@app.route("/api/models", methods=["GET"])
def get_models():
    try:
        models = get_model_name_list(GEMINI_API_KEY)
        return jsonify({"models": models}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
