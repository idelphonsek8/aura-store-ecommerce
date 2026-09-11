from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include

from catalog.urls import admin_urlpatterns as catalog_admin_urls
from orders.urls import customer_urlpatterns as orders_customer_urls, admin_urlpatterns as orders_admin_urls
from accounts.views import CustomerProfileView

urlpatterns = [
    path("django-admin/", admin.site.urls),

    # Public
    path("api/", include("catalog.urls")),
    path("api/auth/", include("accounts.urls")),

    # Customer space (all views individually enforce IsClientRole + ownership)
    path("api/customer/profile/", CustomerProfileView.as_view()),
    path("api/customer/", include(orders_customer_urls)),

    # Administration (all views individually enforce IsAdminRole)
    path("api/admin/", include(orders_admin_urls)),
    path("api/admin/", include(catalog_admin_urls)),
    path("api/admin/", include("adminpanel.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
