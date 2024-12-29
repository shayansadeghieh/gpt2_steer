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
  const [botMessageInProgress, setBotMessageInProgress] = useState<Message | null>(null); // State for in-progress bot message

  const socketRef = useRef<WebSocket | null>(null); // Ref for WebSocket connection

  useEffect(() => {
    const websocketUrl = 'ws://127.0.0.1:8080/chat'; // Replace with your WebSocket backend URL
    socketRef.current = new WebSocket(websocketUrl);

    socketRef.current.onopen = () => {
      console.log('WebSocket connection established.');
    };

    socketRef.current.onmessage = (event) => {
      const data = event.data;

      setBotMessageInProgress((prevMessage) => {
        if (prevMessage) {
          // Update the current bot message
          return { ...prevMessage, text: prevMessage.text + data };
        } else {
          // Create a new bot message if none exists
          const newBotMessage: Message = {
            id: Date.now(),
            text: data,
            sender: 'bot',
          };
          return newBotMessage;
        }
      });
    };

    socketRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    socketRef.current.onclose = () => {
      console.log('WebSocket connection closed.');
    };

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        console.log('WebSocket connection cleaned up.');
      }
    };
  }, []);

  useEffect(() => {
    // Add the bot message to the messages array when it is finalized
    if (botMessageInProgress) {
      const timeoutId = setTimeout(() => {
        setMessages((prevMessages) => [...prevMessages, botMessageInProgress]);
        setBotMessageInProgress(null); // Clear the in-progress message
      }, 500); // Optional delay to simulate typing effect

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

    setMessages([...messages, newMessage]);

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(inputText);
    } else {
      console.error('WebSocket is not open.');
    }

    setInputText('');
  };

  return (
    <div className="chat-container">
      <div className="messages-container">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.sender}`}
          >
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
