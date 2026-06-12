from langchain_core.tools import tool
from rag.pipeline import search_candidates
from api.config.db import SessionLocal
from api.models.candidate import Candidate
from api.models.job import Job
import json
import uuid

@tool
def search_candidates_tool(query: str, job_id: str = None) -> str:
    """Search for candidates using semantic search.

    Use this when you need to find relevant candidates
    for a role using natural language description.
    IMPORTANT: job_id is optional. If not provided, searches all candidates.

    Args:
        query: Natural language description of candidate needed
               e.g. 'Python developer with FastAPI experience'
        job_id: Optional job ID to filter candidates by job

    Returns list of matching candidates with similarity scores."""

    results = search_candidates(
        query=query,
        job_id=job_id if job_id else None,
        top_n=5
    )

    if not results:
        return "No candidates found matching that description"
    
    output = []
    for r in results:
        output.append(
            f"Name: {r['name']} | "
            f"Email: {r['email']} | "
            f"Similarity: {r['semantic_similarity']} | "
            f"Preview: {r['cv_preview'][:150]}"
        )

    return "\n\n".join(output)

@tool
def get_job_candidates_tool(job_id: str) -> str:
    """Get all screened candidates for a specific job,
    sorted by match score from highest to lowest.

    Use this when you need to see all candidates
    that have been screened for a particular job.

    Args:
        job_id: The UUID of the job to get candidates for

    Returns ranked list of candidates with scores and status."""

    session = SessionLocal()
    try:
        candidates = session.query(Candidate).filter(
            Candidate.job_id == job_id
        ).order_by(
            Candidate.match_score.desc()
        ).all()

        if not candidates:
            return f"No candidates found for job {job_id}"
        
        output = [f"Found {len(candidates)} candidates:\n"]
        for i, c in enumerate(candidates, 1):
            output.append(
                f"{i}. {c.name} ({c.email})\n"
                f"Score: {c.match_score}/100 | "
                f"Status: {c.status}\n"
                f"Summary: {c.ai_summary[:200] if c.ai_summary else 'N/A'}"
            )
        
        return "\n".join(output)
    finally:
        session.close()

@tool
def get_candidate_details_tool(candidate_id: str) -> str:
    """Get full details of a specific candidate including
    their skill breakdown and AI summary.

    Use this when you need detailed information about
    a specific candidate before making a recommendation.

    IMPORTANT: candidate_id must be a UUID like 
    'abc-123-def-456', NOT a candidate name.
    Always call get_job_candidates_tool first to get 
    the correct UUID, then use that UUID here.

    Args:
        candidate_id: The UUID of the candidate(NOT their name)

    Returns full candidate profile with all screening data."""

    try:
        uuid.UUID(candidate_id)
    except ValueError:
        return (
            f"ERROR: '{candidate_id}' is not a valid candidate ID. "
            f"You must call get_job_candidates_tool first to get "
            f"real candidate IDs from the database."
        )

    session = SessionLocal()
    try:
        candidate = session.query(Candidate).filter(
            Candidate.id == candidate_id
        ).first()

        if not candidate:
            return f"Candidate {candidate_id} not found"
        
        skills = json.dumps(
            candidate.skill_breakdown, indent=2
        ) if candidate.skill_breakdown else "No skill data"

        return (
            f"Candidate: {candidate.name}\n"
            f"Email: {candidate.email}\n"
            f"Match Score: {candidate.match_score}/100\n"
            f"Status: {candidate.status}\n"
            f"AI Summary: {candidate.ai_summary}\n"
            f"Skill Breakdown:\n{skills}"
        )
    
    finally:
        session.close()

@tool
def shortlist_candidate_tool(candidate_id: str, reason: str) -> str:
    """Mark a candidate as shortlisted in the database.

    Use this when a candidate scores well and should be
    moved forward in the hiring process.

    Args:
        candidate_id: The UUID of the candidate to shortlist
        reason: Why this candidate is being shortlisted

    Returns confirmation of status update."""

    try:
        uuid.UUID(candidate_id)
    except ValueError:
        return (
            f"ERROR: '{candidate_id}' is not a valid candidate ID. "
            f"You must call get_job_candidates_tool first to get "
            f"real candidate IDs from the database."
        )
     
    session = SessionLocal()
    try:
        candidate = session.query(Candidate).filter(
            Candidate.id == candidate_id
        ).first()

        if not candidate:
            return f"Candidate {candidate_id} not found"
        
        candidate.status = "shortlisted"
        session.commit()
        session.refresh(candidate)

        return(
            f"{candidate.name} has been shortlisted.\n"
            f"Reason: {reason}\n"
            f"Score: {candidate.match_score}/100"
        )
    
    finally:
        session.close()

@tool
def reject_candidate_tool(candidate_id: str, reason: str) -> str:
    """Mark a candidate as rejected in the database.

    Use this when a candidate clearly does not meet
    the job requirements.

    IMPORTANT: candidate_id must be a UUID like 
    'abc-123-def-456', NOT a candidate name.
    Always call get_job_candidates_tool first to get 
    the correct UUID, then use that UUID here.

    Args:
        candidate_id: The UUID of the candidate to reject
        reason: Why this candidate is being rejected

    Returns confirmation of status update."""

    try:
        uuid.UUID(candidate_id)
    except ValueError:
        return (
            f"ERROR: '{candidate_id}' is not a valid candidate ID. "
            f"You must call get_job_candidates_tool first to get "
            f"real candidate IDs from the database."
        )

    session = SessionLocal()
    try:
        candidate = session.query(Candidate).filter(
            Candidate.id == candidate_id
        ).first()

        if not candidate:
            return f"Candidate {candidate_id} not found"
        
        candidate.status = "rejected"
        session.commit()
        session.refresh(candidate)

        return(
            f"{candidate.name} has been rejected.\n"
            f"Reason: {reason}"
        )
    finally:
        session.close()

@tool
def get_job_details_tool(job_id: str) -> str:
    """Get the details of a specific job posting.

    Use this to understand what requirements a job has
    before searching for or evaluating candidates.

    Args:
        job_id: The UUID of the job

    Returns job title, description and requirements."""

    session = SessionLocal()
    try:
        job = session.query(Job).filter(
            Job.id == job_id
        ).first()

        if not Job:
            return f"Job {job_id} not found"
        
        requirements = ", ".join(job.requirements) \
        if job.requirements else "Not specified"

        return(
            f"Job Title: {job.title}\n"
            f"Description: {job.description}\n"
            f"Requirements: {requirements}"
        )
    finally:
        session.close()

@tool
def get_hiring_summary_tool(job_id: str) -> str:
    """Get a hiring summary for a job — total candidates,
    shortlisted count, rejected count, average score.

    Use this when a recruiter wants an overview of
    where the hiring process stands for a role.

    Args:
        job_id: The UUID of the job

    Returns statistics about the candidate pool."""

    session = SessionLocal()
    try:
        candidates = session.query(Candidate).filter(
            Candidate.job_id == job_id
        ).all()

        if not candidates:
            return f"No candidates found for job {job_id}"
        
        total = len(candidates)
        shortlisted = sum(
            1 for c in candidates if c.status == "shortlisted"
        )
        rejected = sum(
            1 for c in candidates if c.status == "rejected"
        )
        reviewing = sum(
            1 for c in candidates if c.status == "reviewing"
        )
        avg_score = sum(
            c.match_score for c in candidates
        ) / total if total > 0 else 0

        top = max(candidates, key=lambda c: c.match_score)

        return (
            f"Hiring Summary for Job {job_id}:\n"
            f"Total candidates:  {total}\n"
            f"Shortlisted:       {shortlisted}\n"
            f"Reviewing:         {reviewing}\n"
            f"Rejected:          {rejected}\n"
            f"Average score:     {avg_score:.1f}/100\n"
            f"Top candidate:     {top.name} ({top.match_score}/100)"
        )
    finally:
        session.close()
        
tools = [
    search_candidates_tool,
    get_job_candidates_tool,
    get_candidate_details_tool,
    shortlist_candidate_tool,
    reject_candidate_tool,
    get_job_details_tool,
    get_hiring_summary_tool
]