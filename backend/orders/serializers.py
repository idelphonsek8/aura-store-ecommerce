from decimal import Decimal
from django.conf import settings
from django.db import transaction
from rest_framework import serializers
from catalog.models import Product
from .models import Order, OrderItem, OrderStatusHistory


class OrderItemInputSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)


class OrderItemSerializer(serializers.ModelSerializer):
    product_image = serializers.ImageField(source="product.image", read_only=True)

    class Meta:
        model = OrderItem
        fields = ["id", "product", "product_name", "product_image", "quantity", "unit_price", "subtotal"]


class OrderStatusHistorySerializer(serializers.ModelSerializer):
    changed_by_name = serializers.CharField(source="changed_by.full_name", read_only=True, default="")

    class Meta:
        model = OrderStatusHistory
        fields = ["id", "old_status", "new_status", "changed_by_name", "changed_at"]


class OrderListSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source="customer.full_name", read_only=True)
    items_count = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id", "order_number", "customer_name", "status", "total",
            "delivery_method", "items_count", "created_at",
        ]

    def get_items_count(self, obj):
        return obj.items.count()


class OrderDetailSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    status_history = OrderStatusHistorySerializer(many=True, read_only=True)
    customer_name = serializers.CharField(source="customer.full_name", read_only=True)
    customer_email = serializers.CharField(source="customer.email", read_only=True)

    class Meta:
        model = Order
        fields = [
            "id", "order_number", "status", "customer", "customer_name", "customer_email",
            "first_name", "last_name", "phone", "email",
            "delivery_address", "city", "area", "extra_info", "delivery_method",
            "subtotal", "delivery_fee", "total",
            "items", "status_history", "created_at", "updated_at",
        ]


class OrderCreateSerializer(serializers.Serializer):
    """Never trusts client-sent prices: everything is recomputed from the DB."""

    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    phone = serializers.CharField(max_length=30)
    email = serializers.EmailField()
    delivery_address = serializers.CharField(max_length=255, required=False, allow_blank=True)
    city = serializers.CharField(max_length=120, required=False, allow_blank=True)
    area = serializers.CharField(max_length=120, required=False, allow_blank=True)
    extra_info = serializers.CharField(max_length=255, required=False, allow_blank=True)
    delivery_method = serializers.ChoiceField(choices=Order.DeliveryMethod.choices)
    items = OrderItemInputSerializer(many=True)

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("Le panier est vide.")
        return value

    def validate(self, attrs):
        if attrs["delivery_method"] == Order.DeliveryMethod.STANDARD and not attrs.get("delivery_address"):
            raise serializers.ValidationError({"delivery_address": "L'adresse de livraison est obligatoire."})
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        items_data = validated_data.pop("items")
        product_ids = [item["product_id"] for item in items_data]
        products = {
            p.id: p for p in Product.objects.select_for_update().filter(id__in=product_ids, is_active=True)
        }

        for item in items_data:
            product = products.get(item["product_id"])
            if product is None:
                raise serializers.ValidationError(
                    {"items": f"Le produit {item['product_id']} n'est pas disponible."}
                )
            if item["quantity"] > product.stock:
                raise serializers.ValidationError(
                    {"items": f"Stock insuffisant pour « {product.name} » (disponible : {product.stock})."}
                )

        subtotal = Decimal("0")
        for item in items_data:
            product = products[item["product_id"]]
            subtotal += product.price * item["quantity"]

        delivery_fee = (
            Decimal(settings.DELIVERY_FEE_STANDARD)
            if validated_data["delivery_method"] == Order.DeliveryMethod.STANDARD
            else Decimal(settings.DELIVERY_FEE_PICKUP)
        )
        total = subtotal + delivery_fee

        request = self.context["request"]
        order = Order.objects.create(
            customer=request.user,
            subtotal=subtotal,
            delivery_fee=delivery_fee,
            total=total,
            **validated_data,
        )

        for item in items_data:
            product = products[item["product_id"]]
            OrderItem.objects.create(
                order=order,
                product=product,
                product_name=product.name,
                quantity=item["quantity"],
                unit_price=product.price,
                subtotal=product.price * item["quantity"],
            )
            product.stock = product.stock - item["quantity"]
            product.save(update_fields=["stock"])

        OrderStatusHistory.objects.create(
            order=order, old_status="", new_status=Order.Status.EN_ATTENTE, changed_by=request.user
        )
        return order


class OrderStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Order.Status.choices)

    def save(self, **kwargs):
        order = self.context["order"]
        request = self.context["request"]
        new_status = self.validated_data["status"]
        old_status = order.status
        if old_status != new_status:
            order.status = new_status
            order.save(update_fields=["status", "updated_at"])
            OrderStatusHistory.objects.create(
                order=order, old_status=old_status, new_status=new_status, changed_by=request.user
            )
        return order
