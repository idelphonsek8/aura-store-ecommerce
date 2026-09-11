from datetime import timedelta
from django.contrib.auth import get_user_model
from django.db.models import Count, Sum, Q
from django.utils import timezone
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAdminRole
from accounts.serializers import UserPublicSerializer
from catalog.models import Product
from orders.models import Order
from orders.serializers import OrderListSerializer

User = get_user_model()


class AdminDashboardView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        today = timezone.now().date()
        orders_today = Order.objects.filter(created_at__date=today).count()
        orders_pending = Order.objects.filter(status=Order.Status.EN_ATTENTE).count()
        total_customers = User.objects.filter(role=User.Role.CLIENT).count()
        active_products = Product.objects.filter(is_active=True).count()
        revenue = (
            Order.objects.exclude(status=Order.Status.ANNULEE).aggregate(total=Sum("total"))["total"] or 0
        )

        last_14_days = [today - timedelta(days=i) for i in range(13, -1, -1)]
        sales_series = []
        for day in last_14_days:
            day_total = (
                Order.objects.filter(created_at__date=day)
                .exclude(status=Order.Status.ANNULEE)
                .aggregate(total=Sum("total"))["total"]
                or 0
            )
            sales_series.append({"date": day.isoformat(), "total": float(day_total)})

        recent_orders = Order.objects.select_related("customer").order_by("-created_at")[:5]
        low_stock_products = Product.objects.filter(is_active=True, stock__lte=5).order_by("stock")[:5]

        return Response({
            "orders_today": orders_today,
            "orders_pending": orders_pending,
            "total_customers": total_customers,
            "active_products": active_products,
            "revenue": float(revenue),
            "sales_series": sales_series,
            "recent_orders": OrderListSerializer(recent_orders, many=True).data,
            "low_stock_products": [
                {"id": p.id, "name": p.name, "stock": p.stock} for p in low_stock_products
            ],
        })


class AdminCustomerListView(generics.ListAPIView):
    serializer_class = UserPublicSerializer
    permission_classes = [IsAdminRole]

    def get_queryset(self):
        qs = User.objects.filter(role=User.Role.CLIENT).annotate(
            orders_count=Count("orders"), orders_total=Sum("orders__total")
        ).order_by("-created_at")
        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(
                Q(first_name__icontains=search) | Q(last_name__icontains=search) | Q(email__icontains=search)
            )
        return qs

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        qs = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(qs)
        target = page if page is not None else qs
        data = []
        for user in target:
            item = UserPublicSerializer(user).data
            item["orders_count"] = user.orders_count
            item["orders_total"] = float(user.orders_total or 0)
            data.append(item)
        if page is not None:
            return self.get_paginated_response(data)
        return Response(data)


class AdminCustomerDetailView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request, pk):
        user = User.objects.get(pk=pk, role=User.Role.CLIENT)
        orders = Order.objects.filter(customer=user).order_by("-created_at")
        delivered = orders.filter(status=Order.Status.LIVREE).count()
        total_spent = orders.exclude(status=Order.Status.ANNULEE).aggregate(total=Sum("total"))["total"] or 0
        return Response({
            "customer": UserPublicSerializer(user).data,
            "stats": {
                "orders_count": orders.count(),
                "orders_delivered": delivered,
                "total_spent": float(total_spent),
            },
            "orders": OrderListSerializer(orders, many=True).data,
        })
