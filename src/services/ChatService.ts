import { api } from '../api/client';

export interface Chat {
  id: string;
  customerId: string;
  staffId?: string;
  bookingId?: string;
  chatType: 'DIRECT' | 'GROUP';
  aiEnabled?: boolean;
  lastMessageAt?: Date;
  unreadCount?: number;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  customer?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

export interface Message {
  id: string;
  chatId: string;
  senderId?: string;
  senderType?: 'CUSTOMER' | 'STAFF' | 'AI';
  content: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

class ChatService {
  // Extract data from wrapped API response
  private extractData<T>(
    response: { data?: unknown } | Record<string, unknown>
  ): T {
    const data = 'data' in response ? response.data : response;
    return ((data as Record<string, unknown>)?.data || data || response) as T;
  }

  // Chat endpoints
  async createChat(
    customerId: string,
    staffId?: string,
    bookingId?: string
  ): Promise<Chat> {
    const response = await api.post('/chats', {
      customerId,
      staffId,
      bookingId,
    });
    return this.extractData<Chat>(response);
  }

  async getChat(chatId: string): Promise<Chat> {
    const response = await api.get(`/chats/${chatId}`);
    return this.extractData<Chat>(response);
  }

  async getChats(skip?: number, take?: number): Promise<Chat[]> {
    const response = await api.get('/chats', {
      params: {
        skip: skip || 0,
        take: take || 20,
      },
    });
    return this.extractData<Chat[]>(response) || [];
  }

  async getChatsByStaff(skip?: number, take?: number): Promise<Chat[]> {
    const response = await api.get('/chats/staff', {
      params: {
        skip: skip || 0,
        take: take || 20,
      },
    });
    return this.extractData<Chat[]>(response) || [];
  }

  async updateChat(
    chatId: string,
    data: { staffId?: string; isArchived?: boolean; aiEnabled?: boolean }
  ): Promise<Chat> {
    const response = await api.put(`/chats/${chatId}`, data);
    return this.extractData<Chat>(response);
  }

  async archiveChat(chatId: string): Promise<Chat> {
    const response = await api.put(`/chats/${chatId}/archive`);
    return this.extractData<Chat>(response);
  }

  async deleteChat(chatId: string): Promise<void> {
    await api.delete(`/chats/${chatId}`);
  }

  // Message endpoints
  async sendMessage(chatId: string, content: string): Promise<Message> {
    const response = await api.post(`/chats/${chatId}/messages`, {
      content,
    });
    return this.extractData<Message>(response);
  }

  async getMessages(
    chatId: string,
    skip?: number,
    take?: number
  ): Promise<Message[]> {
    const response = await api.get(`/chats/${chatId}/messages`, {
      params: {
        skip: skip || 0,
        take: take || 50,
      },
    });
    return this.extractData<Message[]>(response) || [];
  }

  async getUnreadMessages(chatId: string): Promise<Message[]> {
    const response = await api.get(`/chats/${chatId}/messages/unread`);
    return this.extractData<Message[]>(response) || [];
  }

  async markMessagesAsRead(chatId: string): Promise<void> {
    await api.put(`/chats/${chatId}/messages/read`);
  }

  async deleteMessage(messageId: string): Promise<void> {
    await api.delete(`/chats/messages/${messageId}`);
  }

  async getUnreadMessageCount(): Promise<number> {
    const response = await api.get('/chats/unread-count');
    const data = this.extractData<{ count: number }>(response);
    return data?.count || 0;
  }
}

export default new ChatService();
