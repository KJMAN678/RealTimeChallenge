import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = 'chat_room'
        
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_type = text_data_json.get('type', 'message')
        
        if message_type == 'message':
            content = text_data_json['content']
            username = text_data_json.get('username', 'Anonymous')
            client_timestamp = text_data_json.get('client_timestamp')
            
            chat_message = await self.save_message(content, username, client_timestamp)
            
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'content': content,
                    'username': username,
                    'timestamp': chat_message.timestamp.isoformat(),
                    'client_timestamp': client_timestamp,
                    'server_timestamp': int(timezone.now().timestamp() * 1000)
                }
            )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'message',
            'content': event['content'],
            'username': event['username'],
            'timestamp': event['timestamp'],
            'client_timestamp': event['client_timestamp'],
            'server_timestamp': event['server_timestamp']
        }))

    @database_sync_to_async
    def save_message(self, content, username, client_timestamp):
        from .models import ChatMessage
        return ChatMessage.objects.create(
            content=content,
            username=username,
            client_timestamp=client_timestamp
        )
