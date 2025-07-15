
from django.db import models
from django.utils import timezone


class ChatMessage(models.Model):
    content = models.TextField()
    username = models.CharField(max_length=100, default="Anonymous")
    timestamp = models.DateTimeField(default=timezone.now)
    client_timestamp = models.BigIntegerField(null=True, blank=True)
    
    class Meta:
        ordering = ['-timestamp']
        
    def __str__(self):
        return f"{self.username}: {self.content[:50]}"
