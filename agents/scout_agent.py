from langchain.agents import create_agent
from langchain_google_genai import ChatGoogleGenerativeAI
from tavily import TavilyClient
from dotenv import load_dotenv
import os 

load_dotenv()
google_api_key = os.getenv("GOOGLE_API_KEY")
tavily_api_key = os.getenv("TAVILY_API_KEY")

if google_api_key and tavily_api_key:
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
    print(f"The current weather in {location} is sunny with a temperature of 75°F.")

def tavily_search(search_query: str) -> str:
    """
        This method returns the response whenever the user enters a search query
    """
    tavily_client = TavilyClient(api_key=tavily_api_key)
    response = tavily_client.search(search_query)

    print(f"{response}")

def tavily_crawl(crawl_url: str) -> str:
    """
        This method crawls the given url and returns the response
    """
    tavily_client = TavilyClient(api_key=tavily_api_key)
    response = tavily_client.crawl(crawl_url)
    print('\n')
    print(f"{response}")

scout = create_agent(
    model = llm,
    tools = [get_weather, tavily_search, tavily_crawl],
    system_prompt = "You are a helpful assistant that provides weather information.",
)

scout.invoke(
    {"messages": [
        {"role": "user", "content": "what is the weather in sf"},
        {"role": "user", "content": "who is Leo Messi?"},    
        {"role": "user", "content": "https://docs.tavily.com/sdk/python/quick-start"}
    ]}
)