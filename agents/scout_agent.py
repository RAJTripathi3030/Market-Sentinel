from google import genai
from tavily import TavilyClient
import os
from dotenv import load_dotenv

load_dotenv()

# ── API key ────────────────────────────────────────────────────────────────────
GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")

if GEMINI_API_KEY and TAVILY_API_KEY:
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


# ── Step 1: Query expansion (Gemini only) ─────────────────────────────────────
def expand_query_only(query: str | None, model: str | None) -> str:
    """
    Expands the raw user query into 3-5 sub-queries using the selected Gemini
    model. Called by the /api/analyse endpoint.

    Args:
        query : raw user query
        model : full Gemini model name (e.g. 'models/gemini-2.0-flash')

    Returns:
        A string of expanded sub-queries, one per line.
    """
    if not query:
        return "Error: empty query."
    if not model:
        return "Error: no model selected."

    try:
        return expand_query(query, model)
    except Exception as e:
        return f"Error during query expansion: {str(e)}"


# ── Step 2: Tavily web search ──────────────────────────────────────────────────
def run_tavily_search(query: str) -> list:
    """
    Runs a Tavily search on the original query and returns structured results.
    Called by the /api/search endpoint after the user has analysed their query.

    Args:
        query : the original raw user query

    Returns:
        A list of result dicts, each with keys: title, url, content, score.
        Also includes a top-level 'answer' key if Tavily returns one.
    """
    if not TAVILY_API_KEY:
        raise ValueError("TAVILY_API_KEY is not set in environment.")

    tavily_client = TavilyClient(TAVILY_API_KEY)
    response = tavily_client.search(
        query=query,
        include_answer="advanced",
        topic="news",
        search_depth="advanced",
        max_results=6,
    )

    results = []
    # Top-level synthesised answer (if available)
    if response.get("answer"):
        results.append({"type": "answer", "content": response["answer"]})

    # Individual web results
    for r in response.get("results", []):
        results.append(
            {
                "type": "result",
                "title": r.get("title", ""),
                "url": r.get("url", ""),
                "content": r.get("content", ""),
                "score": r.get("score", 0),
            }
        )

    return results
