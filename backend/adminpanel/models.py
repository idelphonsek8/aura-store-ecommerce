from django.conf import settings
from django.db import models


class ActivityLog(models.Model):
    """Records key actions taken by any user (client, manager, or admin)."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="activity_logs",
    )
    role = models.CharField(max_length=10, blank=True)
    action = models.CharField(max_length=100)
    description = models.CharField(max_length=255, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.action} - {self.created_at}"