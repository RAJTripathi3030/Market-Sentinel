from google import genai
import os
from dotenv import load_dotenv

load_dotenv()

# ── API key ────────────────────────────────────────────────────────────────────
GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY")
if GEMINI_API_KEY:
    print("✔ API key loaded")
else:
    print("✘ GOOGLE_API_KEY not found in environment")


# ── Model list ─────────────────────────────────────────────────────────────────
def get_model_name_list(api_key: str) -> list[str | None]:
    """
    Returns a list of Gemini model names that support content generation.
    """
    client = genai.Client(api_key=api_key)
    available_models: list[str | None] = []
    for model in client.models.list():
        # Only keep models that can generate content
        if hasattr(model, "supported_actions"):
            if "generateContent" in (model.supported_actions or []):
                available_models.append(model.name)
        else:
            # Older SDK versions: include all listed models
            available_models.append(model.name)
    return available_models


# ── Query expansion agent ───────────────────────────────────────────────────────
def expand_query(user_query: str, model_name: str) -> str | None:
    """
    Uses the selected Gemini model to rewrite and expand the user's query,
    covering the topic from multiple angles for richer search results.

    Args:
        user_query  : the raw query from the user
        model_name  : full model name, e.g. 'models/gemini-2.0-flash'

    Returns:
        An expanded, multi-angle version of the query as a string.
    """
    client = genai.Client(api_key=GEMINI_API_KEY)

    prompt = (
        "You are a query-expansion agent for a financial market research system.\n"
        "Given the following user query, rewrite it as 3–5 concise search queries "
        "that cover the topic from different angles (technical, fundamental, news, "
        "sentiment, macro). Return ONLY the queries, one per line, no numbering or "
        "extra commentary.\n\n"
        f"Original query: {user_query}"
    )

    response = client.models.generate_content(
        model=model_name,
        contents=prompt,
    )

    return response.text


# ── Search orchestrator ─────────────────────────────────────────────────────────
def search_with_query(query: str, model: str) -> str:
    """
    Entry point called by the Flask backend.
    1. Expands the raw query using the selected Gemini model.
    2. Returns the expanded queries (Tavily search can be wired in here later).

    Args:
        query : raw user query
        model : selected Gemini model name (e.g. 'models/gemini-2.0-flash')

    Returns:
        A string with the expanded search queries.
    """
    if not query:
        return "Error: empty query."

    if not model:
        return "Error: no model selected."

    try:
        expanded = expand_query(query, model)
        # ── Placeholder for Tavily / web search ────────────────────────────────
        # When a TAVILY_API_KEY is configured you can add:
        #   from tavily import TavilyClient
        #   tv = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))
        #   results = []
        #   for sub_query in expanded.splitlines():
        #       results.append(tv.search(sub_query))
        #   return str(results)
        # ───────────────────────────────────────────────────────────────────────
        return f"**Expanded Queries (via {model.split('/')[-1]}):**\n\n{expanded}"
    except Exception as e:
        return f"Error during query expansion: {str(e)}"
