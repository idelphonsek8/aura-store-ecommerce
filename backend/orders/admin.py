from django.contrib import admin
from .models import Order, OrderItem, OrderStatusHistory


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0


class OrderStatusHistoryInline(admin.TabularInline):
    model = OrderStatusHistory
    extra = 0


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ["order_number", "customer", "status", "total", "created_at"]
    list_filter = ["status", "delivery_method"]
    search_fields = ["order_number", "customer__email"]
    inlines = [OrderItemInline, OrderStatusHistoryInline]
