from django.urls import path
from api.apis import api

urlpatterns = [
    path("", api.urls),
]
