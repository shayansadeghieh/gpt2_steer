import React, { useState, useEffect, useRef } from 'react';
import './Chat.css';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [botMessageInProgress, setBotMessageInProgress] = useState<Message | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Function to create WebSocket connection
  const createWebSocketConnection = () => {
    console.log("Connecting to websocket...");
    const websocketUrl = 'ws://127.0.0.1:8080/chat';
    const ws = new WebSocket(websocketUrl);

    ws.onopen = () => {
      console.log('WebSocket connection established.', ws.readyState);
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      console.log('Received message:', event.data);
      const data = event.data;
      setBotMessageInProgress((prevMessage) => {
        const newMessage = prevMessage 
          ? { ...prevMessage, text: prevMessage.text + data }
          : {
              id: Date.now(),
              text: data,
              sender: 'bot',
            };
        console.log('Updated bot message:', newMessage);
        return newMessage;
      });
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed.');
      setIsConnected(false);
      // Attempt to reconnect after a delay
      setTimeout(() => {
        if (socketRef.current?.readyState === WebSocket.CLOSED) {
          createWebSocketConnection();
        }
      }, 3000);
    };

    socketRef.current = ws;
  };

  // Initial connection
  useEffect(() => {
    createWebSocketConnection();

    // Ping to keep connection alive
    const pingInterval = setInterval(() => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        console.log('Sending ping...');
        socketRef.current.send('ping');
      }
    }, 30000); // Send ping every 30 seconds

    return () => {
      clearInterval(pingInterval);
      if (socketRef.current) {
        socketRef.current.close();
        console.log('WebSocket connection cleaned up.');
      }
    };
  }, []);

  useEffect(() => {
    if (botMessageInProgress) {
      const timeoutId = setTimeout(() => {
        setMessages((prevMessages) => [...prevMessages, botMessageInProgress]);
        setBotMessageInProgress(null);
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [botMessageInProgress]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);

    // Check connection status and reconnect if necessary
    if (!isConnected || socketRef.current?.readyState !== WebSocket.OPEN) {
      console.log('Connection not ready. Current state:', socketRef.current?.readyState);
      console.log('Attempting to reconnect...');
      createWebSocketConnection();
      
      const maxAttempts = 5;
      let attempts = 0;
      
      const tryToSendMessage = () => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
          console.log('Connection restored, sending message...');
          socketRef.current.send(inputText);
        } else {
          attempts++;
          if (attempts < maxAttempts) {
            console.log(`Attempt ${attempts} failed, trying again in 1 second...`);
            setTimeout(tryToSendMessage, 1000);
          } else {
            console.error('Failed to establish connection after multiple attempts');
          }
        }
      };
      
      setTimeout(tryToSendMessage, 1000);
    } else {
      console.log('Sending message on existing connection...');
      socketRef.current.send(inputText);
    }

    setInputText('');
  };

  return (
    <div className="chat-container">
      <div className="messages-container">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.sender}`}>
            {message.text}
          </div>
        ))}
        {botMessageInProgress && (
          <div className="message bot">
            {botMessageInProgress.text}
          </div>
        )}
      </div>
      <form onSubmit={handleSendMessage} className="input-form">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a message..."
          className="message-input"
        />
        <button type="submit" className="send-button">
          Send
        </button>
      </form>
    </div>
  );
}

export default Chat;