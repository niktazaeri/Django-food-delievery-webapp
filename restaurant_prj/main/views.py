from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse, HttpResponseForbidden, JsonResponse
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token
from rest_framework.exceptions import AuthenticationFailed

from main.models import Order
from main.permissions import IsAdminUserRole, IsEmployeeRole, IsCustomerRole


def index(request):

    token_key = request.COOKIES.get('auth_token')
    if (token_key):
        try:
            token = Token.objects.get(key=token_key)
            user = token.user
            if user.role == 'admin':
                return render(request, 'users/admin/admin_dashboard.html')
            elif user.role == 'customer':
                return render(request, 'users/customer/customer_dashboard.html')
            elif user.role == 'employee':
                return render(request, 'users/employee/employee_dashboard.html')
        except Token.DoesNotExist:
            pass
    return render(request, 'users/index.html')


def login_view(request):
    return render(request, 'users/login.html')

def logout_view(request):
    employee = IsEmployeeRole()
    customer = IsCustomerRole()
    admin = IsAdminUserRole()
    if employee.has_permission(request, None) or admin.has_permission(request, None) or customer.has_permission(request, None):
        return render(request, 'users/logout.html')
    else:
        return HttpResponseForbidden("You do not have permission to view this page.")



def register_view(request):
    return render(request, 'users/customer/register_customer.html')

def admin_dashboard_view(request):
    permission = IsAdminUserRole()
    if not permission.has_permission(request, None):
        return HttpResponseForbidden("You do not have permission to view this page.")
    return render(request, 'users/admin/admin_dashboard.html')


def employee_dashboard_view(request):
    permission = IsEmployeeRole()
    if not permission.has_permission(request, None):
        return HttpResponseForbidden("You do not have permission to view this page.")
    return render(request, 'users/employee/employee_dashboard.html')

def customer_dashboard_view(request):
    permission = IsCustomerRole()
    if not permission.has_permission(request, None):
        return HttpResponseForbidden("You do not have permission to view this page.")
    return render(request, 'users/customer/customer_dashboard.html')


def customer_profile_view(request):
    permission = IsCustomerRole()
    if not permission.has_permission(request, None):
        return HttpResponseForbidden("You do not have permission to view this page.")
    return render(request, 'users/customer/customer_profile.html')

def customer_cart_view(request):
    permission = IsCustomerRole()
    if not permission.has_permission(request, None):
        return HttpResponseForbidden("You do not have permission to view this page.")
    return render(request, 'users/customer/cart.html')

def select_address_view(request):
    permission = IsCustomerRole()
    if not permission.has_permission(request, None):
        return HttpResponseForbidden("You do not have permission to view this page.")
    return render(request, 'users/customer/select_address.html')

def order_preview_view(request):
    permission = IsCustomerRole()
    if not permission.has_permission(request, None):
        return HttpResponseForbidden("You do not have permission to view this page.")
    return render(request, 'users/customer/order_preview.html')


def checkout_view(request, pk):
    permission = IsCustomerRole()
    if not permission.has_permission(request, None):
        return HttpResponseForbidden("You do not have permission to view this page.")
    return render(request, 'users/customer/checkout.html')

def rate_view(request, pk):
    permission = IsCustomerRole()
    if not permission.has_permission(request, None):
        return HttpResponseForbidden("You do not have permission to view this page.")
    return render(request, 'users/customer/rating_foods.html')



