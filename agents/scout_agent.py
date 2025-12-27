from langchain.agents import create_agent
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
import os 

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")

if api_key:
    print("API Key Found!!")
else:
    print("Error!! No API Key Found")



llm = ChatGoogleGenerativeAI(
    model = "gemini-2.5-flash",
    temperature = 0,
)

def get_weather(location: str) -> str:
    """
    This method returns the current weather information when called.
    """
    return f"The current weather in {location} is sunny with a temperature of 75°F."

scout = create_agent(
    model = llm,
    tools = [get_weather],
    system_prompt = "You are a helpful assistant that provides weather information.",
)

scout.invoke(
    {"messages": [{"role": "user", "content": "what is the weather in sf"}]}
)