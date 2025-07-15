'use client'

import { useState } from 'react';
import WebSocketChat from './components/WebSocketChat';
import SSEChat from './components/SSEChat';
import styles from './page.module.css';

export default function Page() {
  const [activeTab, setActiveTab] = useState<'websocket' | 'sse' | 'comparison'>('comparison');

  return (
    <div className={styles.page}>
      <div className={styles.main}>
        <h1>WebSocket vs SSE Chat Comparison</h1>
        
        <div className={styles.tabs}>
          <button 
            className={activeTab === 'websocket' ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab('websocket')}
          >
            WebSocket Only
          </button>
          <button 
            className={activeTab === 'sse' ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab('sse')}
          >
            SSE Only
          </button>
          <button 
            className={activeTab === 'comparison' ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab('comparison')}
          >
            Side by Side Comparison
          </button>
        </div>

        {activeTab === 'websocket' && (
          <div className={styles.singleChat}>
            <WebSocketChat />
          </div>
        )}

        {activeTab === 'sse' && (
          <div className={styles.singleChat}>
            <SSEChat />
          </div>
        )}

        {activeTab === 'comparison' && (
          <div className={styles.comparison}>
            <div className={styles.chatContainer}>
              <h2>WebSocket Chat</h2>
              <p className={styles.description}>
                Bidirectional real-time communication. Both sending and receiving via WebSocket.
              </p>
              <WebSocketChat />
            </div>
            
            <div className={styles.chatContainer}>
              <h2>SSE Chat</h2>
              <p className={styles.description}>
                HTTP POST for sending messages, Server-Sent Events for receiving.
              </p>
              <SSEChat />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
