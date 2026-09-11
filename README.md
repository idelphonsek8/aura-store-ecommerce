# Aura Store — Plateforme e-commerce modulaire

Application e-commerce complète : site public, espace client et administration.
Stack : **Django + Django REST Framework** (backend) / **React + Vite (JavaScript)** (frontend) / **PostgreSQL** (production) ou SQLite (développement local, activé par défaut).

Identité graphique **Aura Commerce** reprise du design system fourni (Stitch) : palette neutre zinc, accent terracotta `#E05A47`, typographies Plus Jakarta Sans / Inter.

---

## 1. Démarrer le backend (Django)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows : venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env            # ajustez si besoin

python manage.py migrate
python manage.py seed_demo_data # crée l'admin, 5 catégories, 20 produits, 5 clients, 10 commandes
python manage.py runserver 8000
```

L'API est disponible sur `http://localhost:8000/api/`.

**Comptes de démonstration créés par `seed_demo_data` :**
- Administrateur : `admin@auracommerce.com` / `Admin1234!`
- Clients : `awa.koffi@example.com`, `jean.amoussou@example.com`, etc. / `Client1234!`

### Passer à PostgreSQL

Décommentez et renseignez `DATABASE_URL` dans `backend/.env`, par exemple :
```
DATABASE_URL=postgres://user:password@localhost:5432/aura_commerce
```
Puis relancez `python manage.py migrate`.

---

## 2. Démarrer le frontend (React + Vite)

```bash
cd frontend
npm install
cp .env.example .env            # VITE_API_URL doit pointer vers le backend
npm run dev
```

L'application est disponible sur `http://localhost:5173/`.

- Site public : `/`, `/produits`, `/produits/:id`, `/panier`, `/commande`
- Compte client : `/inscription`, `/connexion`, `/mon-compte/*`
- Administration : `/admin/connexion`, `/admin/*`

---

## 3. Architecture

```
backend/
  config/           réglages, urls, JWT, exception handler
  accounts/         User custom (email + rôle CLIENT/ADMIN), auth, permissions
  catalog/          Category, Product, endpoints publics + admin
  orders/           Order, OrderItem, OrderStatusHistory, logique de commande
  adminpanel/       dashboard, gestion clients (vue d'ensemble)

frontend/src/
  api/              client axios (refresh JWT auto) + modules par domaine
  context/          AuthContext, CartContext, ToastContext
  components/       Button, Input, Select, Badge, Modal, ProductCard, DataTable...
  layouts/          PublicLayout, CustomerLayout, AdminLayout (desktop/tablette/mobile)
  routes/           CustomerRoute / AdminRoute (garde-fous, doublés côté API)
  pages/public/      Home, Catalog, ProductDetail, Cart, Register, Login, Checkout...
  pages/customer/    Dashboard, Orders, OrderDetail, Profile, Security
  pages/admin/       Login, Dashboard, Orders, OrderDetail, Customers, Products, Categories
```

---

## 4. Sécurité implémentée (vérifiée par des tests HTTP réels)

- Mots de passe hashés, validation Django ; JWT (access 60 min / refresh 7 jours, rotation).
- Message générique « Identifiant ou mot de passe incorrect » en cas d'échec (aucune fuite sur l'existence d'un email).
- `/admin/connexion` refuse tout compte qui n'a pas le rôle `ADMIN`, contrôlé côté serveur.
- Chaque commande cliente est filtrée par `customer=request.user` au niveau du queryset : un client ne peut jamais consulter la commande d'un autre, même en devinant l'ID (404).
- Prix et stock **toujours recalculés côté backend** à la création d'une commande ; le frontend ne peut pas falsifier une quantité ou un prix.
- Stock décrémenté de façon atomique (`select_for_update`), jamais négatif.
- Numéro de commande lisible généré côté serveur (`CMD-2026-000001`), jamais l'ID brut.
- Upload d'images : extensions autorisées (jpg/png/webp) et taille maximale (5 Mo) validées côté serveur.
- CORS restreint aux origines listées dans `.env`.

## 5. Ce qui reste à votre discrétion avant mise en production

- Remplacer `DJANGO_SECRET_KEY` et désactiver `DEBUG` en production.
- Configurer un vrai service d'envoi d'emails (confirmation de commande, mot de passe oublié — la page existe côté frontend mais l'envoi d'email n'est pas branché).
- Brancher un stockage d'images externe (S3, Cloudinary...) plutôt que le disque local pour la production.
- Ajouter des tests automatisés (pytest / Jest) si vous poursuivez le développement.
