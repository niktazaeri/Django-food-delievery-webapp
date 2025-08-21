from datetime import datetime, timedelta
from turtledemo.penrose import start

from django.http import JsonResponse
from django.utils import timezone
from django.utils.timezone import now
from rest_framework.authentication import TokenAuthentication
from rest_framework.generics import ListAPIView, CreateAPIView, UpdateAPIView, RetrieveUpdateAPIView, DestroyAPIView, \
    RetrieveDestroyAPIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework import status, request
from django.contrib.auth import authenticate, logout

from main.models import Food, Coupon, Order, Users, Cart, CartItem, Address, UsedCoupon, FoodRating, OrderItem
from main.permissions import IsAdminUserRole, IsCustomerRole, IsEmployeeRole
from .serializers import CustomerSerializer, EmployeeSerializer, AddressSerializer, FoodSerializer, CouponSerializer, \
    OrderSerializer, CartItemSerializer, CartSerializer, FoodRatingSerializer, OrderItemSerializer


class IndexView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        user = request.user
        if user.is_authenticated:
            usre_role = user.role
            return Response({'role': usre_role}, status=status.HTTP_200_OK)
        else:
            return Response(status=status.HTTP_401_UNAUTHORIZED)


class FoodPagination(PageNumberPagination):
    page_size = 8  # number of items in each page
    page_size_query_param = 'page_size'  # changing the page size via URL
    max_page_size = 100  # maximum number of items in each page

class CustomAuthTokenAPIView(APIView):
    """
    View for login users and retrieving their token
    """
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        # احراز هویت کاربر
        user = authenticate(username=username, password=password)
        if user:
            token, created = Token.objects.get_or_create(user=user)
            addresses_serializer = AddressSerializer(user.addresses, many=True)
            # بازگرداندن اطلاعات کامل کاربر همراه با توکن
            response_data ={
                'token': token.key,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'role': user.role,
                    'addresses': addresses_serializer.data, #adresses ye field manyTomany hast
                    'phone_number': user.phone_number,
                }
            }
            # save tokens as auth_token in cookies
            response = JsonResponse(response_data, status=status.HTTP_200_OK)
            response.set_cookie('auth_token', token.key, httponly=True)  # cookie configuration
            return response
        else:
            return Response({'error': 'نام کاربری یا رمز عبور اشتباه است.'}, status=status.HTTP_401_UNAUTHORIZED)


class LogoutAPIView(APIView):
    permission_classes = [IsCustomerRole | IsAdminUserRole | IsEmployeeRole ]
    def post(self, request, *args, **kwargs):
        try:
            request.user.auth_token.delete()
        except:
            pass
        response = Response({"detail": "Successfully logged out."})
        response.delete_cookie('auth_token')
        return response


class RegisterCustomerAPIView(APIView):
    """
    View for registering customers
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = CustomerSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()

            # creating token
            token, created = Token.objects.get_or_create(user=user)

            # serializing addresses
            addresses_serializer = AddressSerializer(user.addresses.all(), many=True)

            response_data = {
                'message': 'ثبت‌نام با موفقیت انجام شد!',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'email': user.email,
                    'addresses': addresses_serializer.data,
                    'phone_number': user.phone_number,
                },
                'token': token.key
            }

            # save tokens as auth_token in cookies
            response = JsonResponse(response_data, status=status.HTTP_201_CREATED)
            response.set_cookie('auth_token', token.key, httponly=True)  # cookie configuration
            return response
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

###################################################################################
#customer

class FoodListFilterView(APIView):
    def get(self, request, *args, **kwargs):
        # getting category and page number from URL
        category = request.query_params.get('category', 'all')
        page = int(request.query_params.get('page', 1))

        # filtering foods besed on categories
        if category != 'all':
            foods = Food.objects.filter(category=category)
        else:
            foods = Food.objects.all()

        # do pagination
        paginator = PageNumberPagination()
        paginator.page_size = 8  # number of foods in each page
        result_page = paginator.paginate_queryset(foods, request)

        # serializing datas
        serializer = FoodSerializer(result_page, many=True)

        return paginator.get_paginated_response(serializer.data)

class CustomerOrderHistoryAPIView(APIView):
    permission_classes = [IsCustomerRole]
    authentication_classes = [TokenAuthentication]

    def get(self, request):
        user = request.user
        orders = Order.objects.filter(user=user).order_by('-created_at')  
        if not orders.exists():
            return Response({'message': 'شما هنوز سفارشی ثبت نکرده‌اید.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class CustomerCompletedOrdersListAPIView(ListAPIView):
    permission_classes = [IsCustomerRole]
    authentication_classes = [TokenAuthentication]
    serializer_class = OrderSerializer
    def get_queryset(self):
        user = self.request.user
        return Order.objects.filter(user=user, status='Completed').order_by('-created_at')


class AddressesListAPIView(ListAPIView):
    permission_classes = [IsCustomerRole]
    serializer_class = AddressSerializer
    model = Address
    def get_queryset(self):
        # Access the user through self.request.user
        return Address.objects.filter(user=self.request.user)

class CreateAddressAPIView(CreateAPIView):
    permission_classes = [IsCustomerRole]
    serializer_class = AddressSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class EditAddressesAPIView(RetrieveUpdateAPIView):
    permission_classes = [IsCustomerRole]
    serializer_class = AddressSerializer
    def get_queryset(self):
        # Access the user through self.request.user
        return Address.objects.filter(user=self.request.user)

class DeleteAddressAPIView(APIView):
    permission_classes = [IsAuthenticated]  # Ensure the user is authenticated

    def delete(self, request, pk):
        try:
            # Get the address to delete based on the ID
            address = Address.objects.get(id=pk, user=request.user)
            address.delete()  # Delete the address
            return Response({"message": "Address deleted successfully."}, status=status.HTTP_200_OK)
        except Address.DoesNotExist:
            return Response({"error": "Address not found."}, status=status.HTTP_404_NOT_FOUND)

class AddToCartAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        food_id = request.data.get('food_id')
        quantity = int(request.data.get('quantity', 1))  

        try:
            food = Food.objects.get(id=food_id)
        except Food.DoesNotExist:
            return Response({'message': 'غذا یافت نشد.'}, status=status.HTTP_404_NOT_FOUND)

        cart, created = Cart.objects.get_or_create(user=user)
        cart_item, created = CartItem.objects.get_or_create(cart=cart, food=food)

        # updating cart based on increasing the number of items
        cart_item.quantity = cart_item.quantity + quantity if not created else quantity
        cart_item.save()

        return Response({'message': f'غذا "{food.name}" به سبد خرید اضافه شد.'}, status=status.HTTP_200_OK)

class DeleteCartItemAPIView(APIView):
    permission_classes = [IsCustomerRole]
    authentication_classes = [TokenAuthentication]

    def delete(self, request):
        user = request.user
        item_id = request.data.get('item_id')

        try:
            cart_item = CartItem.objects.get(id=item_id, cart__user=user)
            cart_item.delete()
            return Response({'message': 'آیتم با موفقیت حذف شد.'}, status=status.HTTP_200_OK)
        except CartItem.DoesNotExist:
            return Response({'message': 'آیتم یافت نشد.'}, status=status.HTTP_404_NOT_FOUND)


class ViewCartAPIView(APIView):
    permission_classes = [IsCustomerRole]

    def get(self, request):
        user = request.user
        try:
            cart = Cart.objects.get(user=user)
            cart_items = CartItem.objects.filter(cart=cart)
        except Cart.DoesNotExist:
            cart_items = []  # سبد خرید خالی است

        serializer = CartItemSerializer(cart_items, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UpdateCartItemAPIView(APIView):
    permission_classes = [IsCustomerRole]
    authentication_classes = [TokenAuthentication]

    def post(self, request):
        user = request.user
        item_id = request.data.get('item_id')
        action = request.data.get('action')  # "increase" or "decrease"

        try:
            cart_item = CartItem.objects.get(id=item_id, cart__user=user)
        except CartItem.DoesNotExist:
            return Response({'message': 'آیتم یافت نشد.'}, status=status.HTTP_404_NOT_FOUND)

        if action == 'increase':
            cart_item.quantity += 1
        elif action == 'decrease':
            cart_item.quantity -= 1
            if cart_item.quantity <= 0:
                cart_item.delete()
                return Response({'message': 'آیتم از سبد خرید حذف شد.'}, status=status.HTTP_200_OK)

        cart_item.save()
        return Response({'message': 'سبد خرید به‌روزرسانی شد.', 'quantity': cart_item.quantity}, status=status.HTTP_200_OK)

class OrderPreviewAPIView(APIView):
    permission_classes = [IsCustomerRole]
    authentication_classes = [TokenAuthentication]

    def post(self, request):
        user = request.user
        address_id = request.data.get('address_id')
        coupon_code = request.data.get('coupon_code', None)

        # check if user select an address
        if not address_id:
            return Response({'error': 'آدرس باید مشخص باشد.'}, status=status.HTTP_400_BAD_REQUEST)

        # finding selected address
        try:
            address = user.addresses.get(id=address_id)
        except Address.DoesNotExist:
            return Response({'error': 'آدرس انتخاب شده معتبر نیست.'}, status=status.HTTP_400_BAD_REQUEST)

        # finding cart
        cart = Cart.objects.filter(user=user).first()
        if not cart or cart.cartItem.count() == 0:
            return Response({'error': 'سبد خرید شما خالی است.'}, status=status.HTTP_400_BAD_REQUEST)

        # serializing to show the items of cart
        cart_serializer = CartSerializer(cart)

        # calculating total price
        total_price = cart.total_price()
        discount = 0
        discounted_price = total_price
        # discount
        if coupon_code:
            try:
                coupon = Coupon.objects.get(code=coupon_code)
                if coupon.expiration_date >= timezone.now().date():
                    discount = coupon.discount
                    discounted_price = total_price - (total_price * discount / 100)
            except Coupon.DoesNotExist:
                return Response({'error': 'کد تخفیف نامعتبر است.'}, status=status.HTTP_400_BAD_REQUEST)

        # creating order pre-view
        order_preview = {
            'address': {
                'title': address.title,
                'address': address.address,
                'details': address.details
            },
            'items': cart_serializer.data['items'],  # using items of cart
            'total_price': total_price,
            'discount': discount,
            'discounted_price': discounted_price
        }

        return Response(order_preview, status=status.HTTP_200_OK)


class ApplyCouponAPIView(APIView):
    permission_classes = [IsCustomerRole]

    def post(self, request):
        user = request.user
        coupon_code = request.data.get('coupon_code')

        # getting user's cart 
        cart_items = CartItem.objects.filter(cart__user=user)

        # calculate total price
        total_price = sum(item.total_price() for item in cart_items)

        if not coupon_code:
            return Response({"message": "کد تخفیف وارد نشده است."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            coupon = Coupon.objects.get(code=coupon_code)
        except Coupon.DoesNotExist:
            return Response({"message": "کد تخفیف نامعتبر است."}, status=status.HTTP_400_BAD_REQUEST)

        # checking expiration date of coupon
        if coupon.expiration_date < timezone.now().date():
            return Response({"message": "کد تخفیف منقضی شده است."}, status=status.HTTP_400_BAD_REQUEST)

        # checking whether user has used this coupon before
        if UsedCoupon.objects.filter(user=user, coupon=coupon).exists():
            return Response({"message": "شما قبلاً از این کد تخفیف استفاده کرده‌اید."},
                            status=status.HTTP_400_BAD_REQUEST)

        # discount
        discount_amount = total_price * (coupon.discount / 100)
        discounted_price = total_price - discount_amount

        # discount infos and before and after total price
        return Response({
            "discount": coupon.discount,
            "discount_amount": discount_amount,
            "original_price": total_price,
            "discounted_price": discounted_price
        }, status=status.HTTP_200_OK)


class OrderCreateAPIView(APIView):
    permission_classes = [IsCustomerRole]
    authentication_classes = [TokenAuthentication]

    def post(self, request):
        user = request.user
        address_id = request.data.get('address_id')
        coupon_code = request.data.get('coupon_code', None)

        if not address_id:
            return Response({'error': 'آدرس باید مشخص باشد.'}, status=status.HTTP_400_BAD_REQUEST)

        # get user's cart
        cart = Cart.objects.filter(user=user).first()
        if not cart or cart.cartItem.count() == 0:
            return Response({'error': 'سبد خرید شما خالی است.'}, status=status.HTTP_400_BAD_REQUEST)

        # discount
        used_coupon = None
        if coupon_code:
            try:
                coupon = Coupon.objects.get(code=coupon_code)
                used_coupon = UsedCoupon.objects.create(user=user, coupon=coupon)
            except Coupon.DoesNotExist:
                return Response({'error': 'کد تخفیف نامعتبر است.'}, status=status.HTTP_400_BAD_REQUEST)

        # create order
        order = Order.objects.create(
            user=user,
            address_id=address_id,
            used_coupon=used_coupon,
            status='Pending'
        )

        # transforming cart items to order items
        for cart_item in cart.cartItem.all():
            order.items.create(
                order=order,
                food=cart_item.food,
                quantity=cart_item.quantity
            )

        cart.cartItem.all().delete()
        order_data = OrderSerializer(order).data

        return Response({'success': True, 'order_id': order.id, 'order_data': order_data}, status=status.HTTP_201_CREATED)


class OrderDetailsAPIView(APIView):
    permission_classes = [IsCustomerRole]
    authentication_classes = [TokenAuthentication]

    def get(self, request, pk):

        user = request.user
        try:
            order = Order.objects.get(id=pk, user=user)
        except Order.DoesNotExist:
            return Response({'message': 'سفارش یافت نشد.'}, status=status.HTTP_404_NOT_FOUND)

        # getting order detailes
        items = []
        total_price = 0
        for item in order.items.all():
            items.append({
                'food': {'name': item.food.name, 'price': item.food.price},
                'quantity': item.quantity,
                'total': item.food.price * item.quantity
            })
            total_price += item.total_price()  

        # discount
        if order.used_coupon:
            discount = order.used_coupon.coupon.discount
        else:
            discount = 0

        # final price after giving discount
        discounted_price = total_price - (total_price * discount / 100)

        # creating order details
        order_details = {
            'address': {
                'title': order.address.title,
                'address': order.address.address,
                'details': order.address.details
            },
            'items': items,
            'total_price': total_price,
            'discount': discount,
            'discounted_price': discounted_price
        }

        return Response(order_details, status=status.HTTP_200_OK)

class RateFoodListAPIView(APIView):
    permission_classes = [IsCustomerRole]
    authentication_classes = [TokenAuthentication]

    def post(self, request, *args, **kwargs):
        try:

            order_id = request.data.get('order_id')
            # finding order
            order = Order.objects.get(id=order_id, user=request.user, status='Completed')
        except Order.DoesNotExist:
            return Response({'success': False, 'message': 'سفارش یافت نشد یا وضعیت سفارش تکمیل نشده است.'},
                            status=status.HTTP_404_NOT_FOUND)

        order_items = OrderItem.objects.filter(order=order)

        serializer = OrderItemSerializer(order_items, many=True)
        return Response({'success': True, 'order_items': serializer.data}, status=status.HTTP_200_OK)


class RateFoodAPIView(APIView):
    permission_classes = [IsCustomerRole]
    authentication_classes = [TokenAuthentication]

    def post(self, request, *args, **kwargs):
        food_id = request.data.get('food')
        rating = request.data.get('rating')
        order_id = request.data.get('order_id')

        if not food_id or not rating or not order_id:
            return Response({'success': False, 'message': 'اطلاعات ناقص است.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            food = Food.objects.get(id=food_id)
            order = Order.objects.get(id=order_id, user=request.user, status='Completed')  
        except Food.DoesNotExist:
            return Response({'success': False, 'message': 'غذا یافت نشد.'}, status=status.HTTP_404_NOT_FOUND)

        FoodRating.objects.create(user=request.user, food=food, rating=rating, order=order)

        return Response({'success': True, 'message': 'امتیاز شما ثبت شد.'}, status=status.HTTP_201_CREATED)


class CancelOrderAPIView(APIView):
    permission_classes = [IsCustomerRole]
    authentication_classes = [TokenAuthentication]

    def post(self, request, *args, **kwargs):
        try:
            order = Order.objects.get(id=kwargs['pk'] , user=request.user)
        except Order.DoesNotExist:
            return Response({"error": "سفارش یافت نشد."}, status=status.HTTP_404_NOT_FOUND)

        if order.status != 'Pending':
            return Response({"error": "تنها سفارشات در حال انتظار قابل لغو هستند."}, status=status.HTTP_400_BAD_REQUEST)

        # checking how much time has passed from order
        time_difference = now() - order.created_at
        if time_difference > timedelta(minutes=30):
            return Response({"error": "امکان لغو سفارش پس از ۳۰ دقیقه وجود ندارد."}, status=status.HTTP_400_BAD_REQUEST)

        # cancling order
        order.status = 'Canceled'
        order.save()

        return Response({"message": "سفارش با موفقیت لغو شد."}, status=status.HTTP_200_OK)


####################################################################################
#employee

class UncompletedOrdersListAPIView(ListAPIView):
    permission_classes = [IsEmployeeRole]
    authentication_classes = [TokenAuthentication]
    serializer_class = OrderSerializer
    def get_queryset(self):
        return Order.objects.filter(status='Pending').order_by('-created_at')

class CompletingOrderAPIView(APIView):

    permission_classes = [IsEmployeeRole]
    authentication_classes = [TokenAuthentication]

    def post(self, request, *args, **kwargs):

        order_id = request.data.get('order_id')

        if not order_id:
            return Response(
                {"error": "شناسه سفارش ارسال نشده است."},
                status=status.HTTP_400_BAD_REQUEST
            )

        order = Order.objects.get(id=order_id)

        if order.status == 'Completed':
            return Response(
                {"message": "این سفارش قبلاً تکمیل شده است."},
                status=status.HTTP_400_BAD_REQUEST
            )

        order.status = 'Completed'
        order.save()
        serializer = OrderSerializer(order)
        return Response(
            {"message": "سفارش با موفقیت تکمیل شد.", "order": serializer.data},
            status=status.HTTP_200_OK
        )


class CompletedOrdersListAPIView(ListAPIView):
    permission_classes = [IsEmployeeRole]
    authentication_classes = [TokenAuthentication]
    serializer_class = OrderSerializer
    def get_queryset(self):
        return Order.objects.filter(status = 'Completed').order_by('-created_at')

####################################################################################
#admin
class RegisterEmployeeAPIView(APIView):
    permission_classes = [IsAdminUserRole]
    def post(self, request):
        serializer = EmployeeSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'message': 'ثبت‌نام با موفقیت انجام شد!',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'email': user.email,
                    'phone_number': user.phone_number,
                },
                'token': token.key
            }, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class EmployeesListAPIView(ListAPIView):
    permission_classes = [IsAdminUserRole]
    serializer_class = EmployeeSerializer
    queryset = Users.objects.filter(role="employee")

class EditEmployeeAPIView(RetrieveUpdateAPIView):
    permission_classes = [IsAdminUserRole]
    serializer_class = EmployeeSerializer
    queryset = Users.objects.filter(role="employee")

class DeleteEmployeeAPIView(APIView):
    permission_classes = [IsAdminUserRole]
    def delete(self, request, *args, **kwargs):
        try:
            employee = Users.objects.filter(role="employee").get(pk=kwargs['pk'])
            employee.delete()
            return Response(
                {
                    'message': "کارمند با موفقیت حذف شد",
                    'employee first name': employee.first_name,
                    'employee last name': employee.last_name,
                    'employee id': employee.pk
                },
                status=status.HTTP_204_NO_CONTENT
            )
        except Users.EMPLOYEE.DoesNotExist:
            return Response(
                {"detail": "کارمند مورد نظر یافت نشد"},
                status=status.HTTP_404_NOT_FOUND
            )

class ViewEmployeeAPIView(APIView):
    permission_classes = [IsAdminUserRole]
    def get(self, request , pk):
        employee = Users.objects.filter(role="employee").get(pk=pk)
        serializer = EmployeeSerializer(employee)
        return Response(serializer.data)

class LogOutAPIView(APIView):
    permission_classes = [IsCustomerRole | IsEmployeeRole | IsAdminUserRole]

    def post(self, request):
        user = request.user
        # # حذف توکن کاربر
        # Token.objects.filter(user=user).delete()
        logout(request)
        return Response({
            "message": "خروج از برنامه با موفقیت انجام شد!"
        }, status=status.HTTP_200_OK)


##################################################################################################
#Foods

class FoodsListAPIView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = FoodSerializer
    model = Food
    queryset = Food.objects.all()
    pagination_class = FoodPagination  

class AddFoodAPIView(APIView):
    permission_classes = [IsAdminUserRole]
    parser_classes = (MultiPartParser, FormParser)  # for processing files

    def post(self, request):
        serializer = FoodSerializer(data=request.data)
        if serializer.is_valid():
            image = request.FILES.get('image') 
            if image:
                serializer.save(image=image) 
            else:
                serializer.save()  # if there image has not been sent , saving food without image
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EditFoodAPIView(RetrieveUpdateAPIView):
    permission_classes = [IsAdminUserRole]
    serializer_class = FoodSerializer
    queryset = Food.objects.all()

class DeleteFoodAPIView(APIView):
    permission_classes = [IsAdminUserRole]
    def delete(self, request, pk):
        try:
            food = Food.objects.get(pk=pk)
            food.delete()
            return Response(
                {
                    'message': "غذا با موفقیت حذف شد",
                    'food': food.name,
                    'food-id': pk
                },
                status=status.HTTP_204_NO_CONTENT
            )
        except Food.DoesNotExist:
            return Response(
                {"detail": "غذای مورد نظر یافت نشد"},
                status=status.HTTP_404_NOT_FOUND
            )

class ViewFoodInfoAPIView(APIView):
    permission_classes = [IsAdminUserRole]
    def get(self, request, pk):
        food = Food.objects.get(pk=pk)
        serializer = FoodSerializer(food)
        return Response(serializer.data)
################################################################################
#coupons
class CouponsListAPIView(ListAPIView):
    permission_classes = [IsAdminUserRole]
    serializer_class = CouponSerializer
    model = Coupon
    queryset = Coupon.objects.all().order_by('-id')

class AddCouponAPIView(APIView):
    permission_classes = [IsAdminUserRole]
    def post(self, request):
        serializer = CouponSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class EditCouponAPIView(RetrieveUpdateAPIView):
    permission_classes = [IsAdminUserRole]
    serializer_class = CouponSerializer
    queryset = Coupon.objects.all()

class DeleteCouponAPIView(DestroyAPIView):
    permission_classes = [IsAdminUserRole]
    serializer_class = CouponSerializer
    queryset = Coupon.objects.all()

class ViewCouponAPIView(APIView):
    permission_classes = [IsAdminUserRole]
    def get(self, request , pk):
        coupon = Coupon.objects.get(pk=pk)
        serializer = CouponSerializer(coupon)
        return Response(serializer.data)


#############################################################################
class ViewTotalRevenueAPIView(APIView):
    permission_classes = [IsAdminUserRole]
    def get(self, request):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        if not start_date or not end_date:
            return Response(
                {"message": "لطفا تاریخ شروع و پایان را وارد کنید."},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            start_date = datetime.strptime(start_date, '%Y-%m-%d')
            end_date = datetime.strptime(end_date, '%Y-%m-%d')
        except ValueError:
            return Response(
                {'message': "فرمت تاریخ وارد شده صحیح نیست ، باید به فرم 20/04/1381 باشد"}
                , status=status.HTTP_400_BAD_REQUEST
            )

        orders = Order.objects.filter(status="Completed",created_at__gte=start_date, created_at__lte=end_date)

        if orders.exists():
            total_revenue = sum(order.total_price() for order in orders)
            return Response(
                {'message':'درآمد کلی در این بازه زمانی برابر هست با :',
                 'total_revenue': total_revenue
                 }, status=status.HTTP_200_OK
            )
        else:
            return Response({
                'message':'سفارشی در این بازه زمانی موجود نیست',
                'total_revenue': 0
            }, status=status.HTTP_404_NOT_FOUND)


class TopSellingFoodsAPIView(APIView):
    permission_classes = [IsAdminUserRole | IsCustomerRole]
    authentication_classes = [TokenAuthentication]

    def get(self, request):
        try:
            foods = Food.objects.all()
            sorted_foods = sorted(foods, key=lambda x: x.sales_count(), reverse=True)
            top_ten_foods = sorted_foods[:10]

            serializer = FoodSerializer(top_ten_foods, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

