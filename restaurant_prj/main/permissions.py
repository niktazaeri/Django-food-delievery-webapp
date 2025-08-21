from rest_framework.permissions import BasePermission
from rest_framework.authtoken.models import Token
class IsAdminUserRole(BasePermission):
    def has_permission(self, request, view):
        cookie = request.COOKIES.get('auth_token')
        header = request.headers.get('Authorization')
        token = None
        token_key = request.COOKIES.get('auth_token')

        if header or cookie:
            token_key = cookie if cookie else header.split(' ')[1]
            token = Token.objects.get(key=token_key)
            user = token.user
            if user.role == 'admin':
                return True
        return False

class IsEmployeeRole(BasePermission):
    def has_permission(self, request, view):
        cookie = request.COOKIES.get('auth_token')
        header = request.headers.get('Authorization')
        token = None
        token_key = request.COOKIES.get('auth_token')

        if header or cookie:
            token_key = cookie if cookie else header.split(' ')[1]
            token = Token.objects.get(key=token_key)
            user = token.user
            if user.role == 'employee':
                return True
        return False

class IsCustomerRole(BasePermission):
    def has_permission(self, request, view):
        cookie = request.COOKIES.get('auth_token')
        header = request.headers.get('Authorization')
        token = None
        token_key = request.COOKIES.get('auth_token')
        if header or cookie:
            token_key = cookie if cookie else header.split(' ')[1]
            token = Token.objects.get(key=token_key)
            user = token.user
            if user.role == 'customer':
                return True
        return False