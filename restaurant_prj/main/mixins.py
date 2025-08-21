from django.shortcuts import redirect
from django.contrib.auth.mixins import AccessMixin
from django.urls import reverse_lazy


class LoggedOutOnlyMixin(AccessMixin):
    """
    Mixin to restrict access to views for logged-in users.
    If the user is authenticated, they are redirected to a specified URL.
    """
    redirect_url = reverse_lazy('index')

    def dispatch(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            return redirect(self.redirect_url)
        return super().dispatch(request, *args, **kwargs)
