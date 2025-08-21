from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include

from main import views

urlpatterns = [
    path('', views.index, name='index'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout-page'),
    path('register-customer/', views.register_view, name='register-customer'),
    path('customer-dashboard/', views.customer_dashboard_view, name='customer-dashboard'),
    path('select-address/', views.select_address_view, name='select-address'),
    path('order-preview/', views.order_preview_view, name='order-preview'),
    path('orders/<int:pk>/rate/' , views.rate_view, name='rate-page'),
    path('checkout/<int:pk>/', views.checkout_view, name='checkout'),
    path('customer-profile/', views.customer_profile_view, name='customer-profile'),
    path('cart/', views.customer_cart_view, name='customer-cart'),
]
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
