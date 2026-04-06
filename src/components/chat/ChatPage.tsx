import { useState } from 'react';
import { Layout, Button, Input, Avatar, Empty, Spin, Alert } from 'antd';
import { PlusOutlined, SendOutlined } from '@ant-design/icons';
import { useChat } from '../../hooks/useChat';
import type { Chat, Message } from '../../services/ChatService';

interface ChatPageProps {
  customerId: string;
  staffId?: string;
}

const { Sider, Content } = Layout;

export function ChatPage({ customerId, staffId }: ChatPageProps) {
  const {
    chats,
    currentChat,
    messages,
    loading,
    error,
    createChat,
    selectChat,
    sendMessage,
  } = useChat(customerId);
  const [messageContent, setMessageContent] = useState('');
  const [showCreateChat, setShowCreateChat] = useState(false);
  const [newStaffId, setNewStaffId] = useState(staffId || '');

  if (loading && chats.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (messageContent.trim() && currentChat) {
      await sendMessage(messageContent);
      setMessageContent('');
    }
  };

  const handleCreateChat = async () => {
    if (newStaffId.trim()) {
      await createChat(customerId, newStaffId);
      setShowCreateChat(false);
      setNewStaffId('');
    }
  };

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  const getCustomerName = (chat: Chat) => {
    // First try to get from customer object (API response)
    if (chat.customer?.firstName || chat.customer?.lastName) {
      const fullName =
        `${chat.customer.firstName || ''} ${chat.customer.lastName || ''}`.trim();
      if (fullName) return fullName;
    }
    // If no customer data, show Customer
    return 'Customer';
  };

  const getCustomerInitial = (chat: Chat) => {
    const name = getCustomerName(chat);
    return name.charAt(0).toUpperCase();
  };

  return (
    <Layout className="h-full bg-white">
      {/* Customer Profile Panel - Left Side */}
      <Sider
        width={280}
        className="bg-gradient-to-b from-slate-50 to-white"
        style={{
          overflow: 'auto',
          height: '100%',
          background: 'linear-gradient(to bottom, #f8fafc, #ffffff)',
          borderRight: '1px solid #e5e5e5',
        }}
      >
        {!currentChat ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <Empty
              description="Select a chat to view customer"
              style={{ marginTop: '-60px' }}
            />
          </div>
        ) : (
          <>
            {/* Customer Profile Header */}
            <div className="p-6 border-b border-gray-200 text-center">
              <Avatar
                size={80}
                className="bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0 font-bold text-white mx-auto mb-3"
                style={{ fontSize: '32px' }}
              >
                {getCustomerInitial(currentChat)}
              </Avatar>
              <h2 className="text-lg font-bold text-gray-900 m-0 mb-2">
                {getCustomerName(currentChat)}
              </h2>
              <div className="flex items-center justify-center gap-1 mb-4">
                <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
                <span className="text-xs text-green-600 font-medium">
                  Active
                </span>
              </div>
            </div>

            {/* Chat List Dropdown */}
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-600 uppercase mb-3">
                Chat History
              </p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {chats.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-4">
                    No chats
                  </p>
                ) : (
                  chats.map((chat: Chat) => (
                    <div
                      key={chat.id}
                      className={`px-3 py-2 rounded-lg cursor-pointer transition-all text-xs ${
                        currentChat?.id === chat.id
                          ? 'bg-blue-100 border border-blue-300'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                      onClick={() => selectChat(chat.id)}
                    >
                      <p className="font-medium text-gray-900 m-0 truncate">
                        {getCustomerName(chat)}
                      </p>
                      <p className="text-gray-600 m-0 truncate">
                        {(chat as Chat & { lastMessage?: string })
                          .lastMessage || 'No messages'}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Customer Info Section */}
            <div className="px-4 py-4 space-y-3">
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                <p className="text-xs font-semibold text-blue-900 mb-1">
                  Last Message
                </p>
                <p className="text-xs text-blue-800">
                  {currentChat.lastMessageAt
                    ? formatDate(currentChat.lastMessageAt)
                    : 'No messages yet'}
                </p>
              </div>
            </div>

            {/* Create New Chat */}
            <div className="px-4 py-4 border-t border-gray-100">
              <Button
                type="primary"
                block
                icon={<PlusOutlined />}
                onClick={() => setShowCreateChat(!showCreateChat)}
                className="rounded-lg"
              >
                {showCreateChat ? 'Cancel' : 'New Chat'}
              </Button>

              {showCreateChat && (
                <div className="mt-3 space-y-2">
                  <Input
                    placeholder="Enter customer ID"
                    value={newStaffId}
                    onChange={(e) => setNewStaffId(e.target.value)}
                    className="rounded-lg"
                    allowClear
                    size="small"
                  />
                  <Button
                    type="default"
                    block
                    onClick={handleCreateChat}
                    size="small"
                    className="rounded-lg"
                  >
                    Start Chat
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </Sider>

      {/* Chat Main Content - Messenger Style */}
      <Content className="flex flex-col bg-white">
        {!currentChat ? (
          <div className="flex items-center justify-center flex-1 text-gray-400">
            <Empty
              description="Select a chat to start messaging"
              style={{ marginTop: '-60px' }}
            />
          </div>
        ) : (
          <>
            {/* Chat Header - Simple Title */}
            <div className="px-6 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
              <h2 className="text-lg font-bold m-0 text-gray-900">
                Chat with {getCustomerName(currentChat)}
              </h2>
              <p className="text-xs text-gray-500 m-0 mt-1">
                <span className="w-2 h-2 bg-green-500 rounded-full inline-block mr-1"></span>
                Active now
              </p>
            </div>

            {/* Messages Container */}
            <div
              className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-2 bg-gradient-to-b from-gray-50 to-white"
              style={{ minHeight: 0 }}
            >
              {error && (
                <Alert
                  title="Error"
                  description={error}
                  type="error"
                  closable
                  className="mb-4"
                />
              )}

              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <Empty
                    description="No messages yet. Start the conversation!"
                    style={{ marginTop: '-60px' }}
                  />
                </div>
              ) : (
                <div className="space-y-2 flex flex-col">
                  {messages.map((message: Message) => {
                    const isCustomerMessage =
                      Boolean(currentChat?.customerId) &&
                      message.senderId === currentChat.customerId;

                    return (
                      <div
                        key={message.id}
                        className={`flex gap-2 ${
                          isCustomerMessage ? 'justify-start' : 'justify-end'
                        }`}
                      >
                        {isCustomerMessage && (
                          <Avatar
                            size={28}
                            className="bg-gradient-to-br from-emerald-500 to-emerald-600 flex-shrink-0 font-bold text-white"
                            style={{ fontSize: '12px' }}
                          >
                            {getCustomerInitial(currentChat)}
                          </Avatar>
                        )}
                        <div
                          className={`px-4 py-2 rounded-2xl max-w-md break-words ${
                            isCustomerMessage
                              ? 'bg-emerald-100 text-gray-900 rounded-bl-none'
                              : 'bg-blue-500 text-white rounded-br-none'
                          }`}
                          style={{
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word',
                          }}
                        >
                          <p className="text-sm m-0">{message.content}</p>
                          {message.isRead && !isCustomerMessage && (
                            <span className="text-xs opacity-70 mt-1 inline-block">
                              ✓✓
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Message Input - Messenger Style */}
            <div className="px-6 py-4 border-t border-gray-100 bg-white sticky bottom-0">
              <form
                onSubmit={handleSendMessage}
                className="flex gap-3 items-end"
              >
                <Input.TextArea
                  placeholder="Aa"
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  onPressEnter={(e) => {
                    if (e.ctrlKey || e.metaKey) {
                      const form = e.currentTarget.closest('form');
                      if (form) {
                        form.dispatchEvent(
                          new Event('submit', { bubbles: true })
                        );
                      }
                    }
                  }}
                  rows={1}
                  style={{
                    resize: 'none',
                    borderRadius: '20px',
                    paddingLeft: '16px',
                    paddingRight: '16px',
                    backgroundColor: '#f0f0f0',
                    border: 'none',
                  }}
                  className="mb-0 hover:bg-gray-100 focus:bg-white transition-colors"
                  maxLength={1000}
                />
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  htmlType="submit"
                  style={{
                    alignSelf: 'flex-end',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  className="rounded-full"
                />
              </form>
            </div>
          </>
        )}
      </Content>
    </Layout>
  );
}
