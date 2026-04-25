import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  buildForbiddenReason,
  isPermissionDeniedError,
} from '@/auth/permissionPolicy';
import ChatService from '../services/ChatService';
import type { Chat, Message } from '../services/ChatService';

type ReconnectStatus = 'live' | 'reconnecting' | 'offline' | 'recovering';

interface UseChatReturn {
  chats: Chat[];
  currentChat: Chat | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
  reconnectStatus: ReconnectStatus;
  canRead: boolean;
  canReply: boolean;
  replyForbiddenReason: string | null;
  isTyping: boolean;
  otherUserTyping: boolean;
  createChat: (
    customerId: string,
    staffId?: string,
    bookingId?: string
  ) => Promise<void>;
  selectChat: (chatId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  refreshChats: () => Promise<void>;
  retryCurrentThread: () => Promise<void>;
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
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [reconnectStatus, setReconnectStatus] =
    useState<ReconnectStatus>('live');
  const [readForbiddenReason, setReadForbiddenReason] = useState<string | null>(
    null
  );
  const [replyForbiddenReason, setReplyForbiddenReason] = useState<
    string | null
  >(null);

  const currentChatIdRef = useRef<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const hasConnectedOnceRef = useRef(false);

  const setReadForbiddenFromError = useCallback(
    (err: unknown, fallback: string): boolean => {
      if (!isPermissionDeniedError(err)) {
        return false;
      }

      setReadForbiddenReason(buildForbiddenReason(err, fallback));
      setError(null);
      return true;
    },
    []
  );

  const setReplyForbiddenFromError = useCallback(
    (err: unknown, fallback: string): boolean => {
      if (!isPermissionDeniedError(err)) {
        return false;
      }

      setReplyForbiddenReason(buildForbiddenReason(err, fallback));
      setError(null);
      return true;
    },
    []
  );

  const clearUnreadForChat = useCallback((chatId: string) => {
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
      )
    );
  }, []);

  const promoteChat = useCallback(
    (
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
    },
    []
  );

  const refreshChatsInternal = useCallback(async (): Promise<Chat[]> => {
    const data = await ChatService.getChatsByStaff();
    setChats(data);
    setReadForbiddenReason(null);
    return data;
  }, []);

  const retryCurrentThread = useCallback(async () => {
    const activeChatId = currentChatIdRef.current;

    if (!activeChatId) {
      return;
    }

    const latestMessages = await ChatService.getMessages(activeChatId);
    setMessages(latestMessages);
    clearUnreadForChat(activeChatId);
    await ChatService.markMessagesAsRead(activeChatId);

    if (socketRef.current) {
      socketRef.current.emit('join_chat', { chatId: activeChatId });
    }
  }, [clearUnreadForChat]);

  const refreshChats = useCallback(async () => {
    try {
      await refreshChatsInternal();
    } catch (err) {
      if (!setReadForbiddenFromError(err, 'Required permission: chat.read')) {
        throw err;
      }
    }
  }, [refreshChatsInternal, setReadForbiddenFromError]);

  const updateChatsWithMessage = useCallback(
    (incomingMessage: Message) => {
      promoteChat(incomingMessage.chatId, {
        lastMessageAt: incomingMessage.createdAt,
        lastMessage: incomingMessage.content,
      });
    },
    [promoteChat]
  );

  useEffect(() => {
    currentChatIdRef.current = currentChat?.id || null;
  }, [currentChat?.id]);

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
        userId,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketRef.current = newSocket;

    const healAfterReconnect = async () => {
      setReconnectStatus('recovering');

      try {
        await refreshChatsInternal();
        await retryCurrentThread();
        setError(null);
      } catch (err) {
        if (!setReadForbiddenFromError(err, 'Required permission: chat.read')) {
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to recover conversation state'
          );
        }
      } finally {
        setReconnectStatus('live');
      }
    };

    const handleConnect = () => {
      const activeChatId = currentChatIdRef.current;
      if (activeChatId) {
        newSocket.emit('join_chat', { chatId: activeChatId });
      }

      if (hasConnectedOnceRef.current) {
        healAfterReconnect();
      } else {
        hasConnectedOnceRef.current = true;
        setReconnectStatus('live');
      }
    };

    const handleDisconnect = () => {
      setReconnectStatus('offline');
    };

    const handleReconnectAttempt = () => {
      setReconnectStatus('reconnecting');
    };

    const handleMessageReceived = (data: Message) => {
      updateChatsWithMessage(data);

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

    newSocket.on('connect', handleConnect);
    newSocket.on('disconnect', handleDisconnect);
    newSocket.io.on('reconnect_attempt', handleReconnectAttempt);

    newSocket.on('message_received', handleMessageReceived);

    newSocket.on(
      'user_typing',
      (data: { userId: string; isTyping: boolean }) => {
        if (data.userId !== userId) {
          setOtherUserTyping(data.isTyping);
        }
      }
    );

    newSocket.on('messages_marked_read', (data: { chatId: string }) => {
      clearUnreadForChat(data.chatId);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.chatId === data.chatId && msg.senderId === userId
            ? { ...msg, isRead: true }
            : msg
        )
      );
    });

    newSocket.on(
      'new_message_notification',
      async (data: { chatId: string }) => {
        if (data?.chatId) {
          promoteChat(data.chatId, {
            lastMessageAt: new Date().toISOString(),
            lastMessage: 'New message',
          });
        }

        try {
          await refreshChatsInternal();
        } catch (refreshError) {
          if (
            !setReadForbiddenFromError(
              refreshError,
              'Required permission: chat.read'
            )
          ) {
            setError(
              refreshError instanceof Error
                ? refreshError.message
                : 'Failed to refresh chats'
            );
          }
        }
      }
    );

    newSocket.on('error', (socketError: { message: string }) => {
      if (socketError.message !== 'User not authenticated') {
        setError(socketError.message);
      }
    });

    newSocket.on('connect_error', () => {
      setReconnectStatus('offline');
    });

    return () => {
      newSocket.off('connect', handleConnect);
      newSocket.off('disconnect', handleDisconnect);
      newSocket.io.off('reconnect_attempt', handleReconnectAttempt);
      newSocket.off('message_received', handleMessageReceived);
      newSocket.off('user_typing');
      newSocket.off('messages_marked_read');
      newSocket.off('new_message_notification');
      newSocket.off('error');
      newSocket.off('connect_error');
      newSocket.close();

      if (socketRef.current === newSocket) {
        socketRef.current = null;
      }
    };
  }, [
    clearUnreadForChat,
    promoteChat,
    refreshChatsInternal,
    retryCurrentThread,
    setReadForbiddenFromError,
    updateChatsWithMessage,
    userId,
  ]);

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
      if (socketRef.current) {
        socketRef.current.emit('join_chat', { chatId: newChat.id });
      }
      setError(null);
      setReadForbiddenReason(null);
    } catch (err) {
      if (!setReadForbiddenFromError(err, 'Required permission: chat.read')) {
        setError(err instanceof Error ? err.message : 'Failed to create chat');
      }
    } finally {
      setLoading(false);
    }
  };

  const selectChat = useCallback(
    async (chatId: string) => {
      try {
        setLoading(true);
        const chat = await ChatService.getChat(chatId);

        const chatMessages = await ChatService.getMessages(chatId);
        setCurrentChat(chat);
        setMessages(chatMessages);

        if (socketRef.current) {
          socketRef.current.emit('join_chat', { chatId });
        }

        clearUnreadForChat(chatId);
        await ChatService.markMessagesAsRead(chatId);

        setReadForbiddenReason(null);
        setError(null);
      } catch (err) {
        if (!setReadForbiddenFromError(err, 'Required permission: chat.read')) {
          setError(err instanceof Error ? err.message : 'Failed to load chat');
        }
      } finally {
        setLoading(false);
      }
    },
    [clearUnreadForChat, setReadForbiddenFromError]
  );

  useEffect(() => {
    if (!userId) {
      return;
    }

    const loadChats = async () => {
      try {
        setLoading(true);
        const data = await refreshChatsInternal();
        if (data.length > 0) {
          await selectChat(data[0].id);
        }
        setError(null);
      } catch (err) {
        if (!setReadForbiddenFromError(err, 'Required permission: chat.read')) {
          setError(err instanceof Error ? err.message : 'Failed to load chats');
        }
      } finally {
        setLoading(false);
      }
    };

    loadChats();
  }, [refreshChatsInternal, selectChat, setReadForbiddenFromError, userId]);

  const sendMessage = async (content: string) => {
    if (!currentChat) {
      return;
    }

    try {
      const sentMessage = await ChatService.sendMessage(
        currentChat.id,
        content
      );
      setReplyForbiddenReason(null);
      setIsTyping(false);

      setMessages((prev) => {
        const messageExists = prev.some((msg) => msg.id === sentMessage.id);
        if (messageExists) {
          return prev;
        }
        return [...prev, sentMessage];
      });
      updateChatsWithMessage(sentMessage);
      setError(null);
    } catch (err) {
      if (!setReplyForbiddenFromError(err, 'Required permission: chat.reply')) {
        setError(err instanceof Error ? err.message : 'Failed to send message');
      }
    }
  };

  const markAsRead = async () => {
    if (!currentChat) {
      return;
    }

    try {
      await ChatService.markMessagesAsRead(currentChat.id);
      clearUnreadForChat(currentChat.id);
      setReadForbiddenReason(null);
    } catch (err) {
      if (!setReadForbiddenFromError(err, 'Required permission: chat.read')) {
        setError(err instanceof Error ? err.message : 'Failed to mark as read');
      }
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
    reconnectStatus,
    canRead: !readForbiddenReason,
    canReply: !replyForbiddenReason,
    replyForbiddenReason: readForbiddenReason ?? replyForbiddenReason,
    isTyping,
    otherUserTyping,
    createChat,
    selectChat,
    sendMessage,
    refreshChats,
    retryCurrentThread,
    markAsRead,
    archiveChat,
    deleteChat,
  };
};
