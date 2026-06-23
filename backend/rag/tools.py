from langchain_core.tools import tool
from rag.pipeline import search_candidates
from api.config.db import SessionLocal
from api.models.candidate import Candidate
from api.models.job import Job
from uuid import UUID as PyUUID
import json
import uuid as uuid_lib

def is_valid_uuid(value: str) -> bool:
    """Check if a string is a valid UUID"""

    try:
        uuid_lib.UUID(str(value))
        return True
    except (ValueError, AttributeError):
        return False
        
@tool
def get_job_overview_tool(job_id: str) -> str:
    """Get complete overview of a job including ALL candidates
    with their scores, status and summaries in a single call.

    Use this as your FIRST tool for almost every question.
    It returns everything you need to answer most questions
    without needing additional tool calls.

    Args:
        job_id: UUID of the job from the message context
    """

    if not is_valid_uuid(job_id):
        return f"Error: '{job_id}' is not a valid UUID"
    
    session = SessionLocal()
    try:
        job = session.query(Job).filter(
            Job.id == PyUUID(job_id)
        ).first()

        if not job:
            return f"Job {job_id} not found"
        
        candidates = session.query(Candidate).filter(
            Candidate.job_id == PyUUID(job_id)
        ).order_by(
            Candidate.match_score.desc()
        ).all()

        if not candidates:
            return (
                f"Job: {job.title}\n"
                f"Description: {job.description}\n"
                f"Requirements: {', '.join(job.requirements or [])}\n\n"
                f"No candidates screened yet for this job."
            )
        
        total = len(candidates)
        shortlisted = sum(1 for c in candidates if c.status == "shortlisted")
        reviewing = sum(1 for c in candidates if c.status == "reviewing")
        rejected = sum(1 for c in candidates if c.status == "rejected")
        avg_score = sum(c.match_score for c in candidates) / total

        output = [
            f"JOB: {job.title}",
            f"Description: {job.description}",
            f"Requirements: {', '.join(job.requirements or [])}",
            "CANDIDATES OVERVIEW:",
            f"Total: {total} | Shortlisted: {shortlisted} | "
            f"Reviewing: {reviewing} | Rejected: {rejected}",
            f"Average Score: {avg_score:.1f}/100",
            "ALL CANDIDATES (ranked by score):",
        ]

        for i, c in enumerate(candidates, 1):
            output.append(
                f"\n{i}. {c.name} (ID: {c.id})"
                f"\n   Email: {c.email}"
                f"\n   Score: {c.match_score}/100 | Status: {c.status}"
                f"\n   Summary: {c.ai_summary}"
            )

        return "\n".join(output)

    finally:
        session.close()

@tool
def update_candidate_status_tool(
    candidate_id: str,
    new_status: str,
    reason: str
) -> str:
    """Update a candidate's status in the database.

    Use this to shortlist, reject or mark candidates for review.
    Always get the candidate ID from get_job_overview_tool first.

    Args:
        candidate_id: UUID from get_job_overview_tool output
        new_status: Must be exactly one of:
                    shortlisted, reviewing, rejected, pending
        reason: Why you are changing the status
    """

    if not is_valid_uuid(candidate_id):
        return (
            f"Error: '{candidate_id}' is not valid"
            f"Call get_job_overview_tool first to get real IDs"
        )
    
    valid_statuses = ["shortlisted", "reviewing", "rejected", "pending"]
    if new_status not in valid_statuses:
        return f"Error: status must be one of {valid_statuses}"
    
    session = SessionLocal()
    try:
        candidate = session.query(Candidate).filter(
            Candidate.id == PyUUID(candidate_id)
        ).first()

        if not candidate:
            return f"Candidate {candidate_id} not found"
        
        old_status = candidate.status
        candidate.status = new_status
        session.commit()

        action = "Shortlisted" if new_status == "shortlisted" else \
                 "Rejected" if new_status == "rejected" else \
                 "Moved to reviewing"

        return (
            f"{action}: {candidate.name}\n"
            f"Score: {candidate.match_score}/100\n"
            f"Status: {old_status} → {new_status}\n"
            f"Reason: {reason}"
        )

    finally:
        session.close()

@tool
def bulk_update_status_tool(
    updates: str,
    reason: str
) -> str:
    """Update status for multiple candidates at once.
    More efficient than calling update_candidate_status_tool
    multiple times.

    Use this when shortlisting or rejecting multiple candidates.

    Args:
        updates: JSON string like:
                 '[{"id": "uuid1", "status": "shortlisted"},
                   {"id": "uuid2", "status": "rejected"}]'
        reason: Why you are making these changes
    """

    try:
        update_list = json.loads(updates)
    except json.JSONDecodeError:
        return "ERROR: updates must be valid JSON array"

    session = SessionLocal()
    results = []

    try:
        for update in update_list:
            candidate_id = update.get("id", "")
            new_status = update.get("status", "")

            if not is_valid_uuid(candidate_id):
                results.append(f"Invalid ID: {candidate_id}")
                continue

            valid_statuses = [
                "shortlisted", "reviewing", "rejected", "pending"
            ]
            if new_status not in valid_statuses:
                results.append(f"Invalid status: {new_status}")
                continue

            candidate = session.query(Candidate).filter(
                Candidate.id == PyUUID(candidate_id)
            ).first()

            if not candidate:
                results.append(f"Not found: {candidate_id}")
                continue

            candidate.status = new_status
            icon = "Yes" if new_status == "shortlisted" else "No"
            results.append(
                f"{icon} {candidate.name} → {new_status} "
                f"({candidate.match_score}/100)"
            )

        session.commit()

    finally:
        session.close()

    return (
        f"Bulk update complete ({len(update_list)} candidates):\n"
        + "\n".join(results)
        + f"\nReason: {reason}"
    )

@tool
def search_candidates_tool(query: str, job_id: str = "") -> str:
    """Search for candidates using semantic similarity.

    Use this when looking for candidates with specific skills
    or experience that may not be in the current job's pool.

    Args:
        query: Natural language e.g. 'Python developer with FastAPI'
        job_id: Optional UUID to filter by job
    """

    results = search_candidates(
        query=query,
        job_id=job_id if job_id and is_valid_uuid(job_id) else None,
        top_n=5
    )

    if not results:
        return "No candidates found matching that description"
    
    output = []
    for r in results:
        output.append(
            f"Name: {r['name']} | "
            f"Similarity: {r['semantic_similarity']} | "
            f"Preview: {r['cv_preview'][:150]}"
        )

    return "\n\n".join(output)

tools = [
    get_job_overview_tool,
    update_candidate_status_tool,
    bulk_update_status_tool,
    search_candidates_tool
]
