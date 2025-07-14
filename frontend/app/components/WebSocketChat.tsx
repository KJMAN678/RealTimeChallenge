'use client'

import { useState, useEffect, useRef } from 'react';
import { formatDate } from './utils';
import styles from './Chat.module.css';

interface Message {
  content: string;
  username: string;
  timestamp: string;
  client_timestamp?: number;
  server_timestamp?: number;
}

export default function WebSocketChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [username, setUsername] = useState('User');
  const [isConnected, setIsConnected] = useState(false);
  const [lastDelay, setLastDelay] = useState<number | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const connectWebSocket = () => {
      const ws = new WebSocket('ws://localhost:8000/ws/chat/');
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        console.log('WebSocket connected');
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'message') {
          const message: Message = {
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
          
          setMessages(prev => [...prev, message]);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        console.log('WebSocket disconnected');
        setTimeout(connectWebSocket, 3000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const sendMessage = () => {
    if (inputMessage.trim() && wsRef.current && isConnected) {
      const clientTimestamp = performance.now() + Date.now() - performance.timeOrigin;
      
      wsRef.current.send(JSON.stringify({
        type: 'message',
        content: inputMessage.trim(),
        username: username,
        client_timestamp: Math.round(clientTimestamp)
      }));
      
      setInputMessage('');
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
        {messages.map((message, index) => (
          <div key={index} className={styles.message}>
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
          disabled={!isConnected}
          className={styles.messageInput}
        />
        <button 
          onClick={sendMessage} 
          disabled={!isConnected || !inputMessage.trim()}
          className={styles.sendButton}
        >
          Send
        </button>
      </div>
    </div>
  );
}
