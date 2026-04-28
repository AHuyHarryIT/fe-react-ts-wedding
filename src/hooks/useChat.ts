import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  buildForbiddenReason,
  isPermissionDeniedError,
} from '@/auth/permissionPolicy';
import ChatService from '../services/ChatService';
import type { Chat, Message } from '../services/ChatService';

type IncomingStaffMessage = Message & {
  senderCustomerId?: string | null;
  senderStaffId?: string | null;
  clientMessageId?: string;
};

type ReconnectStatus = 'live' | 'reconnecting' | 'offline' | 'recovering';

interface UseChatReturn {
  chats: Chat[];
  currentChat: Chat | null;
  messages: Message[];
  loading: boolean;
  loadingOlderMessages: boolean;
  hasMoreMessages: boolean;
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
  loadOlderMessages: () => Promise<void>;
  markAsRead: () => Promise<void>;
  archiveChat: (chatId: string) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
}

type PendingSocketSend = {
  resolve: () => void;
  reject: (error: Error) => void;
  timeoutId: ReturnType<typeof setTimeout>;
};

const normalizeIncomingMessage = (message: IncomingStaffMessage): Message => ({
  ...message,
  senderId:
    message.senderId ||
    message.senderStaffId ||
    message.senderCustomerId ||
    undefined,
});

const createClientMessageId = (): string =>
  `staff-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const getChatActivityTime = (chat: Chat): number => {
  const lastMessageEpoch = chat.lastMessageAt
    ? new Date(chat.lastMessageAt).getTime()
    : 0;
  const createdEpoch = chat.createdAt ? new Date(chat.createdAt).getTime() : 0;
  return Math.max(lastMessageEpoch, createdEpoch);
};

const getLatestChat = (items: Chat[]): Chat | null => {
  if (items.length === 0) {
    return null;
  }

  return [...items].sort(
    (a, b) => getChatActivityTime(b) - getChatActivityTime(a)
  )[0];
};

const sortMessagesChronologically = (items: Message[]): Message[] =>
  [...items].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

const INITIAL_MESSAGES_TAKE = 20;
const OLDER_MESSAGES_TAKE = 10;

export const useChat = (userId: string): UseChatReturn => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingOlderMessages, setLoadingOlderMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
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
  const pendingSocketSendsRef = useRef<Map<string, PendingSocketSend>>(
    new Map()
  );
  const loadedMessageCountRef = useRef(0);

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

    const latestMessages = await ChatService.getMessages(
      activeChatId,
      0,
      INITIAL_MESSAGES_TAKE
    );
    const sortedMessages = sortMessagesChronologically(latestMessages);

    setLoadingOlderMessages(false);
    setMessages(sortedMessages);
    loadedMessageCountRef.current = latestMessages.length;
    setHasMoreMessages(latestMessages.length === INITIAL_MESSAGES_TAKE);

    clearUnreadForChat(activeChatId);
    await ChatService.markMessagesAsRead(activeChatId);

    if (socketRef.current?.connected) {
      socketRef.current.emit('join_staff_chat', { chatId: activeChatId });
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

    const newSocket = io(`${apiUrl}/staff-chat`, {
      withCredentials: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketRef.current = newSocket;

    const rejectPendingSend = (clientMessageId: string, reason: string) => {
      const pending = pendingSocketSendsRef.current.get(clientMessageId);
      if (!pending) {
        return;
      }

      clearTimeout(pending.timeoutId);
      pendingSocketSendsRef.current.delete(clientMessageId);
      pending.reject(new Error(reason));
    };

    const resolvePendingSend = (clientMessageId: string) => {
      const pending = pendingSocketSendsRef.current.get(clientMessageId);
      if (!pending) {
        return;
      }

      clearTimeout(pending.timeoutId);
      pendingSocketSendsRef.current.delete(clientMessageId);
      pending.resolve();
    };

    const rejectAllPendingSends = (reason: string) => {
      pendingSocketSendsRef.current.forEach((pending, clientMessageId) => {
        clearTimeout(pending.timeoutId);
        pending.reject(new Error(reason));
        pendingSocketSendsRef.current.delete(clientMessageId);
      });
    };

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
        newSocket.emit('join_staff_chat', { chatId: activeChatId });
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
      rejectAllPendingSends('Connection lost before message delivery');
    };

    const handleReconnectAttempt = () => {
      setReconnectStatus('reconnecting');
    };

    const handleMessageReceived = (data: IncomingStaffMessage) => {
      const normalized = normalizeIncomingMessage(data);

      if (data.clientMessageId) {
        resolvePendingSend(data.clientMessageId);
      }

      updateChatsWithMessage(normalized);

      if (normalized.chatId !== currentChatIdRef.current) {
        return;
      }

      setMessages((prev) => {
        const messageExists = prev.some((msg) => msg.id === normalized.id);
        if (messageExists) {
          return prev;
        }

        loadedMessageCountRef.current += 1;
        return [...prev, normalized];
      });
    };

    const handleStaffError = (socketError: {
      message?: string;
      details?: { clientMessageId?: string };
      clientMessageId?: string;
    }) => {
      const rawMessage =
        typeof socketError?.message === 'string' && socketError.message.trim()
          ? socketError.message
          : 'Socket request failed';

      const clientMessageId =
        socketError?.clientMessageId || socketError?.details?.clientMessageId;

      if (clientMessageId) {
        rejectPendingSend(clientMessageId, rawMessage);
      } else {
        rejectAllPendingSends(rawMessage);
      }

      setError(rawMessage);
      setReplyForbiddenReason(rawMessage);
    };

    const handleConnectError = (socketError: { message?: string }) => {
      setReconnectStatus('offline');
      if (socketError?.message) {
        setError(socketError.message);
      }
    };

    const handleTyping = (data: { userId: string; isTyping: boolean }) => {
      if (data.userId !== userId) {
        setOtherUserTyping(data.isTyping);
      }
    };

    const handleMessagesMarkedRead = (data: {
      chatId: string;
      userId: string;
    }) => {
      clearUnreadForChat(data.chatId);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.chatId === data.chatId && msg.senderId === userId
            ? { ...msg, isRead: true }
            : msg
        )
      );
    };

    const handleNewMessageNotification = async (data: { chatId: string }) => {
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
    };

    newSocket.on('connect', handleConnect);
    newSocket.on('disconnect', handleDisconnect);
    newSocket.io.on('reconnect_attempt', handleReconnectAttempt);

    newSocket.on('staff_message_received', handleMessageReceived);
    newSocket.on('staff_user_typing', handleTyping);
    newSocket.on('staff_messages_marked_read', handleMessagesMarkedRead);
    newSocket.on(
      'staff_new_message_notification',
      handleNewMessageNotification
    );
    newSocket.on('staff_error', handleStaffError);
    newSocket.on('connect_error', handleConnectError);

    return () => {
      rejectAllPendingSends('Chat connection closed');

      newSocket.off('connect', handleConnect);
      newSocket.off('disconnect', handleDisconnect);
      newSocket.io.off('reconnect_attempt', handleReconnectAttempt);
      newSocket.off('staff_message_received', handleMessageReceived);
      newSocket.off('staff_user_typing', handleTyping);
      newSocket.off('staff_messages_marked_read', handleMessagesMarkedRead);
      newSocket.off(
        'staff_new_message_notification',
        handleNewMessageNotification
      );
      newSocket.off('staff_error', handleStaffError);
      newSocket.off('connect_error', handleConnectError);
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
      if (socketRef.current?.connected) {
        socketRef.current.emit('join_staff_chat', { chatId: newChat.id });
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

        const chatMessages = await ChatService.getMessages(
          chatId,
          0,
          INITIAL_MESSAGES_TAKE
        );
        const sortedMessages = sortMessagesChronologically(chatMessages);

        setCurrentChat(chat);
        setLoadingOlderMessages(false);
        setMessages(sortedMessages);
        loadedMessageCountRef.current = chatMessages.length;
        setHasMoreMessages(chatMessages.length === INITIAL_MESSAGES_TAKE);

        if (socketRef.current?.connected) {
          socketRef.current.emit('join_staff_chat', { chatId });
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
        const latestChat = getLatestChat(data);
        if (latestChat) {
          await selectChat(latestChat.id);
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

  const loadOlderMessages = useCallback(async () => {
    const activeChatId = currentChatIdRef.current;

    if (!activeChatId || loadingOlderMessages || !hasMoreMessages) {
      return;
    }

    try {
      setLoadingOlderMessages(true);

      const olderMessages = await ChatService.getMessages(
        activeChatId,
        loadedMessageCountRef.current,
        OLDER_MESSAGES_TAKE
      );

      if (olderMessages.length === 0) {
        setHasMoreMessages(false);
        return;
      }

      const sortedOlder = sortMessagesChronologically(olderMessages);

      setMessages((prev) => {
        const seen = new Set(prev.map((message) => message.id));
        const dedupedOlder = sortedOlder.filter(
          (message) => !seen.has(message.id)
        );
        return [...dedupedOlder, ...prev];
      });

      loadedMessageCountRef.current += olderMessages.length;
      setHasMoreMessages(olderMessages.length === OLDER_MESSAGES_TAKE);
      setError(null);
    } catch (err) {
      if (!setReadForbiddenFromError(err, 'Required permission: chat.read')) {
        setError(
          err instanceof Error ? err.message : 'Failed to load older messages'
        );
      }
    } finally {
      setLoadingOlderMessages(false);
    }
  }, [hasMoreMessages, loadingOlderMessages, setReadForbiddenFromError]);

  const sendMessage = async (content: string) => {
    if (!currentChat) {
      return;
    }

    const socket = socketRef.current;
    const trimmedContent = content.trim();

    if (!trimmedContent) {
      return;
    }

    if (!socket || !socket.connected) {
      const connectionError = new Error('Chat connection is offline');
      setError(connectionError.message);
      throw connectionError;
    }

    const clientMessageId = createClientMessageId();

    await new Promise<void>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        pendingSocketSendsRef.current.delete(clientMessageId);
        reject(new Error('Message delivery timed out'));
      }, 10000);

      pendingSocketSendsRef.current.set(clientMessageId, {
        resolve,
        reject,
        timeoutId,
      });

      socket.emit('send_staff_message', {
        chatId: currentChat.id,
        content: trimmedContent,
        clientMessageId,
      });
    });

    setReplyForbiddenReason(null);
    setIsTyping(false);
    setError(null);
  };

  const markAsRead = async () => {
    if (!currentChat) {
      return;
    }

    try {
      await ChatService.markMessagesAsRead(currentChat.id);
      clearUnreadForChat(currentChat.id);
      setReadForbiddenReason(null);

      if (socketRef.current?.connected) {
        socketRef.current.emit('staff_mark_as_read', {
          chatId: currentChat.id,
        });
      }
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
    loadingOlderMessages,
    hasMoreMessages,
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
    loadOlderMessages,
    markAsRead,
    archiveChat,
    deleteChat,
  };
};
