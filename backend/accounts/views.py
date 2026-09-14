from django.contrib.auth import get_user_model
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from adminpanel.utils import log_activity
from accounts.permissions import IsAdminRole
from .serializers import (
    RegisterSerializer, UserPublicSerializer, ChangePasswordSerializer, ManagerCreateSerializer,
)

User = get_user_model()


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Adds user info to the token response, keeps the failure message generic."""

    default_error_messages = {"no_active_account": "Identifiant ou mot de passe incorrect."}

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role
        token["full_name"] = user.full_name
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = UserPublicSerializer(self.user).data
        return data


class LoginView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            user = User.objects.filter(email__iexact=request.data.get("email")).first()
            log_activity(user, "LOGIN", "Connexion client", request)
        return response


class AdminLoginView(TokenObtainPairView):
    """Same credentials flow, but refuses any account that is not ADMIN or MANAGER.
    This is enforced server-side regardless of what the frontend sends."""

    serializer_class = EmailTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            user_data = response.data.get("user", {})
            if user_data.get("role") not in ("ADMIN", "MANAGER"):
                return Response(
                    {"detail": "Identifiant ou mot de passe incorrect."},
                    status=status.HTTP_401_UNAUTHORIZED,
                )
            user = User.objects.filter(email__iexact=request.data.get("email")).first()
            log_activity(user, "LOGIN", f"Connexion back-office ({user_data.get('role')})", request)
        return response


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        log_activity(user, "REGISTER", "Inscription d'un nouveau client", request)
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "user": UserPublicSerializer(user).data,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
            status=status.HTTP_201_CREATED,
        )


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        log_activity(request.user, "LOGOUT", "Déconnexion", request)
        try:
            refresh_token = request.data.get("refresh")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
        except TokenError:
            pass
        return Response({"detail": "Déconnexion réussie."}, status=status.HTTP_200_OK)


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserPublicSerializer(request.user).data)

    def patch(self, request):
        serializer = UserPublicSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        log_activity(request.user, "PASSWORD_CHANGED", "Changement de mot de passe", request)
        return Response({"detail": "Mot de passe modifié avec succès."})


class CustomerProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserPublicSerializer(request.user).data)

    def patch(self, request):
        serializer = UserPublicSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        log_activity(request.user, "PROFILE_UPDATED", "Modification du profil", request)
        return Response(serializer.data)


# ---------- Manager accounts (admin only) ----------

class AdminManagerListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAdminRole]

    def get_queryset(self):
        return User.objects.filter(role=User.Role.MANAGER).order_by("-created_at")

    def get_serializer_class(self):
        return ManagerCreateSerializer if self.request.method == "POST" else UserPublicSerializer

    def create(self, request, *args, **kwargs):
        serializer = ManagerCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        manager = serializer.save()
        log_activity(
            request.user, "MANAGER_CREATED", f"Gestionnaire créé : {manager.email}", request
        )
        return Response(UserPublicSerializer(manager).data, status=status.HTTP_201_CREATED)


class AdminManagerDetailView(APIView):
    permission_classes = [IsAdminRole]

    def patch(self, request, pk):
        manager = User.objects.get(pk=pk, role=User.Role.MANAGER)
        is_active = request.data.get("is_active")
        if is_active is not None:
            manager.is_active = is_active
            manager.save(update_fields=["is_active"])
            log_activity(
                request.user, "MANAGER_UPDATED",
                f"Gestionnaire {'activé' if is_active else 'désactivé'} : {manager.email}", request
            )
        return Response(UserPublicSerializer(manager).data)