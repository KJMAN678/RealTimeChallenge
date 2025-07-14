import json
from ninja import NinjaAPI
from ninja.schema import Schema
from django.http import StreamingHttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from .models import ChatMessage

api = NinjaAPI()


class MessageSchema(Schema):
    content: str
    username: str = "Anonymous"
    client_timestamp: int | None = None


@api.get("/")
def index(request):
    return {"test": 1}


@api.post("/message")
def post_message(request, message: MessageSchema):
    chat_message = ChatMessage.objects.create(
        content=message.content,
        username=message.username,
        client_timestamp=message.client_timestamp
    )
    
    return {
        "id": chat_message.id,
        "content": chat_message.content,
        "username": chat_message.username,
        "timestamp": chat_message.timestamp.isoformat(),
        "client_timestamp": chat_message.client_timestamp,
        "server_timestamp": int(timezone.now().timestamp() * 1000)
    }


@api.get("/messages")
def get_messages(request):
    messages = ChatMessage.objects.all()[:50]
    return [
        {
            "id": msg.id,
            "content": msg.content,
            "username": msg.username,
            "timestamp": msg.timestamp.isoformat(),
            "client_timestamp": msg.client_timestamp
        }
        for msg in messages
    ]


async def sse_stream():
    import asyncio
    from channels.db import database_sync_to_async
    
    @database_sync_to_async
    def get_new_messages(last_id):
        return list(ChatMessage.objects.filter(id__gt=last_id).order_by('id'))
    
    last_message_id = 0
    while True:
        messages = await get_new_messages(last_message_id)
        for message in messages:
            data = {
                "id": message.id,
                "content": message.content,
                "username": message.username,
                "timestamp": message.timestamp.isoformat(),
                "client_timestamp": message.client_timestamp,
                "server_timestamp": int(timezone.now().timestamp() * 1000)
            }
            yield f"data: {json.dumps(data)}\n\n".encode('utf-8')
            last_message_id = message.id
        
        await asyncio.sleep(1)


@csrf_exempt
async def sse_endpoint(request):
    response = StreamingHttpResponse(
        sse_stream(),
        content_type='text/event-stream'
    )
    response['Cache-Control'] = 'no-cache'
    response['Access-Control-Allow-Origin'] = 'http://localhost:3000'
    response['Access-Control-Allow-Headers'] = 'Cache-Control'
    response['Access-Control-Allow-Credentials'] = 'true'
    return response
