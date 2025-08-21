from rest_framework import serializers
from rest_framework.authtoken.models import Token
from main.models import Address, Users, Food, FoodRating, Coupon, UsedCoupon, Cart, Order, CartItem, OrderItem
from django.utils.timezone import now



# Address Serializer
class AddressSerializer(serializers.ModelSerializer):
    # user = BaseUserSerializer(read_only=True)
    class Meta:
        model = Address
        fields = ['id' ,'address', 'details', 'postal_code', 'title']

    def validate_postal_code(self, value):
        if len(value) != 10:
            raise serializers.ValidationError("کد پستی باید ۱۰ رقم باشد.")
        return value



# Base User Serializer (commen for all users)
class BaseUserSerializer(serializers.ModelSerializer):
    addresses = AddressSerializer(many=True , required=False)
    class Meta:
        model = Users
        fields = ['id', 'username', 'first_name', 'last_name' , 'email', 'password', 'phone_number','addresses']
        extra_kwargs = {
            'password': {'write_only': True},
        }

    # def get_token(self, obj):
    #     token, created = Token.objects.get_or_create(user=obj)
    #     return token.key

    def validate_phone_number(self, value):
        if len(value) != 11 or not value.startswith('09'):
            raise serializers.ValidationError("شماره تلفن باید ۱۱ رقم باشد و با ۰۹ شروع شود.")
        return value



# Customer Serializer
class CustomerSerializer(BaseUserSerializer):
    # addresses = AddressSerializer(many=True)

    def create(self, validated_data):
        addresses_data = validated_data.pop('addresses', []) #daryafte address
        user = Users.objects.create_user(**validated_data) #دریافت اطلاعات کاربر و هش کردن رمز
        user.role = 'customer'
        user.save()
        for address_data in addresses_data:
            address = Address.objects.create(user=user,**address_data)
            user.addresses.add(address)
        return user


# Employee Serializer
class EmployeeSerializer(BaseUserSerializer):
    def create(self, validated_data):
        user = Users.objects.create_user(**validated_data)#دریافت اطلاعات کاربر و هش کردن رمز
        user.role = 'employee'
        user.save()
        return user

#Food Serializer
class FoodSerializer(serializers.ModelSerializer):
    average_rating = serializers.SerializerMethodField()
    sales_count = serializers.SerializerMethodField()

    class Meta:
        model = Food
        fields = ['id', 'name', 'price', 'code', 'description', 'image', 'category', 'sales_count' , 'average_rating']

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("قیمت باید بیشتر از ۰ باشد.")
        return value

    def validate_quantity(self, value):
        if value < 0:
            raise serializers.ValidationError("موجودی نمی‌تواند منفی باشد.")
        return value

    def get_sales_count(self, obj):
        return obj.sales_count()

    def get_average_rating(self, obj):
        # calculating the avarage rate of a food
        return obj.average_rating()  



# FoodRating Serializer
class FoodRatingSerializer(serializers.ModelSerializer):
    food = serializers.PrimaryKeyRelatedField(queryset=Food.objects.all())
    class Meta:
        model = FoodRating
        fields = ['id', 'food', 'rating']

    def validate_rating(self, value):
        if not (1 <= value <= 5):
            raise serializers.ValidationError("امتیاز باید بین ۱ تا ۵ باشد.")
        return value


# Coupon Serializer
class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = ['id', 'code', 'discount', 'expiration_date']

    def validate_discount(self, value):
        if not (0 <= value <= 100):
            raise serializers.ValidationError("درصد تخفیف باید بین ۰ تا ۱۰۰ باشد.")
        return value

    def validate_expiration_date(self, value):
        if value < now().date():
            raise serializers.ValidationError("تاریخ انقضا باید در آینده باشد.")
        return value

class UsedCouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = UsedCoupon
        fields = ['id','user','coupon','used_at']


# CartItem Serializer
class CartItemSerializer(serializers.ModelSerializer):
    food = FoodSerializer(read_only=True)
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ['id', 'cart', 'food', 'quantity', 'coupon', 'total_price']

    def get_total_price(self, obj):
        return obj.total_price()

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("تعداد باید بیشتر از ۰ باشد.")
        return value


# Cart Serializer
class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, source='cartItem')

    class Meta:
        model = Cart
        fields = ['id', 'user', 'created_at','items','total_price']

    def get_total_price(self, obj):
        return obj.total_price()


class OrderItemSerializer(serializers.ModelSerializer):
    food = FoodSerializer()  # بازگرداندن اطلاعات کامل غذا
    total_price = serializers.SerializerMethodField()
    food_rating = serializers.SerializerMethodField()
    class Meta:
        model = OrderItem
        fields = ['id', 'quantity', 'food', 'total_price','food_rating']

    def get_total_price(self, obj):
        return obj.total_price()

    def get_food_rating(self, obj):
        rating = FoodRating.objects.filter(order=obj.order, food=obj.food, user=obj.order.user).first()
        return rating.rating if rating else None


class OrderSerializer(serializers.ModelSerializer):

    items = OrderItemSerializer(many=True, read_only=True)  # بازگرداندن آیتم‌های سفارش
    total_price = serializers.SerializerMethodField()
    discounted_price = serializers.SerializerMethodField()
    discount = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()

    username = serializers.SerializerMethodField()
    first_name = serializers.SerializerMethodField()
    last_name = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = ['id', 'user','username', 'first_name', 'last_name','address', 'status', 'created_at', 'total_price', 'discounted_price', 'discount',
                  'used_coupon', 'items','rating']

    def validate_status(self, value):
        if value not in ['Pending', 'Canceled', 'Completed']:
            raise serializers.ValidationError("وضعیت سفارش معتبر نیست.")
        return value

    def get_total_price(self, obj):
        return obj.total_price()

    def get_discounted_price(self, obj):
        return obj.discounted_price()

    def get_discount(self, obj):
        return obj.used_coupon.coupon.discount if obj.used_coupon else 0

    def get_username(self, obj):
        return obj.user.username

    def get_first_name(self, obj):
        return obj.user.first_name

    def get_last_name(self, obj):
        return obj.user.last_name

    def get_rating(self, obj):
        rating = FoodRating.objects.filter(order=obj, user=obj.user).first()
        return rating.rating if rating else None

