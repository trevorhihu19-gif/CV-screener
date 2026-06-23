import hashlib
import time
from typing import Optional

class SimpleCache:
    """
    In-memory cache for agent responses.
    Prevents hitting Groq API for repeated identical questions.
    """
    def __init__(self, ttl_seconds: int = 300): 
        self._cache: dict = {}
        self._ttl = ttl_seconds

    def _make_key(self, message: str, job_id: str, recruiter_id: str) -> str:
        """Create a unique cache key"""
        raw = f"{message.lower().strip()}:{job_id}:{recruiter_id}"
        return hashlib.md5(raw.encode()).hexdigest()

    def get(
        self,
        message: str,
        job_id: str,
        recruiter_id: str
    ) -> Optional[str]:
        key = self._make_key(message, job_id, recruiter_id)
        if key not in self._cache:
            return None

        entry = self._cache[key]
        if time.time() - entry["timestamp"] > self._ttl:
            del self._cache[key]
            return None

        print(f"Cache hit for: {message[:50]}")
        return entry["response"]

    def set(
        self,
        message: str,
        job_id: str,
        recruiter_id: str,
        response: str
    ) -> None:
        key = self._make_key(message, job_id, recruiter_id)
        self._cache[key] = {
            "response": response,
            "timestamp": time.time()
        }

    def invalidate_job(self, job_id: str) -> None:
        """Clear cache when candidates change for a job"""
        keys_to_delete = [
            k for k, v in self._cache.items()
            if job_id in k
        ]
        for key in keys_to_delete:
            del self._cache[key]
        print(f"Cache invalidated for job: {job_id}")

    def clear(self) -> None:
        self._cache.clear()

    @property
    def size(self) -> int:
        return len(self._cache)


CACHEABLE_PATTERNS = [
    "hiring summary",
    "how many candidates",
    "give me a summary",
    "who has the highest score",
    "shortlisted candidates",
    "top candidates",
    "average score",
]

def is_cacheable(message: str) -> bool:
    """Check if a message is safe to cache"""
    message_lower = message.lower()
    return any(p in message_lower for p in CACHEABLE_PATTERNS)


agent_cache = SimpleCache(ttl_seconds=300)