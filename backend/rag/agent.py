from dotenv import load_dotenv
from langgraph.prebuilt import create_react_agent
from langgraph.checkpoint.sqlite import SqliteSaver
from langchain_groq import ChatGroq
from rag.tools import tools
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
    temperature=0
)

MEMORY_DIR = os.path.join(os.path.dirname(__file__), "memory")
os.makedirs(MEMORY_DIR, exist_ok=True)

MEMORY_PATH = os.path.join(MEMORY_DIR, "recruitbot_memory.db")
conn = sqlite3.connect(MEMORY_PATH, check_same_thread=False)
checkpointer = SqliteSaver(conn)

SYSTEM_PROMPT = """You are RecruitBot, an expert AI hiring assistant
integrated into a recruitment platform.

You help recruiters make better hiring decisions by:
- Searching and ranking candidates semantically
- Providing detailed candidate analysis
- Automatically shortlisting or rejecting candidates
- Giving hiring summaries and recommendations

You have access to a real database of candidates and jobs.
Always use your tools to get accurate, up-to-date information.
Never make up candidate names, scores or details.

STRICT WORKFLOW — follow this exact order:
1. To answer anything about candidates for a job:
   FIRST call get_job_candidates_tool with the job_id
   This returns real candidate IDs from the database
   
2. To get details about a specific candidate:
   Use the ID returned by get_job_candidates_tool
   Never type an ID yourself

3. To give a hiring summary:
   Call get_hiring_summary_tool 
   CRITICAL: The tool response may contain a raw job UUID. 
   You must NEVER display this UUID string to the user. Instead, replace it with the human-readable job name
    (e.g., "Developer", "Manager", "Engineer") in your final response.

4. To search semantically:
   Call search_candidates_tool with a description

FORBIDDEN:
- Never type a candidate_id yourself
- Never use a name as an ID
- Never use placeholder or example values
- Only use IDs that came from a tool response

You remember previous conversations with each recruiter.
Reference past context when relevant to give better answers.

Be concise, professional and data-driven in your responses."""

agent = create_react_agent(
    model=llm,
    tools=tools,
    checkpointer=checkpointer
)

def run_agent(message: str, recruiter_id: str) -> str:
    """
    Run RecruitBot for a specific recruiter.
    Each recruiter has their own persistent memory thread.

    Args:
        message: The recruiter's message
        recruiter_id: The recruiter's user ID from PostgreSQL
                      Used as the thread ID for memory isolation
    """

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
     

                