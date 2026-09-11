from django.conf import settings
from django.db import models, transaction
from django.utils import timezone


class Order(models.Model):
    class Status(models.TextChoices):
        EN_ATTENTE = "EN_ATTENTE", "En attente"
        CONFIRMEE = "CONFIRMEE", "Confirmée"
        EN_PREPARATION = "EN_PREPARATION", "En préparation"
        EXPEDIEE = "EXPEDIEE", "Expédiée"
        LIVREE = "LIVREE", "Livrée"
        ANNULEE = "ANNULEE", "Annulée"

    class DeliveryMethod(models.TextChoices):
        STANDARD = "STANDARD", "Livraison standard"
        RETRAIT = "RETRAIT", "Retrait en boutique"

    order_number = models.CharField(max_length=30, unique=True, blank=True)
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="orders")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.EN_ATTENTE)

    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=30)
    email = models.EmailField()

    delivery_address = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=120, blank=True)
    area = models.CharField(max_length=120, blank=True)
    extra_info = models.CharField(max_length=255, blank=True)
    delivery_method = models.CharField(max_length=20, choices=DeliveryMethod.choices, default=DeliveryMethod.STANDARD)

    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    delivery_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.order_number

    def save(self, *args, **kwargs):
        if not self.order_number:
            year = timezone.now().year
            with transaction.atomic():
                last = (
                    Order.objects.select_for_update()
                    .filter(order_number__startswith=f"CMD-{year}-")
                    .order_by("-id")
                    .first()
                )
                next_seq = 1
                if last:
                    try:
                        next_seq = int(last.order_number.split("-")[-1]) + 1
                    except (ValueError, IndexError):
                        next_seq = Order.objects.filter(created_at__year=year).count() + 1
                self.order_number = f"CMD-{year}-{next_seq:06d}"
        super().save(*args, **kwargs)

    STATUS_FLOW = [Status.EN_ATTENTE, Status.CONFIRMEE, Status.EN_PREPARATION, Status.EXPEDIEE, Status.LIVREE]


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey("catalog.Product", on_delete=models.PROTECT, related_name="order_items")
    product_name = models.CharField(max_length=200)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f"{self.product_name} x{self.quantity}"


class OrderStatusHistory(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="status_history")
    old_status = models.CharField(max_length=20, blank=True)
    new_status = models.CharField(max_length=20)
    changed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    changed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["changed_at"]
