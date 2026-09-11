from django.urls import path
from . import views

urlpatterns = [
    path("products/", views.PublicProductListView.as_view()),
    path("products/<int:pk>/", views.PublicProductDetailView.as_view()),
    path("categories/", views.PublicCategoryListView.as_view()),
]

admin_urlpatterns = [
    path("products/", views.AdminProductListCreateView.as_view()),
    path("products/<int:pk>/", views.AdminProductDetailView.as_view()),
    path("categories/", views.AdminCategoryListCreateView.as_view()),
    path("categories/<int:pk>/", views.AdminCategoryDetailView.as_view()),
]
