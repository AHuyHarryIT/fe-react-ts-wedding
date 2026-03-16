import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import ChatService from '../services/ChatService';
import type { Chat, Message } from '../services/ChatService';

interface UseChatReturn {
  chats: Chat[];
  currentChat: Chat | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
  isTyping: boolean;
  otherUserTyping: boolean;
  createChat: (
    customerId: string,
    staffId?: string,
    bookingId?: string
  ) => Promise<void>;
  selectChat: (chatId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  markAsRead: () => Promise<void>;
  archiveChat: (chatId: string) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
}

export const useChat = (userId: string): UseChatReturn => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);

  // Initialize WebSocket connection
  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    const newSocket = io(`${apiUrl}/chat`, {
      auth: {
        userId: userId,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    setSocket(newSocket);

    // Listen for incoming messages
    newSocket.on('message_received', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    // Listen for typing indicators
    newSocket.on('user_typing', (data) => {
      if (data.userId !== userId) {
        setOtherUserTyping(data.isTyping);
      }
    });

    // Listen for messages marked as read
    newSocket.on('messages_marked_read', (data) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.chatId === data.chatId && msg.senderId === userId
            ? { ...msg, isRead: true }
            : msg
        )
      );
    });

    // Listen for notifications
    newSocket.on('new_message_notification', (data) => {
      console.log('New message notification:', data);
    });

    // Listen for errors (but only connection errors, not message send errors)
    newSocket.on('error', (error) => {
      // Only show connection/authentication errors, not send_message errors
      // because REST API is primary, WebSocket is secondary
      if (error.message !== 'User not authenticated') {
        setError(error.message);
      }
    });

    return () => {
      newSocket.close();
    };
  }, [userId]);

  // Load chats on mount
  useEffect(() => {
    const loadChats = async () => {
      try {
        setLoading(true);
        const data = await ChatService.getChats();
        setChats(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load chats');
      } finally {
        setLoading(false);
      }
    };

    loadChats();
  }, []);

  const createChat = async (
    customerId: string,
    staffId?: string,
    bookingId?: string
  ) => {
    try {
      setLoading(true);
      const newChat = await ChatService.createChat(
        customerId,
        staffId,
        bookingId
      );
      setChats((prev) => [newChat, ...prev]);
      setCurrentChat(newChat);
      if (socket) {
        socket.emit('join_chat', { chatId: newChat.id });
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create chat');
    } finally {
      setLoading(false);
    }
  };

  const selectChat = async (chatId: string) => {
    try {
      setLoading(true);
      const chat = await ChatService.getChat(chatId);
      const chatMessages = await ChatService.getMessages(chatId);
      setCurrentChat(chat);
      setMessages(chatMessages);

      if (socket) {
        socket.emit('join_chat', { chatId });
      }

      // Mark messages as read
      await ChatService.markMessagesAsRead(chatId);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chat');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    if (!currentChat) return;

    try {
      // Send via REST API (more reliable)
      const newMessage = await ChatService.sendMessage(currentChat.id, content);
      setMessages((prev) => [...prev, newMessage]);
      setIsTyping(false);

      // Emit via WebSocket for real-time updates to other users
      if (socket) {
        socket.emit('send_message', {
          chatId: currentChat.id,
          content,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  };

  const markAsRead = async () => {
    if (!currentChat || !socket) return;

    try {
      socket.emit('mark_as_read', { chatId: currentChat.id });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark as read');
    }
  };

  const archiveChat = async (chatId: string) => {
    try {
      await ChatService.archiveChat(chatId);
      setChats((prev) => prev.filter((chat) => chat.id !== chatId));
      if (currentChat?.id === chatId) {
        setCurrentChat(null);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to archive chat');
    }
  };

  const deleteChat = async (chatId: string) => {
    try {
      await ChatService.deleteChat(chatId);
      setChats((prev) => prev.filter((chat) => chat.id !== chatId));
      if (currentChat?.id === chatId) {
        setCurrentChat(null);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete chat');
    }
  };

  return {
    chats,
    currentChat,
    messages,
    loading,
    error,
    isTyping,
    otherUserTyping,
    createChat,
    selectChat,
    sendMessage,
    markAsRead,
    archiveChat,
    deleteChat,
  };
};
