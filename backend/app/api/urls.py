from django.urls import path
from api.apis import api, sse_endpoint

urlpatterns = [
    path("", api.urls),
    path("sse/", sse_endpoint, name="sse_endpoint"),
]
