from google import genai
import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY")


# ── Shared Gemini caller ────────────────────────────────────────────────────────
def _call_gemini(model: str, prompt: str, gemini_api_key: str = None) -> str:
    """Shared helper that calls Gemini and returns the text response."""
    key = gemini_api_key or GEMINI_API_KEY
    client = genai.Client(api_key=key)
    response = client.models.generate_content(model=model, contents=prompt)
    return response.text.strip() if response.text else ""


# ── Agent 2: Data Analyst ──────────────────────────────────────────────────────
def run_data_analyst(
    results: list,
    query: str,
    model: str,
    feedback: str = "",
    gemini_api_key: str = None,
) -> str:
    """
    Senior Market Analyst agent.
    Receives raw Tavily search results and produces a structured SWOT analysis.
    If feedback is provided (from the Critic), it revises the previous report.

    Args:
        results  : Tavily search result list from run_tavily_search()
        query    : Original user query
        model    : Gemini model name
        feedback : Optional Critic rejection feedback to act on

    Returns:
        Structured markdown analysis report.
    """
    # Format raw results for the prompt
    formatted = ""
    for i, item in enumerate(results):
        if item.get("type") == "answer":
            formatted += f"[SYNTHESIZED ANSWER]\n{item.get('content', '')}\n\n"
        elif item.get("type") == "result":
            formatted += (
                f"[SOURCE {i}] {item.get('title', '')}\n"
                f"URL: {item.get('url', '')}\n"
                f"Content: {item.get('content', '')}\n"
                f"Relevance Score: {item.get('score', 0)}\n\n"
            )

    revision_note = (
        f"\n\n**REVISION REQUIRED — Critic Feedback:**\n{feedback}\n"
        "Address all points above in your revised analysis."
        if feedback
        else ""
    )

    prompt = (
        "You are a Senior Market Analyst. Your role is to identify specific trends, "
        "anomalies, and competitor strategy shifts from raw data sources. "
        "You must output a structured analysis — do not speculate beyond what the sources support.\n\n"
        f"**Research Query:** {query}\n"
        f"{revision_note}\n"
        "**Instructions:**\n"
        "Analyze the data sources below and produce a report with these clearly labeled sections:\n\n"
        "## SWOT Analysis\n"
        "### Strengths\n- (cite sources)\n"
        "### Weaknesses\n- (cite sources)\n"
        "### Opportunities\n- (cite sources)\n"
        "### Threats\n- (cite sources)\n\n"
        "## Key Trends & Anomalies\n"
        "- Identify 3-5 significant patterns, shifts, or outliers found in the data.\n\n"
        "## Competitor Strategy Shifts\n"
        "- Identify any moves by competitors or market players visible in the data.\n\n"
        "## Data Gaps\n"
        "- Be honest about what information was missing or unclear from the sources.\n\n"
        "--- RAW DATA SOURCES ---\n"
        f"{formatted}"
    )

    return _call_gemini(model, prompt, gemini_api_key)


# ── Agent 3: The Critic ────────────────────────────────────────────────────────
def run_critic(
    analyst_report: str, query: str, model: str, gemini_api_key: str = None
) -> str:
    """
    Ruthless Editor / Critic agent.
    Reviews the Analyst's report for logical fallacies, missing citations,
    or vague claims. Returns either 'APPROVED' or 'REJECTED: <specific feedback>'.

    Args:
        analyst_report : The report produced by run_data_analyst()
        query          : Original user query
        model          : Gemini model name

    Returns:
        A string starting with 'APPROVED' or 'REJECTED: ...'
    """
    prompt = (
        "You are a ruthless editor and fact-checker. You have received a market analysis report "
        "that needs rigorous review before it reaches C-suite executives.\n\n"
        f"**Original Research Query:** {query}\n\n"
        "**Your Review Criteria — reject the report if ANY of the following are true:**\n"
        "1. Claims are made without citing a specific source\n"
        "2. Logical fallacies or contradictions exist in the analysis\n"
        "3. SWOT sections are vague, generic, or not grounded in the provided data\n"
        "4. Key Trends section is superficial (less than 3 substantive points)\n"
        "5. Competitor Shifts section is empty or speculative without source backing\n\n"
        "**Output Format (STRICT):**\n"
        "- If the report passes all criteria: respond with exactly `APPROVED` (nothing else).\n"
        "- If the report fails: respond with `REJECTED: ` followed by specific, numbered feedback "
        "the analyst must act on. Be concrete — point to the exact section and the exact problem.\n\n"
        "--- ANALYST REPORT TO REVIEW ---\n"
        f"{analyst_report}"
    )

    return _call_gemini(model, prompt, gemini_api_key)


# ── Agent 4: Strategy Director ─────────────────────────────────────────────────
def run_strategy_director(
    analyst_report: str, query: str, model: str, gemini_api_key: str = None
) -> str:
    """
    C-Suite Advisor / Strategy Director agent.
    Receives the Critic-approved analysis and produces final strategic recommendations.

    Args:
        analyst_report : The approved report from the Analyst
        query          : Original user query
        model          : Gemini model name

    Returns:
        Strategic executive briefing as a formatted markdown string.
    """
    prompt = (
        "You are a C-Suite Strategy Advisor. You have received a Critic-approved market analysis. "
        "Your job is to translate this analysis into clear, actionable strategic recommendations "
        "for executive decision-makers. Be concise, specific, and bold.\n\n"
        f"**Strategic Question:** {query}\n\n"
        "**Output the following sections:**\n\n"
        "## Executive Briefing\n"
        "A 3-4 sentence overview of the situation for a time-pressed executive.\n\n"
        "## Strategic Recommendations\n"
        "3-5 specific, numbered action items. Each must include:\n"
        "- What to do\n"
        "- Why (linked to the analysis)\n"
        "- Urgency level: 🔴 Immediate / 🟡 Short-term / 🟢 Long-term\n\n"
        "## Risk Watch\n"
        "2-3 risks that could invalidate these recommendations. What signals to watch for.\n\n"
        "## Bottom Line\n"
        "One crisp sentence — the single most important takeaway for leadership.\n\n"
        "--- APPROVED ANALYST REPORT ---\n"
        f"{analyst_report}"
    )

    return _call_gemini(model, prompt, gemini_api_key)


# ── Orchestrator: Full Pipeline ────────────────────────────────────────────────
def run_full_pipeline(
    results: list, query: str, model: str, gemini_api_key: str = None
) -> dict:
    """
    Orchestrates the full 3-agent pipeline.
    Uses gemini_api_key if provided, else falls back to env var.
    """
    eff_key = gemini_api_key or GEMINI_API_KEY
    if not eff_key:
        raise ValueError("GOOGLE_API_KEY is not set and no key was provided.")

    analyst_report = run_data_analyst(results, query, model, gemini_api_key=eff_key)
    critic_verdict = run_critic(analyst_report, query, model, gemini_api_key=eff_key)

    if critic_verdict.upper().startswith("REJECTED"):
        feedback = critic_verdict[len("REJECTED:") :].strip()
        analyst_report = run_data_analyst(
            results, query, model, feedback=feedback, gemini_api_key=eff_key
        )
        critic_verdict = run_critic(
            analyst_report, query, model, gemini_api_key=eff_key
        )

    strategy_report = run_strategy_director(
        analyst_report, query, model, gemini_api_key=eff_key
    )

    return {
        "analyst_report": analyst_report,
        "critic_verdict": critic_verdict,
        "strategy_report": strategy_report,
    }
