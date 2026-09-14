from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAdminRole, IsClientRole, IsAdminOrManager
from adminpanel.utils import log_activity
from .models import Order
from .serializers import (
    OrderCreateSerializer, OrderListSerializer, OrderDetailSerializer, OrderStatusUpdateSerializer,
)


class OrderPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 50


# ---------- Customer ----------

class CustomerOrderListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsClientRole]
    pagination_class = OrderPagination

    def get_queryset(self):
        # A client can only ever see their own orders, regardless of query params.
        qs = Order.objects.filter(customer=self.request.user).order_by("-created_at")
        params = self.request.query_params
        search = params.get("search")
        if search:
            qs = qs.filter(order_number__icontains=search)
        status_param = params.get("status")
        if status_param:
            qs = qs.filter(status=status_param)
        date_from = params.get("date_from")
        if date_from:
            qs = qs.filter(created_at__date__gte=date_from)
        date_to = params.get("date_to")
        if date_to:
            qs = qs.filter(created_at__date__lte=date_to)
        return qs

    def get_serializer_class(self):
        return OrderCreateSerializer if self.request.method == "POST" else OrderListSerializer

    def create(self, request, *args, **kwargs):
        serializer = OrderCreateSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        log_activity(
            request.user, "ORDER_CREATED", f"Commande {order.order_number} créée", request
        )
        return Response(OrderDetailSerializer(order).data, status=status.HTTP_201_CREATED)


class CustomerOrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderDetailSerializer
    permission_classes = [IsClientRole]

    def get_queryset(self):
        # Ownership is enforced at the queryset level: an unknown/foreign id yields 404,
        # never leaking whether the order exists for someone else.
        return Order.objects.filter(customer=self.request.user)


# ---------- Admin & Manager ----------

class AdminOrderListView(generics.ListAPIView):
    serializer_class = OrderListSerializer
    permission_classes = [IsAdminOrManager]
    pagination_class = OrderPagination

    def get_queryset(self):
        qs = Order.objects.select_related("customer").order_by("-created_at")
        params = self.request.query_params
        search = params.get("search")
        if search:
            qs = qs.filter(
                Q(order_number__icontains=search)
                | Q(customer__first_name__icontains=search)
                | Q(customer__last_name__icontains=search)
                | Q(customer__email__icontains=search)
            )
        status_param = params.get("status")
        if status_param:
            qs = qs.filter(status=status_param)
        date_from = params.get("date_from")
        if date_from:
            qs = qs.filter(created_at__date__gte=date_from)
        date_to = params.get("date_to")
        if date_to:
            qs = qs.filter(created_at__date__lte=date_to)
        return qs


class AdminOrderDetailView(generics.RetrieveAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderDetailSerializer
    permission_classes = [IsAdminOrManager]


class AdminOrderStatusUpdateView(APIView):
    permission_classes = [IsAdminOrManager]

    def patch(self, request, pk):
        order = get_object_or_404(Order, pk=pk)
        serializer = OrderStatusUpdateSerializer(data=request.data, context={"order": order, "request": request})
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        log_activity(
            request.user, "ORDER_STATUS_CHANGED",
            f"Commande {order.order_number} → {order.status}", request
        )
        return Response(OrderDetailSerializer(order).data)