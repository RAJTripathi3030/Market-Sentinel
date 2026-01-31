from flask import Flask, request, jsonify
from flask_cors import CORS
from agents.scout_agent import search_with_query
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route('/api/search', methods=['POST'])
def search():
    """
    Endpoint to receive a search query from the frontend
    and return the tavily search results
    """
    try:
        data = request.json
        query = data.get('query', '')
        
        if not query:
            return jsonify({'error': 'Query is required'}), 400
        
        # Call the scout agent with the query
        result = search_with_query(query)
        
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
