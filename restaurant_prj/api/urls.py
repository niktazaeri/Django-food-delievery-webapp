from django.urls import path
from .views import CustomAuthTokenAPIView, RegisterCustomerAPIView, RegisterEmployeeAPIView, LogOutAPIView, \
    FoodsListAPIView, AddFoodAPIView, EditFoodAPIView, DeleteFoodAPIView, AddCouponAPIView, ViewTotalRevenueAPIView, \
    IndexView, TopSellingFoodsAPIView, EditEmployeeAPIView, DeleteEmployeeAPIView, EmployeesListAPIView, \
    CouponsListAPIView, EditCouponAPIView, DeleteCouponAPIView, ViewCouponAPIView, ViewEmployeeAPIView, \
    ViewFoodInfoAPIView, CustomerOrderHistoryAPIView, AddToCartAPIView, ViewCartAPIView, UpdateCartItemAPIView, \
    DeleteCartItemAPIView, AddressesListAPIView, EditAddressesAPIView, OrderCreateAPIView, \
    OrderDetailsAPIView, OrderPreviewAPIView, LogoutAPIView, ApplyCouponAPIView, RateFoodAPIView, CreateAddressAPIView, \
    DeleteAddressAPIView, UncompletedOrdersListAPIView, CompletedOrdersListAPIView, CompletingOrderAPIView, \
    CustomerCompletedOrdersListAPIView, RateFoodListAPIView, CancelOrderAPIView, FoodListFilterView

urlpatterns = [
    path('user/role/', IndexView.as_view(), name='get_user_role'),
    path('login/', CustomAuthTokenAPIView.as_view(), name='api_login'),
    path('logout/', LogoutAPIView.as_view(), name='api_logout'),
    path('register-customer/', RegisterCustomerAPIView.as_view(), name='api_register_customer'),
    path('foods-filter/',FoodListFilterView.as_view(), name='food-list'),
    path('order-history/', CustomerOrderHistoryAPIView.as_view(), name='api_order_history'),
    path('profile/completed-orders/', CustomerCompletedOrdersListAPIView.as_view(), name='api_completed_orders'),
    path('profile/completed-orders/<int:pk>/rate/', RateFoodListAPIView.as_view(), name='rate_food_list'),
    path('rate_food/', RateFoodAPIView.as_view(), name='api_rate_food'),
    path('order-preview/', OrderPreviewAPIView.as_view(), name='api_order_preview'),
    path('apply-coupon/', ApplyCouponAPIView.as_view(), name='api_apply_coupon'),
    path('place-order/', OrderCreateAPIView.as_view(), name='place_order'),
    path('order-details/<int:pk>/', OrderDetailsAPIView.as_view(), name='order_details'),
    path('profile/order-history/<int:pk>/cancel/', CancelOrderAPIView.as_view(), name='api_cancel_order'),
    path('addresses/', AddressesListAPIView.as_view(), name='api_address_list'),
    path('add-address/', CreateAddressAPIView.as_view(), name='api_add_address'),
    path('delete-address/<int:pk>/', DeleteAddressAPIView.as_view(), name='api_delete_address'),
    path('addresses/<int:pk>/', EditAddressesAPIView.as_view(), name='edit_address'),
    path('add-to-cart/', AddToCartAPIView.as_view(), name='add_to_cart'),
    path('delete-cart-item/', DeleteCartItemAPIView.as_view(), name='delete_cart_item'),
    path('view-cart/', ViewCartAPIView.as_view(), name='view_cart'),
    path('update-cart-item/', UpdateCartItemAPIView.as_view(), name='update_cart_items'),
    path('register-employee/', RegisterEmployeeAPIView.as_view(), name='register_employee'),
    path('employees/', EmployeesListAPIView.as_view(), name='list_employees'),
    path('edit-employee/<int:pk>/', EditEmployeeAPIView.as_view(), name='edit_employee'),
    path('delete-employee/<int:pk>/', DeleteEmployeeAPIView.as_view(), name='delete_employee'),
    path('employees/<int:pk>/', ViewEmployeeAPIView.as_view(), name='view_employee'),
    path('uncompleted-orders/', UncompletedOrdersListAPIView.as_view(), name='uncompleted_orders'),
    path('uncompleted-orders/<int:pk>/complete/', CompletingOrderAPIView.as_view(), name='completing_order'),
    path('completed-orders/', CompletedOrdersListAPIView.as_view(), name='completed_orders'),
    path('logout/', LogOutAPIView.as_view(), name='logout'),
    path('foods/', FoodsListAPIView.as_view(), name='foods_list'),
    path('add-food/', AddFoodAPIView.as_view(), name='add_food'),
    path('edit-food/<int:pk>/', EditFoodAPIView.as_view(), name='edit_food'),
    path('delete-food/<int:pk>/', DeleteFoodAPIView.as_view(), name='delete_food'),
    path('foods/<int:pk>/', ViewFoodInfoAPIView.as_view(), name='view_food'),
    path('coupons/', CouponsListAPIView.as_view(), name='coupons_list'),
    path('coupons/<int:pk>/', ViewCouponAPIView.as_view(), name='view_coupon'),
    path('add-coupon/', AddCouponAPIView.as_view(), name='add_coupon'),
    path('edit-coupon/<int:pk>/', EditCouponAPIView.as_view(), name='edit_coupon'),
    path('delete-coupon/<int:pk>/', DeleteCouponAPIView.as_view(), name='delete_coupon'),
    path('total-revenue/', ViewTotalRevenueAPIView.as_view(), name='total_revenue'),
    path('top-ten-foods/', TopSellingFoodsAPIView.as_view(), name='top_ten_foods'),

]
