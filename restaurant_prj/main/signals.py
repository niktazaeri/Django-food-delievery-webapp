# main/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Users, Address

@receiver(post_save, sender=Users)
def create_user_address(sender, instance, created, **kwargs):
    # if a new user was created, saving their addresses
    if created:
        addresses = instance.addresses.all()  # getting all addresses
        for address in addresses:
            # save addresses
            Address.objects.create(user=instance, **address.__dict__)
