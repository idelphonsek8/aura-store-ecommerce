from django.urls import path
from . import views

customer_urlpatterns = [
    path("orders/", views.CustomerOrderListCreateView.as_view()),
    path("orders/<int:pk>/", views.CustomerOrderDetailView.as_view()),
]

admin_urlpatterns = [
    path("orders/", views.AdminOrderListView.as_view()),
    path("orders/<int:pk>/", views.AdminOrderDetailView.as_view()),
    path("orders/<int:pk>/status/", views.AdminOrderStatusUpdateView.as_view()),
]