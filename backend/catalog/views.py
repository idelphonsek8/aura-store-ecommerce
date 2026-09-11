from django.db.models import Q
from rest_framework import generics, permissions, filters
from rest_framework.pagination import PageNumberPagination
from .models import Category, Product
from .serializers import CategorySerializer, ProductListSerializer, ProductDetailSerializer, ProductAdminSerializer
from accounts.permissions import IsAdminRole


class ProductPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = "page_size"
    max_page_size = 48


# ---------- Public ----------

class PublicCategoryListView(generics.ListAPIView):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None


class PublicProductListView(generics.ListAPIView):
    serializer_class = ProductListSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = ProductPagination

    def get_queryset(self):
        qs = Product.objects.filter(is_active=True).select_related("category")
        params = self.request.query_params

        search = params.get("search")
        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(description_short__icontains=search))

        category = params.get("category")
        if category:
            qs = qs.filter(category__slug=category)

        availability = params.get("availability")
        if availability == "in_stock":
            qs = qs.filter(stock__gt=0)
        elif availability == "out_of_stock":
            qs = qs.filter(stock=0)

        price_min = params.get("price_min")
        if price_min:
            qs = qs.filter(price__gte=price_min)
        price_max = params.get("price_max")
        if price_max:
            qs = qs.filter(price__lte=price_max)

        sort = params.get("sort")
        if sort == "price_asc":
            qs = qs.order_by("price")
        elif sort == "price_desc":
            qs = qs.order_by("-price")
        else:
            qs = qs.order_by("-created_at")  # newest first (default)

        return qs


class PublicProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.filter(is_active=True).select_related("category").prefetch_related("images")
    serializer_class = ProductDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "pk"


# ---------- Admin ----------

class AdminCategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminRole]
    pagination_class = None


class AdminCategoryDetailView(generics.RetrieveUpdateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminRole]


class AdminProductListCreateView(generics.ListCreateAPIView):
    serializer_class = ProductAdminSerializer
    permission_classes = [IsAdminRole]
    pagination_class = ProductPagination

    def get_queryset(self):
        qs = Product.objects.select_related("category").all().order_by("-created_at")
        params = self.request.query_params
        search = params.get("search")
        if search:
            qs = qs.filter(name__icontains=search)
        category = params.get("category")
        if category:
            qs = qs.filter(category_id=category)
        status_param = params.get("status")
        if status_param == "active":
            qs = qs.filter(is_active=True)
        elif status_param == "inactive":
            qs = qs.filter(is_active=False)
        stock = params.get("stock")
        if stock == "low":
            qs = qs.filter(stock__lte=5, stock__gt=0)
        elif stock == "out":
            qs = qs.filter(stock=0)
        return qs


class AdminProductDetailView(generics.RetrieveUpdateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductAdminSerializer
    permission_classes = [IsAdminRole]