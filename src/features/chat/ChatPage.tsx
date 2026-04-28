import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Empty,
  Input,
  Layout,
  Spin,
  Tag,
  Typography,
} from 'antd';
import {
  PaperClipOutlined,
  PictureOutlined,
  SendOutlined,
  SmileOutlined,
} from '@ant-design/icons';
import { useChat } from '../../hooks/useChat';
import type { Chat, Message } from '../../services/ChatService';

interface ChatPageProps {
  customerId: string;
  staffId?: string;
}

type QueueFilter = 'all' | 'unread' | 'assigned' | 'booking-linked';

const { Sider, Content } = Layout;
const { Text } = Typography;

const FILTER_LABELS: Record<QueueFilter, string> = {
  all: 'All',
  unread: 'Unread',
  assigned: 'Assigned to me',
  'booking-linked': 'Booking-linked',
};

const RECONNECT_COPY = {
  live: 'Live updates on',
  reconnecting: 'Reconnecting… syncing latest messages',
  offline: 'Connection lost. Trying to reconnect…',
  recovering: 'Back online. Refreshing latest messages…',
} as const;

const WEBSOCKET_STATUS_COPY = {
  live: 'WebSocket live',
  reconnecting: 'WebSocket reconnecting',
  offline: 'WebSocket offline',
  recovering: 'WebSocket recovering',
} as const;

const WEBSOCKET_STATUS_CLASS = {
  live: 'text-green-600',
  reconnecting: 'text-amber-600',
  offline: 'text-red-600',
  recovering: 'text-blue-600',
} as const;

const formatDate = (date?: Date | string): string => {
  if (!date) {
    return 'No activity yet';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

const formatMessageTime = (date?: Date | string): string => {
  if (!date) {
    return '';
  }

  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

const getSenderLabel = (senderType: Message['senderType']): string => {
  if (senderType === 'AI') {
    return 'AI Assistant';
  }

  if (senderType === 'CUSTOMER') {
    return 'Customer';
  }

  return 'Staff';
};

const getCustomerName = (chat: Chat): string => {
  const first = chat.customer?.firstName?.trim() ?? '';
  const last = chat.customer?.lastName?.trim() ?? '';
  const fullName = `${first} ${last}`.trim();
  return fullName || 'Customer';
};

const getCustomerInitial = (chat: Chat): string =>
  getCustomerName(chat).charAt(0).toUpperCase();

const getUnreadCount = (chat: Chat): number =>
  typeof chat.unreadCount === 'number' && chat.unreadCount > 0
    ? chat.unreadCount
    : 0;

export function ChatPage({ customerId }: ChatPageProps) {
  const {
    chats,
    currentChat,
    messages,
    loading,
    error,
    reconnectStatus,
    canRead,
    canReply,
    replyForbiddenReason,
    selectChat,
    sendMessage,
    refreshChats,
    retryCurrentThread,
  } = useChat(customerId);

  const [messageContent, setMessageContent] = useState('');
  const [activeFilter, setActiveFilter] = useState<QueueFilter>('all');
  const [sendError, setSendError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (loading || !currentChat || !messagesContainerRef.current) {
      return;
    }

    const frameOne = requestAnimationFrame(() => {
      if (!messagesContainerRef.current) {
        return;
      }

      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;

      const frameTwo = requestAnimationFrame(() => {
        if (!messagesContainerRef.current) {
          return;
        }

        messagesContainerRef.current.scrollTop =
          messagesContainerRef.current.scrollHeight;
      });

      return () => cancelAnimationFrame(frameTwo);
    });

    return () => cancelAnimationFrame(frameOne);
  }, [loading, currentChat?.id, messages.length]);

  useEffect(() => {
    if (reconnectStatus !== 'recovering') {
      return;
    }

    refreshChats();
    retryCurrentThread();
  }, [reconnectStatus, refreshChats, retryCurrentThread]);

  const sortedChats = useMemo(
    () =>
      [...chats].sort((a, b) => {
        const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return bTime - aTime;
      }),
    [chats]
  );

  const filterCounts = useMemo(
    () => ({
      all: sortedChats.length,
      unread: sortedChats.filter((chat) => getUnreadCount(chat) > 0).length,
      assigned: sortedChats.filter((chat) => chat.staffId === customerId)
        .length,
      'booking-linked': sortedChats.filter((chat) => Boolean(chat.bookingId))
        .length,
    }),
    [customerId, sortedChats]
  );

  const filteredChats = useMemo(() => {
    if (activeFilter === 'all') {
      return sortedChats;
    }

    if (activeFilter === 'unread') {
      return sortedChats.filter((chat) => getUnreadCount(chat) > 0);
    }

    if (activeFilter === 'assigned') {
      return sortedChats.filter((chat) => chat.staffId === customerId);
    }

    return sortedChats.filter((chat) => Boolean(chat.bookingId));
  }, [activeFilter, customerId, sortedChats]);

  const queueEmptyCopy = useMemo(() => {
    if (activeFilter === 'all') {
      return {
        heading: 'No conversations yet',
        body: 'When customers send messages, conversations will appear here.',
      };
    }

    return {
      heading: `No ${FILTER_LABELS[activeFilter].toLowerCase()} conversations`,
      body: 'Try another filter to continue triage.',
    };
  }, [activeFilter]);

  const composeDisabledReason = useMemo(() => {
    if (!canRead) {
      return replyForbiddenReason || 'Required permission: chat.read';
    }

    if (!currentChat) {
      return 'Select a conversation first.';
    }

    if (!canReply) {
      return replyForbiddenReason || 'Required permission: chat.reply';
    }

    if (!messageContent.trim()) {
      return 'Enter a message to send.';
    }

    if (sending) {
      return 'Sending message…';
    }

    return null;
  }, [
    canRead,
    canReply,
    currentChat,
    messageContent,
    replyForbiddenReason,
    sending,
  ]);

  const sendDisabled = Boolean(composeDisabledReason);

  const submitCurrentMessage = async () => {
    if (sendDisabled || !currentChat) {
      return;
    }

    const outgoingMessage = messageContent.trim();
    setMessageContent('');

    try {
      setSending(true);
      setSendError(null);
      await sendMessage(outgoingMessage);
    } catch {
      setMessageContent(outgoingMessage);
      setSendError('Message not sent. Check your connection and try again.');
    } finally {
      setSending(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await submitCurrentMessage();
  };

  if (loading && chats.length === 0) {
    return (
      <div
        className="flex items-center justify-center h-full"
        data-testid="queue-loading"
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 md:px-6">
      <Layout className="h-[calc(100vh-200px)] min-h-[500px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <Sider
          width={340}
          className="h-full overflow-hidden border-r border-gray-200 bg-white"
          theme="light"
        >
          <div className="flex h-full min-h-0 flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between gap-2">
                <h2 className="m-0 text-lg font-semibold text-gray-900">
                  Conversation Queue
                </h2>
                <Text className={WEBSOCKET_STATUS_CLASS[reconnectStatus]}>
                  {WEBSOCKET_STATUS_COPY[reconnectStatus]}
                </Text>
              </div>
              <Text type="secondary">Latest activity first</Text>
            </div>

            <div className="border-b border-gray-100 p-3 flex flex-wrap gap-2">
              {(Object.keys(FILTER_LABELS) as QueueFilter[]).map((filter) => {
                const label = `${FILTER_LABELS[filter]} (${filterCounts[filter]})`;
                const active = activeFilter === filter;

                return (
                  <Button
                    key={filter}
                    type={active ? 'primary' : 'default'}
                    size="small"
                    onClick={() => setActiveFilter(filter)}
                  >
                    {label}
                  </Button>
                );
              })}
            </div>

            {error && (
              <div className="p-4">
                <Alert
                  type="error"
                  message="We couldn’t load or send messages right now. Retry this action. If the issue continues, refresh the page and try again."
                  action={
                    <Button size="small" onClick={() => refreshChats()}>
                      Retry
                    </Button>
                  }
                  showIcon
                />
              </div>
            )}

            <div className="min-h-0 flex-1 overflow-y-auto">
              {filteredChats.length === 0 ? (
                <div className="p-4" data-testid="queue-empty">
                  <Empty
                    description={
                      <div>
                        <p className="font-medium mb-1">
                          {queueEmptyCopy.heading}
                        </p>
                        <p className="m-0 text-gray-500">
                          {queueEmptyCopy.body}
                        </p>
                      </div>
                    }
                  />
                </div>
              ) : (
                filteredChats.map((chat) => {
                  const unreadCount = getUnreadCount(chat);
                  const isActive = currentChat?.id === chat.id;
                  const customerName = getCustomerName(chat);

                  return (
                    <Button
                      key={chat.id}
                      type="text"
                      aria-label={`Open conversation with ${customerName}`}
                      onClick={() => selectChat(chat.id)}
                      className={`!h-auto !w-full !rounded-none !border-b !border-gray-100 !px-4 !py-3 !text-left !justify-start transition-colors ${
                        isActive ? '!bg-blue-50' : 'hover:!bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="bg-blue-500" size={36}>
                          {getCustomerInitial(chat)}
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className="font-medium text-gray-900 truncate"
                              data-testid="chat-name"
                            >
                              {customerName}
                            </span>
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {formatDate(chat.lastMessageAt)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {chat.bookingId ? (
                              <Tag color="blue" className="m-0">
                                Booking {chat.bookingId}
                              </Tag>
                            ) : (
                              <Tag className="m-0">General Support</Tag>
                            )}
                            {unreadCount > 0 && (
                              <Badge
                                count={unreadCount > 99 ? '99+' : unreadCount}
                                className="site-badge-count-109"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </Button>
                  );
                })
              )}
            </div>
          </div>
        </Sider>

        <Content className="flex min-h-0 flex-col overflow-hidden bg-white">
          <div className="px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="m-0 text-lg font-semibold text-gray-900">
                  {currentChat
                    ? getCustomerName(currentChat)
                    : 'Select a conversation'}
                </h2>
                <Text type="secondary">
                  {currentChat?.bookingId
                    ? `Booking ${currentChat.bookingId}`
                    : currentChat
                      ? 'General Support'
                      : 'Choose a queue item to review messages'}
                </Text>
              </div>
              <Text
                className={
                  reconnectStatus === 'offline'
                    ? 'text-red-600'
                    : reconnectStatus === 'recovering'
                      ? 'text-blue-600'
                      : reconnectStatus === 'reconnecting'
                        ? 'text-amber-600'
                        : 'text-green-600'
                }
              >
                {RECONNECT_COPY[reconnectStatus]}
              </Text>
            </div>
          </div>

          {!canRead ? (
            <div className="p-6" data-testid="thread-permission-blocked">
              <Alert
                type="warning"
                message={
                  replyForbiddenReason || 'Required permission: chat.read'
                }
                showIcon
              />
            </div>
          ) : !currentChat ? (
            <div
              className="flex-1 flex items-center justify-center"
              data-testid="thread-empty-selection"
            >
              <Empty description="Select a conversation to start messaging" />
            </div>
          ) : loading ? (
            <div
              className="flex-1 flex items-center justify-center"
              data-testid="thread-loading"
            >
              <Spin />
            </div>
          ) : (
            <>
              <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto px-6 py-4"
                data-testid="thread-messages"
              >
                {messages.length === 0 ? (
                  <div
                    className="h-full flex items-center justify-center"
                    data-testid="thread-empty"
                  >
                    <Empty description="No messages yet" />
                  </div>
                ) : (
                  <>
                    <div className="space-y-6">
                      {messages.map((message: Message) => {
                        const senderType =
                          message.senderType ||
                          (message.senderId === currentChat.customerId
                            ? 'CUSTOMER'
                            : 'STAFF');
                        const isIncoming = senderType !== 'STAFF';

                        const senderChipClassName =
                          senderType === 'AI'
                            ? 'bg-slate-200 text-slate-700'
                            : senderType === 'CUSTOMER'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-blue-100 text-blue-700';

                        const bubbleClassName =
                          senderType === 'AI'
                            ? 'bg-slate-100 text-slate-800 border border-slate-200'
                            : senderType === 'CUSTOMER'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-blue-500 text-white';

                        return (
                          <div
                            key={message.id}
                            className={`flex ${isIncoming ? 'justify-start' : 'justify-end'}`}
                          >
                            <div className="max-w-[70%]">
                              <div
                                className={`mb-2 flex items-center gap-2 text-xs ${
                                  isIncoming ? 'justify-start' : 'justify-end'
                                }`}
                              >
                                <span
                                  className={`rounded-full px-2 py-1 text-xs font-semibold ${senderChipClassName}`}
                                >
                                  {getSenderLabel(senderType)}
                                </span>
                                <span className="text-gray-400">
                                  {formatMessageTime(message.createdAt)}
                                </span>
                              </div>

                              <div
                                className={`rounded-2xl px-4 py-3 ${bubbleClassName}`}
                              >
                                <p className="m-0 whitespace-pre-wrap break-words text-sm leading-relaxed">
                                  {message.content}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              <div className="border-t border-gray-200 p-4">
                {sendError && (
                  <Alert
                    type="error"
                    className="mb-2"
                    message={sendError}
                    action={
                      <Button size="small" onClick={() => setSendError(null)}>
                        Dismiss
                      </Button>
                    }
                    showIcon
                  />
                )}

                <form
                  onSubmit={handleSendMessage}
                  className="flex items-end gap-3"
                >
                  <div className="relative flex-1">
                    <Input.TextArea
                      placeholder="Type your message..."
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      onPressEnter={(e) => {
                        if (e.shiftKey) {
                          return;
                        }

                        e.preventDefault();
                        submitCurrentMessage();
                      }}
                      autoSize={{ minRows: 1, maxRows: 5 }}
                      maxLength={1000}
                      className="!resize-none !rounded-full !border-gray-200 !pr-28 !pt-3 !pb-3 !pl-4"
                    />

                    <div className="absolute bottom-2 right-2 flex items-center gap-1">
                      <Button
                        shape="circle"
                        icon={<PaperClipOutlined />}
                        disabled
                        type="text"
                        aria-label="File attachments unavailable"
                      />
                      <Button
                        shape="circle"
                        icon={<PictureOutlined />}
                        disabled
                        type="text"
                        aria-label="Image attachments unavailable"
                      />
                      <Button
                        shape="circle"
                        icon={<SmileOutlined />}
                        disabled
                        type="text"
                        aria-label="Emoji unavailable"
                      />
                    </div>
                  </div>

                  <Button
                    type="primary"
                    shape="circle"
                    icon={<SendOutlined />}
                    htmlType="submit"
                    disabled={sendDisabled}
                    aria-label="Send message"
                    className="!h-12 !w-12"
                  />
                </form>

                <Text className="mt-2 block px-2 text-xs text-gray-500">
                  Press Enter to send, Shift + Enter for new line
                </Text>
                {composeDisabledReason && (
                  <Text className="mt-2 block px-2 text-xs text-gray-500">
                    {composeDisabledReason}
                  </Text>
                )}
              </div>
            </>
          )}
        </Content>
      </Layout>
    </div>
  );
}
