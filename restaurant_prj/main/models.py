from datetime import date

from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models


from restaurant_prj import settings


class Users(AbstractUser):

    ADMIN = 'admin'
    EMPLOYEE = 'employee'
    CUSTOMER = 'customer'

    ROLE_CHOICES = (
        (ADMIN, 'Admin'),
        (EMPLOYEE, 'Employee'),
        (CUSTOMER, 'Customer'),
    )
    role =models.CharField(max_length=10, choices=ROLE_CHOICES)
    phone_number = models.CharField(max_length=11 ,blank=False , null=False)

    def __str__(self):
        return f"{self.username} - {self.role}"

class Address(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='addresses')
    address = models.CharField(max_length=100,blank=False , null=False)
    details = models.CharField(max_length=100, blank=False, null=False) #street , doorplate ,etc
    postal_code = models.CharField(max_length=100 , blank=True , null =True)#postal code (optional)
    title = models.CharField(max_length=50 , blank=True , null =True) #title (optional e.g : home,work,..)

    def __str__(self):
        return f"Address : {self.address} {self.details}"


class Food(models.Model):
    name = models.CharField(max_length=100 , blank=False, null=False,unique=True)
    price = models.IntegerField(blank=False, null=False)
    code = models.CharField(max_length=100 , unique=True , blank=False, null=False)
    description = models.TextField(blank=False, null=False)
    image = models.ImageField(upload_to='images/', blank=True, null=True)
    FOOD_CATEGORIES = [
        ('ایرانی', 'ایرانی'), #Iranian
        ('فست فود', 'فست فود'), #Fastfood
        ('دسر', 'دسر'), #Dessert
        ('پیش غذا', 'پیش غذا'), #Appetizer
        ('نوشیدنی', 'نوشیدنی'), #Drinks
    ]
    category = models.CharField(max_length=50, choices=FOOD_CATEGORIES)

    def sales_count(self):
        sales_count = 0
        for order_item in self.items.filter(order__status="Completed"):
            sales_count += order_item.quantity
        return sales_count

    def average_rating(self):
        # calculate food rate average
        ratings = self.ratings.all()  # all food's rate
        if ratings.exists():
            average_rate = sum(float(rate.rating) for rate in ratings) / ratings.count()
            return round(average_rate, 2)
        return 0

    def __str__(self):
        return f"{self.name} - {self.code} - {self.price}"


class Coupon(models.Model):
    code = models.CharField(max_length=100 , unique=True , blank=False, null=False)
    discount = models.IntegerField(null = True)
    usage_count = models.PositiveIntegerField(default=0)

    expiration_date = models.DateField(auto_now=False, auto_now_add=False)

    def __str__(self):
        return f"Coupon: {self.code}, Discount: {self.discount}% , expiration : {self.expiration_date}"

class UsedCoupon(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    coupon = models.ForeignKey(Coupon, on_delete=models.CASCADE)
    used_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'coupon') #Being disposable

    def __str__(self):
        return f"{self.user} used {self.coupon.code} , {self.coupon.discount})"


class Cart(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def total_price(self):
        return sum(item.total_price() for item in self.cartItem.all())

    def __str__(self):
        return f"{self.user.username}'s cart - Total: {self.total_price()} created at {self.created_at}"

class Order(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    # cart = models.OneToOneField(Cart, on_delete=models.CASCADE, null=True, blank=True)
    address = models.ForeignKey(Address, on_delete=models.CASCADE, null=True, blank=True)
    # quantity = models.PositiveIntegerField(default=1)
    used_coupon = models.ForeignKey(UsedCoupon, on_delete=models.CASCADE, null=True, blank=True)
    STATUS_CHOICES = (
        ('Pending' , 'Pending'),
        ('Canceled' , 'Canceled'),
        ('Completed' , 'Completed'),
    )
    status = models.CharField(max_length=100, choices=STATUS_CHOICES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)#tarikhe sefaresh

    def total_price(self):#total revenue from an order
        total = 0
        for order_item in self.items.all():  # sum of income from all items in an order
            total += order_item.total_price()  # using total_price() from OrderItem model
        return total

    def discounted_price(self):
        total = self.total_price()  # calculate total revenue
        if self.used_coupon:
            discount = self.used_coupon.coupon.discount / 100  # discount in percent
            discounted_price = total - (total * discount)  # calculate price after applying discount
            return round(discounted_price, 2)  # round up to 2 digits
        return round(total, 2)  # If the discount is not applied, the total income will be rounded up to two digits.

    def __str__(self):
        return f"{self.user} orders at {self.created_at}"

class FoodRating(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    food = models.ForeignKey(Food, on_delete=models.CASCADE, related_name='ratings')
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    order = models.ForeignKey(Order, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} rated {self.food.name} - {self.rating} stars"

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE , related_name='cartItem')
    food = models.ForeignKey(Food, on_delete=models.CASCADE , related_name='foodItem')
    quantity = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])
    coupon = models.ForeignKey(Coupon, on_delete=models.CASCADE, null=True, blank=True)
    def total_price(self):
        # total price for each food
        total = self.food.price * self.quantity

        return total
    def __str__(self):
        return f"Food: {self.food.name}, Quantity: {self.quantity}, Total: {self.total_price()}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    food = models.ForeignKey(Food, on_delete=models.CASCADE, related_name='items')
    quantity = models.PositiveIntegerField(default=1)

    def total_price(self):
        return self.food.price * self.quantity

    def __str__(self):
        return f"{self.order} :\n {self.food} ×{self.quantity} total:{self.total_price()}"

