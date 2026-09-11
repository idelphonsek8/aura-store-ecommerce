from rest_framework.permissions import BasePermission


class IsAdminRole(BasePermission):
    """Grants access only to authenticated users with role=ADMIN.
    Always checked server-side; the frontend route guard is not trusted."""

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.role == "ADMIN")


class IsClientRole(BasePermission):
    """Grants access only to authenticated users with role=CLIENT."""

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.role == "CLIENT")
