import { useEffect, useRef, useState } from 'react';
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
  const currentChatIdRef = useRef<string | null>(null);

  const promoteChat = (
    chatId: string,
    updates: { lastMessageAt?: Date | string; lastMessage?: string }
  ) => {
    setChats((prevChats) => {
      const targetIndex = prevChats.findIndex((chat) => chat.id === chatId);
      if (targetIndex === -1) {
        return prevChats;
      }

      const targetChat = prevChats[targetIndex];
      const updatedChat: Chat = {
        ...targetChat,
        lastMessageAt: updates.lastMessageAt
          ? new Date(updates.lastMessageAt)
          : targetChat.lastMessageAt,
      };

      if (updates.lastMessage) {
        (updatedChat as Chat & { lastMessage?: string }).lastMessage =
          updates.lastMessage;
      }

      const remainingChats = prevChats.filter((chat) => chat.id !== chatId);
      return [updatedChat, ...remainingChats];
    });
  };

  const refreshChats = async () => {
    const data = await ChatService.getChatsByStaff();
    setChats(data);
  };

  const updateChatsWithMessage = (incomingMessage: Message) => {
    promoteChat(incomingMessage.chatId, {
      lastMessageAt: incomingMessage.createdAt,
      lastMessage: incomingMessage.content,
    });
  };

  useEffect(() => {
    currentChatIdRef.current = currentChat?.id || null;
  }, [currentChat?.id]);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!userId) {
      return;
    }

    const apiUrl =
      typeof window !== 'undefined' && window.location.hostname === '127.0.0.1'
        ? 'http://127.0.0.1:3000'
        : import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
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

    // Listen for incoming messages with deduplication
    const handleMessageReceived = (data: Message) => {
      updateChatsWithMessage(data);

      // Only append message in the currently opened chat thread.
      if (data.chatId !== currentChatIdRef.current) {
        return;
      }

      setMessages((prev) => {
        const messageExists = prev.some((msg) => msg.id === data.id);
        if (messageExists) {
          return prev;
        }
        return [...prev, data];
      });
    };

    newSocket.on('message_received', handleMessageReceived);

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
    newSocket.on('new_message_notification', async (data) => {
      console.log('New message notification:', data);

      // Optimistically refresh sidebar row instantly before API roundtrip.
      if (data?.chatId) {
        promoteChat(data.chatId, {
          lastMessageAt: new Date().toISOString(),
          lastMessage: 'New message',
        });
      }

      try {
        await refreshChats();
      } catch (refreshError) {
        console.error(
          'Failed to refresh chats after notification:',
          refreshError
        );
      }
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
      newSocket.off('message_received', handleMessageReceived);
      newSocket.off('user_typing');
      newSocket.off('messages_marked_read');
      newSocket.off('new_message_notification');
      newSocket.off('error');
      newSocket.close();
    };
  }, [userId]);

  // Load chats on mount
  useEffect(() => {
    if (!userId) {
      return;
    }

    const loadChats = async () => {
      try {
        setLoading(true);
        const data = await ChatService.getChatsByStaff();
        setChats(data);
        // Auto-select the first chat
        if (data.length > 0) {
          await selectChat(data[0].id);
        }
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load chats');
      } finally {
        setLoading(false);
      }
    };

    loadChats();
  }, [userId]);

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

      // First, load messages from REST API before joining the chat room
      // This prevents messages from being added twice when we join
      const chatMessages = await ChatService.getMessages(chatId);
      setCurrentChat(chat);
      setMessages(chatMessages);

      // Now join the chat room to listen for NEW messages only
      // The REST API already provided us with historical messages
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
      // Send via REST API - the backend will emit Socket.IO event to all clients
      const sentMessage = await ChatService.sendMessage(
        currentChat.id,
        content
      );
      setIsTyping(false);

      // Fallback in case socket event is delayed or dropped.
      setMessages((prev) => {
        const messageExists = prev.some((msg) => msg.id === sentMessage.id);
        if (messageExists) {
          return prev;
        }
        return [...prev, sentMessage];
      });
      updateChatsWithMessage(sentMessage);
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
