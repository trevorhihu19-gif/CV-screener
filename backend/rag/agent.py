from dotenv import load_dotenv
from langgraph.prebuilt import create_react_agent
from langgraph.checkpoint.sqlite import SqliteSaver
from langchain_groq import ChatGroq
from rag.tools import tools
from api.cache import agent_cache, is_cacheable
from api.config.env import settings
import sqlite3
import os
import warnings

load_dotenv()
warnings.filterwarnings("ignore", category=DeprecationWarning)

os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = os.getenv("LANGCHAIN_API_KEY", "")
os.environ["LANGCHAIN_PROJECT"] = "RecruitAI-Production"

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    api_key=settings.groq_api_key,
    max_tokens=1024,
    temperature=0
)

MEMORY_DIR = os.path.join(os.path.dirname(__file__), "memory")
os.makedirs(MEMORY_DIR, exist_ok=True)

MEMORY_PATH = os.path.join(MEMORY_DIR, "recruitbot_memory.db")
conn = sqlite3.connect(MEMORY_PATH, check_same_thread=False)
checkpointer = SqliteSaver(conn)

SYSTEM_PROMPT = """You are RecruitBot, an expert AI hiring assistant.You are integrated into a recruitment
platform.

SPEED RULES — follow these to answer quickly:
1. ALWAYS call get_job_overview_tool FIRST with the job_id
   It gives you ALL candidates and job details in ONE call
2. For status changes use bulk_update_status_tool for multiple
   candidates — never call update_candidate_status_tool in a loop
3. Answer after 1-2 tool calls maximum
4. Be concise — 3-5 sentences max unless asked for details

WORKFLOW:
- Any question about candidates → get_job_overview_tool → answer
- Shortlist/reject request → get_job_overview_tool → bulk_update_status_tool
- Search by skill → search_candidates_tool

FORBIDDEN:
- Never use a name or example value as a candidate_id
- Never make more than 3 tool calls per message
- Never call the same tool twice in one response
- Only use IDs from tool output

You have access to real PostgreSQL data. Be direct and data-driven."""


agent = create_react_agent(
    model=llm,
    tools=tools,
    prompt=SYSTEM_PROMPT,
    checkpointer=checkpointer
)

def run_agent(message: str, recruiter_id: str, job_id: str = "") -> str:
    """
    Run RecruitBot for a specific recruiter.
    Run agent with caching for repeated questions.
    Each recruiter has their own persistent memory thread.

    Args:
        message: The recruiter's message
        recruiter_id: The recruiter's user ID from PostgreSQL
                      Used as the thread ID for memory isolation
    """

    if is_cacheable(message):
        cached = agent_cache.get(message, job_id, recruiter_id)
        if cached:
            return cached

    config = {
        "configurable": {
            "thread_id": f"recruiter_{recruiter_id}"
        }
    }

    try:
        result = agent.invoke(
            {"messages": [{"role": "user", "content": message}]},
            config=config
        )
        messages = result.get("messages", []) if isinstance(result, dict) else getattr(result, "messages", []) or []
        if messages:
            last = messages[-1]
            content = getattr(last, "content", None) or (last.get("content") if isinstance(last, dict) else None)
            if content is not None:
                return content
        return ""
    except ValueError as e:
        if "ToolMessage" in str(e):
            try:
                conn.execute(
                    "DELETE FROM checkpoints WHERE thread_id = ?",
                    (f"recruiter_{recruiter_id}",)
                )
                conn.commit()
            except Exception:
                pass
            return (
                "I had a memory issue and cleared it. "
                "Please try your message again."
            )
        raise
    
def stream_agent(message: str, recruiter_id: str):
    """
    Stream RecruitBot responses for a specific recruiter.
    """

    config = {
        "configurable": {
            "thread_id": f"recruiter_{recruiter_id}"
        }
    }

    for chunk in agent.stream(
        {"messages": [{"role": "user", "content": message}]},
        config=config,
        stream_mode="updates"
    ):
        for node, values in chunk.items():
            for msg in values.get("messages", []):
                if (hasattr(msg, "content") and
                        msg.content and
                        not getattr(msg, "tool_calls", None)):
                    yield msg.content

def get_recruiter_memory(recruiter_id: str) -> dict:
    """
    Get memory stats for a recruiter's thread.
    Useful for debugging or showing conversation history.
    """

    config = {
        "configurable": {
            "thread_id": f"recruiter_{recruiter_id}"
        }
    }
    try:
        state = agent.get_state(config)
        messages = state.values.get("messages", [])
        return {
            "thread_id": f"recruiter_{recruiter_id}",
            "total_messages": len(messages),
            "has_history": len(messages) > 0
        }
    except Exception:
        return {
            "thread_id": f"recruiter_{recruiter_id}",
            "total_messages": 0,
            "has_history": False
        }
    
def clear_recruiter_memory(recruiter_id: str) -> str:
    """
    Clear a recruiter's conversation history.
    Useful when they want to start fresh.
    """

    return f"Memory cleared for recruiter {recruiter_id}"
     

                