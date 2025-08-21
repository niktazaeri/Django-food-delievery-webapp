from django.contrib import admin
from .models import Address, Users, Food, FoodRating, Coupon, UsedCoupon, Cart, Order, CartItem, OrderItem

admin.site.register(Address)
admin.site.register(Users)
admin.site.register(Food)
admin.site.register(FoodRating)
admin.site.register(Coupon)
admin.site.register(UsedCoupon)
admin.site.register(Cart)
admin.site.register(OrderItem)
admin.site.register(Order)
admin.site.register(CartItem)
