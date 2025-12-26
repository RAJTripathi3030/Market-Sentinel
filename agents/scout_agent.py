from langchain.agents import create_agent

def get_weather(location: str) -> str:
    """
    This method returns the current weather information when called.
    """
    return f"The current weather in {location} is sunny with a temperature of 75°F."

scout = create_agent(
    model = "claude-sonnet-4-5-20250929",
    tools = [get_weather],
    system_prompt = "You are a scout agent that provides weather information.",
)

scout.invoke(
    {"messages": [{"role": "user", "content": "what is the weather in sf"}]}
)