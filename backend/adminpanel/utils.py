from .models import ActivityLog


def get_client_ip(request):
    if request is None:
        return None
    forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")


def log_activity(user, action, description="", request=None):
    """Records a key action in the audit journal. Never raises — a logging
    failure should never break the actual feature it is observing."""
    try:
        ActivityLog.objects.create(
            user=user if user and user.is_authenticated else None,
            role=getattr(user, "role", "") if user and user.is_authenticated else "",
            action=action,
            description=description,
            ip_address=get_client_ip(request),
        )
    except Exception:
        pass