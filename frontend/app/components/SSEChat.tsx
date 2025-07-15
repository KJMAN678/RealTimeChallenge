'use client'

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { formatDate } from './utils';
import styles from './Chat.module.css';

interface Message {
  id: number;
  content: string;
  username: string;
  timestamp: string;
  client_timestamp?: number;
  server_timestamp?: number;
}

export default function SSEChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [username, setUsername] = useState('User');
  const [isConnected, setIsConnected] = useState(false);
  const [lastDelay, setLastDelay] = useState<number | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const connectSSE = () => {
      const eventSource = new EventSource(`${process.env.NEXT_PUBLIC_API_URL}/api/sse/`);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setIsConnected(true);
        console.log('SSE connected');
      };

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'connected' || !data.id) {
          return;
        }
        
        const message: Message = {
          id: data.id,
          content: data.content,
          username: data.username,
          timestamp: data.timestamp,
          client_timestamp: data.client_timestamp,
          server_timestamp: data.server_timestamp
        };
        
        if (data.client_timestamp && data.server_timestamp) {
          const delay = data.server_timestamp - data.client_timestamp;
          setLastDelay(delay);
        }
        
        setMessages(prev => {
          const exists = prev.find(msg => msg.id === message.id);
          if (!exists) {
            return [...prev, message];
          }
          return prev;
        });
      };

      eventSource.onerror = () => {
        setIsConnected(false);
        console.log('SSE disconnected');
        eventSource.close();
        setTimeout(connectSSE, 3000);
      };
    };

    connectSSE();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const sendMessage = async () => {
    if (inputMessage.trim()) {
      const clientTimestamp = performance.now() + Date.now() - performance.timeOrigin;
      
      try {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/message`, {
          content: inputMessage.trim(),
          username: username,
          client_timestamp: Math.round(clientTimestamp)
        });
        
        setInputMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.header}>
        <div className={styles.connectionStatus}>
          <span className={`${styles.statusDot} ${isConnected ? styles.connected : styles.disconnected}`}></span>
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
        {lastDelay !== null && (
          <div className={styles.delay}>
            Echo delay: {lastDelay}ms
          </div>
        )}
      </div>

      <div className={styles.userInput}>
        <input
          type="text"
          placeholder="Your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={styles.usernameInput}
        />
      </div>

      <div className={styles.messagesContainer}>
        {messages.map((message) => (
          <div key={message.id} className={styles.message}>
            <div className={styles.messageHeader}>
              <span className={styles.username}>{message.username}</span>
              <span className={styles.timestamp}>
                {formatDate(message.timestamp)}
              </span>
            </div>
            <div className={styles.messageContent}>{message.content}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.inputContainer}>
        <input
          type="text"
          placeholder="Type your message..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          className={styles.messageInput}
        />
        <button 
          onClick={sendMessage} 
          disabled={!inputMessage.trim()}
          className={styles.sendButton}
        >
          Send
        </button>
      </div>
    </div>
  );
}
