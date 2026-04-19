import { useEffect, useMemo, useState } from 'react';
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
  Tooltip,
  Typography,
} from 'antd';
import { SendOutlined } from '@ant-design/icons';
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

  useEffect(() => {
    if (reconnectStatus !== 'recovering') {
      return;
    }

    void refreshChats();
    void retryCurrentThread();
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

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (sendDisabled || !currentChat) {
      return;
    }

    try {
      setSending(true);
      setSendError(null);
      await sendMessage(messageContent.trim());
      setMessageContent('');
    } catch {
      setSendError('Message not sent. Check your connection and try again.');
    } finally {
      setSending(false);
    }
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
    <Layout className="h-full bg-white">
      <Sider
        width={340}
        className="bg-white border-r border-gray-200"
        theme="light"
      >
        <div className="p-4 border-b border-gray-200">
          <h2 className="m-0 text-lg font-semibold text-gray-900">
            Conversation Queue
          </h2>
          <Text type="secondary">Latest activity first</Text>
        </div>

        <div className="p-3 border-b border-gray-100 flex flex-wrap gap-2">
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

        {error ? (
          <div className="p-4">
            <Alert
              type="error"
              message="We couldn’t load or send messages right now. Retry this action. If the issue continues, refresh the page and try again."
              action={
                <Button size="small" onClick={() => void refreshChats()}>
                  Retry
                </Button>
              }
              showIcon
            />
          </div>
        ) : null}

        <div
          className="overflow-y-auto"
          style={{ maxHeight: 'calc(100vh - 200px)' }}
        >
          {filteredChats.length === 0 ? (
            <div className="p-4" data-testid="queue-empty">
              <Empty
                description={
                  <div>
                    <p className="font-medium mb-1">{queueEmptyCopy.heading}</p>
                    <p className="m-0 text-gray-500">{queueEmptyCopy.body}</p>
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
                <button
                  key={chat.id}
                  type="button"
                  aria-label={`Open conversation with ${customerName}`}
                  onClick={() => void selectChat(chat.id)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-100 transition-colors ${
                    isActive ? 'bg-blue-50' : 'hover:bg-gray-50'
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
                        {unreadCount > 0 ? (
                          <Badge
                            count={unreadCount > 99 ? '99+' : unreadCount}
                            className="site-badge-count-109"
                          />
                        ) : null}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </Sider>

      <Content className="flex flex-col bg-white">
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
              message={replyForbiddenReason || 'Required permission: chat.read'}
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
                <div className="space-y-3">
                  {messages.map((message: Message) => {
                    const isCustomerMessage =
                      message.senderId === currentChat.customerId;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isCustomerMessage ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-xl rounded-2xl px-4 py-2 ${
                            isCustomerMessage
                              ? 'bg-emerald-100 text-gray-900 rounded-bl-none'
                              : 'bg-blue-500 text-white rounded-br-none'
                          }`}
                        >
                          <p className="m-0 whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 sticky bottom-0 bg-white">
              {sendError ? (
                <Alert
                  type="error"
                  className="mb-3"
                  message={sendError}
                  action={
                    <Button size="small" onClick={() => setSendError(null)}>
                      Dismiss
                    </Button>
                  }
                  showIcon
                />
              ) : null}

              {composeDisabledReason ? (
                <Text className="block mb-2 text-gray-500">
                  {composeDisabledReason}
                </Text>
              ) : null}

              <form
                onSubmit={handleSendMessage}
                className="flex gap-3 items-end"
              >
                <Input.TextArea
                  placeholder="Type your message"
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  rows={2}
                  maxLength={1000}
                />

                <Tooltip title={composeDisabledReason ?? ''}>
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    htmlType="submit"
                    disabled={sendDisabled}
                  >
                    Send Message
                  </Button>
                </Tooltip>
              </form>
            </div>
          </>
        )}
      </Content>
    </Layout>
  );
}
