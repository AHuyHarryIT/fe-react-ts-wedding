import { api } from '../api/client';

export interface Chat {
  id: string;
  customerId: string;
  staffId?: string | null;
  bookingId?: string | null;
  chatType?: 'DIRECT' | 'GROUP';
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
  senderCustomerId?: string | null;
  senderStaffId?: string | null;
  content: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

type MessageLike = Message & {
  senderCustomerId?: string | null;
  senderStaffId?: string | null;
};

class ChatService {
  private extractData<T>(
    response: { data?: unknown } | Record<string, unknown>
  ): T {
    const data = 'data' in response ? response.data : response;
    return ((data as Record<string, unknown>)?.data || data || response) as T;
  }

  private normalizeChat(chat: Chat): Chat {
    return {
      ...chat,
      staffId: chat.staffId ?? null,
      bookingId: chat.bookingId ?? null,
    };
  }

  private normalizeMessage(message: MessageLike): Message {
    return {
      ...message,
      senderId:
        message.senderId ||
        message.senderStaffId ||
        message.senderCustomerId ||
        undefined,
    };
  }

  private normalizeChats(chats: Chat[]): Chat[] {
    return chats.map((chat) => this.normalizeChat(chat));
  }

  private normalizeMessages(messages: MessageLike[]): Message[] {
    return messages.map((message) => this.normalizeMessage(message));
  }

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
    return this.normalizeChat(this.extractData<Chat>(response));
  }

  async getChat(chatId: string): Promise<Chat> {
    const response = await api.get(`/staff-chats/${chatId}`);
    return this.normalizeChat(this.extractData<Chat>(response));
  }

  async getChats(skip?: number, take?: number): Promise<Chat[]> {
    const response = await api.get('/staff-chats', {
      params: {
        skip: skip || 0,
        take: take || 20,
      },
    });
    return this.normalizeChats(this.extractData<Chat[]>(response) || []);
  }

  async getChatsByStaff(skip?: number, take?: number): Promise<Chat[]> {
    const response = await api.get('/staff-chats', {
      params: {
        skip: skip || 0,
        take: take || 20,
      },
    });
    return this.normalizeChats(this.extractData<Chat[]>(response) || []);
  }

  async updateChat(
    chatId: string,
    data: { staffId?: string; isArchived?: boolean; aiEnabled?: boolean }
  ): Promise<Chat> {
    const response = await api.put(`/chats/${chatId}`, data);
    return this.normalizeChat(this.extractData<Chat>(response));
  }

  async archiveChat(chatId: string): Promise<Chat> {
    const response = await api.put(`/chats/${chatId}/archive`);
    return this.normalizeChat(this.extractData<Chat>(response));
  }

  async deleteChat(chatId: string): Promise<void> {
    await api.delete(`/chats/${chatId}`);
  }

  async sendMessage(chatId: string, content: string): Promise<Message> {
    const response = await api.post(`/staff-chats/${chatId}/messages`, {
      content,
    });
    return this.normalizeMessage(this.extractData<MessageLike>(response));
  }

  async getMessages(
    chatId: string,
    skip?: number,
    take?: number
  ): Promise<Message[]> {
    const response = await api.get(`/staff-chats/${chatId}/messages`, {
      params: {
        skip: skip || 0,
        take: take || 50,
      },
    });
    return this.normalizeMessages(
      this.extractData<MessageLike[]>(response) || []
    );
  }

  async getUnreadMessages(chatId: string): Promise<Message[]> {
    const response = await api.get(`/chats/${chatId}/messages/unread`);
    return this.normalizeMessages(
      this.extractData<MessageLike[]>(response) || []
    );
  }

  async markMessagesAsRead(chatId: string): Promise<void> {
    await api.put(`/staff-chats/${chatId}/messages/read`);
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
