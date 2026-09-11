import random
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from catalog.models import Category, Product
from orders.models import Order, OrderItem, OrderStatusHistory

User = get_user_model()

CATEGORIES = [
    ("Vêtements", "Prêt-à-porter homme et femme"),
    ("Chaussures", "Chaussures de ville et de sport"),
    ("Accessoires", "Sacs, ceintures et bijoux"),
    ("Maison & Déco", "Articles de décoration intérieure"),
    ("Électronique", "Petits appareils et accessoires tech"),
]

PRODUCT_NAMES = {
    "Vêtements": ["Chemise en lin", "Robe d'été", "Veste en jean", "Pull en coton", "Pantalon chino"],
    "Chaussures": ["Baskets urbaines", "Sandales en cuir", "Bottines chelsea", "Mocassins", "Sneakers running"],
    "Accessoires": ["Sac à main cuir", "Ceinture réversible", "Montre minimaliste", "Écharpe en laine", "Lunettes de soleil"],
    "Maison & Déco": ["Vase en céramique", "Coussin décoratif", "Lampe de table", "Plaid en coton", "Cadre photo bois"],
    "Électronique": ["Enceinte Bluetooth", "Casque sans fil", "Chargeur rapide", "Powerbank 10000mAh", "Support téléphone"],
}

CUSTOMERS = [
    ("Awa", "Koffi", "awa.koffi@example.com"),
    ("Jean", "Amoussou", "jean.amoussou@example.com"),
    ("Fatou", "Diallo", "fatou.diallo@example.com"),
    ("Kossi", "Mensah", "kossi.mensah@example.com"),
    ("Aicha", "Bello", "aicha.bello@example.com"),
]


class Command(BaseCommand):
    help = "Seed the database with demo data (admin, categories, products, customers, orders)."

    def handle(self, *args, **options):
        self.stdout.write("Seeding demo data...")

        admin, created = User.objects.get_or_create(
            email="admin@auracommerce.com",
            defaults=dict(first_name="Admin", last_name="Aura", role=User.Role.ADMIN, is_staff=True, is_superuser=True),
        )
        if created:
            admin.set_password("Admin1234!")
            admin.save()
            self.stdout.write(self.style.SUCCESS("  Admin créé: admin@auracommerce.com / Admin1234!"))

        categories = []
        for name, desc in CATEGORIES:
            cat, _ = Category.objects.get_or_create(name=name, defaults={"description": desc})
            categories.append(cat)

        products = []
        for cat in categories:
            for name in PRODUCT_NAMES[cat.name]:
                for suffix in ["", " Édition 2"]:
                    full_name = f"{name}{suffix}"
                    if Product.objects.filter(name=full_name).exists():
                        products.append(Product.objects.get(name=full_name))
                        continue
                    if len(products) >= 20 and suffix:
                        continue
                    price = Decimal(random.choice([9900, 14900, 19900, 24900, 34900, 49900])) / 100 * 100
                    stock = random.choice([0, 3, 5, 8, 15, 25, 40])
                    p = Product.objects.create(
                        name=full_name, category=cat,
                        description_short=f"{full_name} — qualité et confort au quotidien.",
                        description=f"{full_name} fabriqué avec soin, idéal pour un usage quotidien. "
                                    f"Livré avec garantie satisfaction et retour possible sous 14 jours.",
                        price=price, stock=stock, is_active=True,
                    )
                    products.append(p)
                    if len(products) >= 20:
                        break
                if len(products) >= 20:
                    break
            if len(products) >= 20:
                break

        customers = []
        for first, last, email in CUSTOMERS:
            user, created = User.objects.get_or_create(
                email=email, defaults=dict(first_name=first, last_name=last, role=User.Role.CLIENT, phone="+229 90 00 00 00")
            )
            if created:
                user.set_password("Client1234!")
                user.save()
            customers.append(user)

        statuses = [Order.Status.EN_ATTENTE, Order.Status.CONFIRMEE, Order.Status.EN_PREPARATION,
                    Order.Status.EXPEDIEE, Order.Status.LIVREE, Order.Status.ANNULEE]

        if Order.objects.count() < 10:
            for i in range(10):
                customer = random.choice(customers)
                status = random.choice(statuses)
                chosen = random.sample(products, k=random.randint(1, 3))
                subtotal = sum(p.price for p in chosen)
                delivery_fee = Decimal(2000)
                order = Order.objects.create(
                    customer=customer, status=status,
                    first_name=customer.first_name, last_name=customer.last_name,
                    phone=customer.phone or "+229 90 00 00 00", email=customer.email,
                    delivery_address="Rue 123, Quartier Zongo", city="Cotonou", area="Zongo",
                    delivery_method=Order.DeliveryMethod.STANDARD,
                    subtotal=subtotal, delivery_fee=delivery_fee, total=subtotal + delivery_fee,
                )
                for p in chosen:
                    OrderItem.objects.create(
                        order=order, product=p, product_name=p.name, quantity=1,
                        unit_price=p.price, subtotal=p.price,
                    )
                OrderStatusHistory.objects.create(order=order, old_status="", new_status=Order.Status.EN_ATTENTE, changed_by=admin)
                if status != Order.Status.EN_ATTENTE:
                    OrderStatusHistory.objects.create(order=order, old_status=Order.Status.EN_ATTENTE, new_status=status, changed_by=admin)

        self.stdout.write(self.style.SUCCESS(
            f"Terminé: {Category.objects.count()} catégories, {Product.objects.count()} produits, "
            f"{User.objects.filter(role='CLIENT').count()} clients, {Order.objects.count()} commandes."
        ))
