import os
import json
import uuid
import time
from groq import Groq
from llama_index.core import(
    VectorStoreIndex,
    SimpleDirectoryReader,
    StorageContext,
    Settings
)
from llama_index.core.node_parser import SentenceSplitter
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.llms.groq import Groq as LlamaGroq
from llama_index.vector_stores.chroma import ChromaVectorStore
import chromadb
import uuid as uuid_module
from api.config.env import settings

os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_PROJECT"] = "RecruitAI-Production"

Settings.embed_model = HuggingFaceEmbedding(
    model_name="all-MiniLM-L6-v2"
)
Settings.llm = LlamaGroq(
    model="llama-3.3-70b-versatile"
)
Settings.text_splitter = SentenceSplitter(
    chunk_size=256,
    chunk_overlap=32
)

CHROMA_PATH = os.path.join(
    os.path.dirname(__file__), "chroma_db"
)
os.makedirs(CHROMA_PATH, exist_ok=True)

chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)
chroma_collection = chroma_client.get_or_create_collection(
    name="recruit_ai_cvs"
)

vector_store = ChromaVectorStore(
    chroma_collection = chroma_collection
)
storage_context = StorageContext.from_defaults(
    vector_store=vector_store
)

groq_client = Groq(api_key=settings.groq_api_key)

SCREENING_PROMPT = """You are a Senior Technical Recruiter with 10 years
experience hiring.

Return ONLY a valid JSON object with exactly these fields:
{
  "matchScore": <integer 0-100>,
  "skillBreakdown": [
    {"skill": "<skill name>", "found": <true|false>, "score": <0-100>}
  ],
  "strengths": ["<strength 1>", "<strength 2>"],
  "gaps": ["<gap 1>", "<gap 2>"],
  "aiSummary": "<2 sentence summary of candidate fit>",
  "status": "<shortlisted|reviewing|rejected>",
  "recommendation": "<Shortlist|Maybe|Reject>"
}

SCORING:
- 0-40:   Does not meet requirements → rejected
- 41-70:  Partially meets requirements → reviewing  
- 71-100: Meets or exceeds requirements → shortlisted

RULES:
- status must match score: 71-100=shortlisted, 41-70=reviewing, 0-40=rejected
- skillBreakdown must list each required skill from the job
- Return raw JSON only, no markdown, no explanation"""

def extract_candidate_info(cv_text: str) -> dict:
    """Extract candidate name and email from CV text using Groq"""
    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            max_tokens=100,
            temperature=0,
            messages=[
                {
                    "role": "system",
                    "content": """Extract the candidate name and email from this CV.
                        Return ONLY a JSON object like this:
                        {"name": "Full Name", "email": "email@example.com"}
                        If email not found use empty string.
                        If name not found use "Unknown Candidate".
                        Raw JSON only, no markdown."""
                },
                {
                    "role": "user",
                    "content": cv_text[:1000]  
                }
            ]
        )
        raw = response.choices[0].message.content
        clean = raw.strip().replace("```json","").replace("```","").strip()
        return json.loads(clean)
    except Exception:
        return {"name": "Unknown Candidate", "email": ""}
    
def extract_cv_text(file_path: str) -> str:
    """Extract text from PDF or DOCX"""
    from llama_index.core import SimpleDirectoryReader
    try:
        documents = SimpleDirectoryReader(
            input_files=[file_path]
        ).load_data()
        return "\n".join([doc.text for doc in documents])
    except Exception as e:
        raise Exception(f"Could not read file: {str(e)}")

def screen_cv(
    candidate_id: str,
    job_id: str,
    cv_path: str,
    job_title: str,
    job_description: str,
    requirements: list,
    candidate_name: str,
    candidate_email: str
) -> dict:
    """
    Full CV screening pipeline:
    1. Extract text from CV file
    2. Screen with Groq LLM
    3. Embed and store in Chroma for semantic search
    4. Return structured results
    """
    try:
        documents = SimpleDirectoryReader(
            input_files=[cv_path]
        ).load_data()
    except Exception as e:
        return _failed_result(f"Could not read CV file: {str(e)}")

    if not documents or not documents[0].text.strip():
        return _failed_result("CV appears to be empty or unreadable")

    cv_text = "\n".join([doc.text for doc in documents])

    for doc in documents:
        doc.metadata.update({
            "candidate_id": candidate_id,
            "candidate_name": candidate_name,
            "candidate_email": candidate_email,
            "job_id": job_id,
            "job_title": job_title
        })

    try:
        VectorStoreIndex.from_documents(
            documents,
            storage_context=storage_context
        )
    except Exception as e:
        print(f"Warning: Embedding failed: {str(e)}")

    requirements_str = ", ".join(requirements) if requirements else "Not specified"

    response = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        max_tokens=1024,
        temperature=0.1,
        messages=[
            {"role": "system", "content": SCREENING_PROMPT},
            {
                "role": "user",
                "content": f"""Job Title: {job_title}
Job Description: {job_description}
Required Skills: {requirements_str}

Candidate: {candidate_name}
CV:
{cv_text}"""
            }
        ]
    )

    raw = response.choices[0].message.content
    clean = raw.strip().replace("```json", "").replace("```", "").strip()

    try:
        return json.loads(clean)
    except json.JSONDecodeError:
        return _failed_result("AI returned invalid JSON")
    
def screen_multiple_cvs(
    job_id: str,
    job_title: str,
    job_description: str,
    requirements: list,
    file_paths: list  
) -> list:
    """
    Screen multiple CV files at once.
    Extracts candidate info automatically from each CV.
    Returns list of screening results.
    """

    results = []
    total = len(file_paths)
    print(f"Starting bulk screening: {total} files")

    for i, file_path in enumerate(file_paths):
        print(f"\n[{i+1}/{total}] Processing: {os.path.basename(file_path)}")

        try:
            documents = SimpleDirectoryReader(
                input_files=[file_path]
            ).load_data()

            if not documents:
                print("   No text extracted")
                continue

            cv_text = "\n".join([doc.text for doc in documents])

            if len(cv_text.strip()) < 50:
                print("CV too short to process")
                continue

            print(f"Extracted {len(cv_text)} chars")

            info = extract_candidate_info(cv_text)
            print(f"Candidate: {info['name']} | {info['email']}")

            candidate_id = str(uuid_module.uuid4())
            requirements_str = ", ".join(requirements) if requirements else "Not specified"

            response = groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                max_tokens=1024,
                temperature=0.1,
                messages=[
                    {"role": "system", "content": SCREENING_PROMPT},
                    {
                        "role": "user",
                        "content": f"""Job Title: {job_title}
Job Description: {job_description}
Required Skills: {requirements_str}

Candidate: {info['name']}
CV:
{cv_text}"""
                    }
                ]
            )

            raw = response.choices[0].message.content
            clean = raw.strip().replace("```json","").replace("```","").strip()
            screening = json.loads(clean)

            try:
                for doc in documents:
                    doc.metadata.update({
                        "candidate_id": candidate_id,
                        "candidate_name": info["name"],
                        "candidate_email": info["email"],
                        "job_id": job_id,
                        "job_title": job_title
                    })
                VectorStoreIndex.from_documents(
                    documents,
                    storage_context=storage_context
                )
            except Exception as embed_err:
                print(f"Embedding failed: {embed_err}")

            result = {
                "candidate_id": candidate_id,
                "name": info["name"],
                "email": info["email"],
                "file": os.path.basename(file_path),
                "cv_path": file_path,
                "match_score": screening.get("matchScore", 0),
                "status": screening.get("status", "pending"),
                "ai_summary": screening.get("aiSummary", ""),
                "skill_breakdown": screening.get("skillBreakdown", []),
                "recommendation": screening.get("recommendation", "Reject")
            }

            results.append(result)
            print(f"Score: {result['match_score']}/100 → {result['recommendation']}")

        except json.JSONDecodeError as e:
            print(f"JSON parse error: {e}")
            results.append({
                "candidate_id": str(uuid.uuid4()),
                "name": os.path.basename(file_path),
                "email": "",
                "file": os.path.basename(file_path),
                "cv_path": file_path,
                "match_score": 0,
                "status": "rejected",
                "ai_summary": "Screening failed — could not parse AI response",
                "skill_breakdown": [],
                "recommendation": "Reject"
            })

        except Exception as e:
            print(f"Error: {str(e)}")
            results.append({
                "candidate_id": str(uuid.uuid4()),
                "name": os.path.basename(file_path),
                "email": "",
                "file": os.path.basename(file_path),
                "cv_path": file_path,
                "match_score": 0,
                "status": "rejected",
                "ai_summary": f"Processing failed: {str(e)}",
                "skill_breakdown": [],
                "recommendation": "Reject"
            })

        if i < total - 1:
            time.sleep(3)

    print(f"\nBulk complete: {len(results)}/{total} processed")
    return results  
    
def search_candidates(
        query: str,
        job_id: str = None,
        top_n: int = 5
) -> list:
    """
    Semantic search across all stored CVs.
    Optionally filter by job_id.
     """
     
    index = VectorStoreIndex.from_vector_store(
         vector_store=vector_store
     )

    if job_id:
         from llama_index.core.vector_stores import MetadataFilters, ExactMatchFilter
         filters = MetadataFilters(filters=[
             ExactMatchFilter(key="job_id",  value=job_id)
         ])
         retriever = index.as_retriever(
             similarity_top_k = top_n,
             filters = filters
         )
    else:
        retriever = index.as_retriever(similarity_top_k = top_n)

    nodes = retriever.retrieve(query)

    results = []
    seen_candidates = set()

    for node in nodes:
        candidate_id = node.metadata.get("candidate_id", "")

        if candidate_id in seen_candidates:
            continue
        seen_candidates.add(candidate_id)

        results.append({
            "candidate_id": candidate_id,
            "name": node.metadata.get("candidate_name", ""),
            "email": node.metadata.get("candidate_email", ""),
            "job_id": node.metadata.get("job_id", ""),
            "semantic_similarity": round(node.score, 3) if node.score else 0,
            "cv_preview": node.text[:200]
        })
    return results

def delete_cv_embedding(candidate_id: str) -> None:
    """Remove candidate's CV chunks from Chroma"""
    try:
         results = chroma_collection.get(
             where={"candidate_id": candidate_id}
         )
         if results["ids"]:
             chroma_collection.delete(ids=results["ids"])
    except Exception as e:
        print(f"Warning: Could not delete embeddings: {str(e)}")

def _failed_result(reason: str) -> dict:
    return {
        "matchScore": 0,
        "skillBreakdown": [],
        "strengths": [],
        "gaps": [reason],
        "aiSummary": f"Screening failed: {reason}",
        "status": "rejected",
        "recommendation": "Reject"
    }

