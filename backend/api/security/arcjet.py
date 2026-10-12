# api/security/arcjet.py
from api.config.env import settings
from arcjet import Mode, arcjet, fixed_window, shield, sliding_window
from fastapi import HTTPException, Request, status

# Global shield: blocks attacks such as SQL injection and XSS
aj = arcjet(
    key=settings.arcjet_key,
    rules=[
        shield(mode=Mode.LIVE),
    ],
)

auth_protection = arcjet(
    key=settings.arcjet_key,
    rules=[
        shield(mode=Mode.LIVE),
        fixed_window(
            mode=Mode.LIVE,
            window=60,  # 1 minute
            max=10,  # 10 login attempts per minute per IP
        ),
    ],
)

# CV upload: prevent API cost abuse
upload_protection = arcjet(
    key=settings.arcjet_key,
    rules=[
        shield(mode=Mode.LIVE),
        fixed_window(
            mode=Mode.LIVE,
            window=3600,  # 1 hour
            max=20,  # 20 CV uploads per hour per IP
        ),
    ],
)

# Bulk upload: most expensive endpoint
bulk_upload_protection = arcjet(
    key=settings.arcjet_key,
    rules=[
        shield(mode=Mode.LIVE),
        fixed_window(
            mode=Mode.LIVE,
            window=3600,  # 1 hour
            max=5,  # 5 bulk uploads per hour per IP
        ),
    ],
)

# Agent chat: LLM calls are expensive
chat_protection = arcjet(
    key=settings.arcjet_key,
    rules=[
        shield(mode=Mode.LIVE),
        sliding_window(
            mode=Mode.LIVE,
            interval=60,  # 1 minute
            max=30,  # 30 messages per minute per IP
        ),
    ],
)

job_protection = arcjet(
    key=settings.arcjet_key,
    rules=[
        shield(mode=Mode.LIVE),
        fixed_window(
            mode=Mode.LIVE,
            window=60,  
            max=60,  # 60 requests per minute per IP
        ),
    ],
)


async def check_arcjet(request: Request, aj_instance=aj) -> None:
    """
    FastAPI dependency: call this in any route to protect it.
    Raises 429 if rate limited, 403 if blocked.
    """
    decision = await aj_instance.protect(request)

    if decision.is_denied():
        reason = getattr(getattr(decision, "reason_v2", None), "type", None)

        if reason == "RATE_LIMIT":
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={
                    "error": "Rate limit exceeded",
                    "message": "Too many requests. Please slow down.",
                    "retry_after": "60 seconds",
                },
            )

        if reason == "SHIELD":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "error": "Request blocked",
                    "message": "Your request was flagged as suspicious.",
                },
            )

        if reason == "BOT":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "error": "Bot detected",
                    "message": "Automated requests are not allowed.",
                },
            )

        # Generic block
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"error": "Request denied"},
        )


async def protect_auth(request: Request) -> None:
    await check_arcjet(request, auth_protection)


async def protect_upload(request: Request) -> None:
    await check_arcjet(request, upload_protection)


async def protect_bulk_upload(request: Request) -> None:
    await check_arcjet(request, bulk_upload_protection)


async def protect_chat(request: Request) -> None:
    await check_arcjet(request, chat_protection)


async def protect_jobs(request: Request) -> None:
    await check_arcjet(request, job_protection)