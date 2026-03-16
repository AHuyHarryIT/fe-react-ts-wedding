import { useState } from 'react';
import { Layout, Button, Input, List, Avatar, Empty, Spin, Alert } from 'antd';
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

  const getStaffName = (chat: Chat) => {
    if (chat.staffId) {
      return `Staff ${chat.staffId.substring(0, 8)}`;
    }
    return 'Staff Member';
  };

  const getStaffInitial = (chat: Chat) => {
    return getStaffName(chat).charAt(0).toUpperCase();
  };

  return (
    <Layout className="h-full bg-white">
      {/* Chat Sidebar - Messenger Style */}
      <Sider
        width={320}
        className="bg-white"
        style={{
          overflow: 'auto',
          height: '100%',
          background: '#ffffff',
          borderRight: '1px solid #e5e5e5',
        }}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-black m-0 text-gray-900">Inbox</h2>
          <Button
            type="primary"
            shape="circle"
            icon={showCreateChat ? '✕' : <PlusOutlined />}
            onClick={() => setShowCreateChat(!showCreateChat)}
            size="small"
            className="rounded-full"
          />
        </div>

        {/* Search Bar */}
        <div className="px-4 py-3 border-b border-gray-100">
          <Input
            placeholder="Search conversations..."
            allowClear
            className="rounded-full border-gray-200"
            style={{ borderRadius: '20px' }}
          />
        </div>

        {/* Create Chat Form */}
        {showCreateChat && (
          <div className="px-4 py-4 border-b border-gray-100 bg-gray-50">
            <Input
              placeholder="Enter staff ID"
              value={newStaffId}
              onChange={(e) => setNewStaffId(e.target.value)}
              className="mb-2 rounded-lg"
              allowClear
            />
            <Button
              type="primary"
              block
              onClick={handleCreateChat}
              size="small"
              className="rounded-lg"
            >
              Start Chat
            </Button>
          </div>
        )}

        {/* Chat List - Messenger Style */}
        <div className="overflow-auto" style={{ height: 'calc(100% - 140px)' }}>
          {chats.length === 0 ? (
            <Empty description="No chats yet" style={{ marginTop: '48px' }} />
          ) : (
            <List
              dataSource={chats}
              renderItem={(chat: Chat) => (
                <div
                  key={chat.id}
                  className={`px-3 py-2 mx-2 my-1 rounded-lg cursor-pointer transition-all duration-200 ${
                    currentChat?.id === chat.id
                      ? 'bg-gray-100'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => selectChat(chat.id)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      size={48}
                      className="bg-gradient-to-br from-blue-500 to-blue-600 flex-shrink-0 font-bold text-white"
                      style={{ fontSize: '18px' }}
                    >
                      {getStaffInitial(chat)}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-sm text-gray-900 truncate">
                          {getStaffName(chat)}
                        </span>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {chat.lastMessageAt
                            ? formatDate(chat.lastMessageAt)
                            : ''}
                        </span>
                      </div>
                      <span className="text-xs text-gray-600 truncate block">
                        No new messages
                      </span>
                    </div>
                  </div>
                </div>
              )}
            />
          )}
        </div>
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
            {/* Chat Header - Messenger Style */}
            <div className="px-6 py-4 border-b border-gray-100 bg-white flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <Avatar
                  size={40}
                  className="bg-gradient-to-br from-blue-500 to-blue-600 font-bold text-white"
                  style={{ fontSize: '16px' }}
                >
                  {getStaffInitial(currentChat)}
                </Avatar>
                <div>
                  <h2 className="text-base font-bold m-0 text-gray-900">
                    {getStaffName(currentChat)}
                  </h2>
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-600 rounded-full inline-block"></span>
                    Active now
                  </span>
                </div>
              </div>
            </div>

            {/* Messages Container - Messenger Style */}
            <div
              className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-2 bg-white"
              style={{ minHeight: 0 }}
            >
              {error && (
                <Alert
                  message="Error"
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
                  {messages.map((message: Message) => (
                    <div
                      key={message.id}
                      className={`flex gap-2 ${
                        message.senderId === customerId
                          ? 'justify-end'
                          : 'justify-start'
                      }`}
                    >
                      {message.senderId !== customerId && (
                        <Avatar
                          size={28}
                          className="bg-gradient-to-br from-blue-500 to-blue-600 flex-shrink-0 font-bold text-white"
                          style={{ fontSize: '12px' }}
                        >
                          {getStaffInitial(currentChat)}
                        </Avatar>
                      )}
                      <div
                        className={`px-4 py-2 rounded-2xl max-w-md break-words ${
                          message.senderId === customerId
                            ? 'bg-blue-500 text-white rounded-br-none'
                            : 'bg-gray-200 text-gray-900 rounded-bl-none'
                        }`}
                        style={{
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word',
                        }}
                      >
                        <p className="text-sm m-0">{message.content}</p>
                        {message.isRead && message.senderId === customerId && (
                          <span className="text-xs opacity-70 mt-1 inline-block">
                            ✓✓
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
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
                  onClick={() => {
                    const form = document.querySelector(
                      'form'
                    ) as HTMLFormElement;
                    if (form) {
                      form.dispatchEvent(
                        new Event('submit', { bubbles: true })
                      );
                    }
                  }}
                  style={{
                    alignSelf: 'flex-end',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  htmlType="submit"
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
