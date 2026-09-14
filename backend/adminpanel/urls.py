from django.urls import path
from . import views

urlpatterns = [
    path("dashboard/", views.AdminDashboardView.as_view()),
    path("customers/", views.AdminCustomerListView.as_view()),
    path("customers/<int:pk>/", views.AdminCustomerDetailView.as_view()),
    path("activity-log/", views.AdminActivityLogView.as_view()),
]