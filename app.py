from flask import Flask, request, jsonify
from flask_cors import CORS
from agents.scout_agent import search_with_query, get_model_name_list
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY")

@app.route('/api/models', methods=['GET'])
def get_models():
    """
    Endpoint to fetch the list of available AI models
    """
    try:
        models = get_model_name_list(GEMINI_API_KEY)
        return jsonify({'models': models}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/search', methods=['POST'])
def search():
    """
    Endpoint to receive a search query and selected model from the frontend
    and return the tavily search results
    """
    try:
        data = request.json
        query = data.get('query', '')
        model = data.get('model', '')

        if not query:
            return jsonify({'error': 'Query is required'}), 400

        # Call the scout agent with the query and model
        result = search_with_query(query, model)

        return jsonify({'result': str(result)}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health():
    """
    Health check endpoint
    """
    return jsonify({'status': 'ok'}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)
