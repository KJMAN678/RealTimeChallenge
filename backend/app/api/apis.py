from ninja import NinjaAPI

api = NinjaAPI()


@api.get("/")
def index(request):
    return {"test": 1}
