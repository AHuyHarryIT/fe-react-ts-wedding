import type { ReactNode } from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Chat, Message } from '@/services/ChatService';
import { ChatPage } from '../ChatPage';

const mockState = vi.hoisted(() => ({
  chats: [] as Chat[],
  currentChat: null as Chat | null,
  messages: [] as Message[],
  loading: false,
  error: null as string | null,
  reconnectStatus: 'live' as 'live' | 'reconnecting' | 'offline' | 'recovering',
  canRead: true,
  canReply: true,
  replyForbiddenReason: null as string | null,
  selectChat: vi.fn(async () => undefined),
  sendMessage: vi.fn(async () => undefined),
  refreshChats: vi.fn(async () => undefined),
  retryCurrentThread: vi.fn(async () => undefined),
}));

vi.mock('@/hooks/useChat', () => ({
  useChat: () => ({
    chats: mockState.chats,
    currentChat: mockState.currentChat,
    messages: mockState.messages,
    loading: mockState.loading,
    error: mockState.error,
    reconnectStatus: mockState.reconnectStatus,
    canRead: mockState.canRead,
    canReply: mockState.canReply,
    replyForbiddenReason: mockState.replyForbiddenReason,
    selectChat: mockState.selectChat,
    sendMessage: mockState.sendMessage,
    refreshChats: mockState.refreshChats,
    retryCurrentThread: mockState.retryCurrentThread,
  }),
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual<typeof import('@tanstack/react-router')>(
    '@tanstack/react-router'
  );

  return {
    ...actual,
    Link: ({ children, ...props }: { children?: ReactNode }) => (
      <a {...props}>{children}</a>
    ),
  };
});

const buildChat = (
  id: string,
  options: {
    firstName: string;
    lastName: string;
    lastMessageAt: string;
    unreadCount?: number;
    bookingId?: string;
    staffId?: string;
  }
): Chat => ({
  id,
  customerId: `customer-${id}`,
  staffId: options.staffId,
  bookingId: options.bookingId,
  chatType: 'DIRECT',
  lastMessageAt: new Date(options.lastMessageAt),
  unreadCount: options.unreadCount ?? 0,
  isArchived: false,
  createdAt: new Date('2026-04-19T07:00:00.000Z'),
  updatedAt: new Date('2026-04-19T07:00:00.000Z'),
  customer: {
    id: `customer-${id}`,
    firstName: options.firstName,
    lastName: options.lastName,
    email: `${options.firstName.toLowerCase()}@example.com`,
  },
});

const buildMessage = (
  id: string,
  senderId: string,
  content: string
): Message => ({
  id,
  chatId: 'chat-1',
  senderId,
  content,
  isRead: true,
  createdAt: new Date('2026-04-19T09:00:00.000Z'),
  updatedAt: new Date('2026-04-19T09:00:00.000Z'),
});

describe('ChatPage staff queue filters and contract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockState.loading = false;
    mockState.error = null;
    mockState.reconnectStatus = 'live';
    mockState.canRead = true;
    mockState.canReply = true;
    mockState.replyForbiddenReason = null;

    mockState.chats = [
      buildChat('chat-1', {
        firstName: 'Alice',
        lastName: 'Nguyen',
        lastMessageAt: '2026-04-19T10:30:00.000Z',
        unreadCount: 2,
        bookingId: 'booking-1',
        staffId: 'staff-1',
      }),
      buildChat('chat-2', {
        firstName: 'Bob',
        lastName: 'Tran',
        lastMessageAt: '2026-04-19T08:00:00.000Z',
        unreadCount: 0,
        bookingId: undefined,
        staffId: 'staff-2',
      }),
      buildChat('chat-3', {
        firstName: 'Carol',
        lastName: 'Pham',
        lastMessageAt: '2026-04-19T09:15:00.000Z',
        unreadCount: 5,
        bookingId: 'booking-3',
        staffId: 'staff-2',
      }),
    ];

    mockState.currentChat = mockState.chats[0];
    mockState.messages = [
      buildMessage(
        'm-1',
        mockState.currentChat.customerId,
        'Need timeline update'
      ),
      buildMessage('m-2', 'staff-1', 'Shared update'),
    ];
  });

  it('renders required filters with counts', () => {
    render(<ChatPage customerId="staff-1" />);

    expect(
      screen.getByRole('button', { name: /all \(3\)/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /unread \(2\)/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /assigned to me \(1\)/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /booking-linked \(2\)/i })
    ).toBeInTheDocument();
  });

  it('removes raw-id chat creation controls from staff chat', () => {
    render(<ChatPage customerId="staff-1" />);

    expect(
      screen.queryByRole('button', {
        name: /new chat/i,
      })
    ).not.toBeInTheDocument();

    expect(
      screen.queryByPlaceholderText(/enter customer id/i)
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole('button', {
        name: /start chat/i,
      })
    ).not.toBeInTheDocument();
  });

  it('does not render per-message receipt markers', () => {
    render(<ChatPage customerId="staff-1" />);

    expect(screen.queryByText('✓✓')).not.toBeInTheDocument();
  });

  it('preserves latest-message ordering across staff queue filters', async () => {
    const user = userEvent.setup();
    render(<ChatPage customerId="staff-1" />);

    const allRows = screen.getAllByRole('button', {
      name: /open conversation with/i,
    });
    expect(allRows).toHaveLength(3);

    const allNames = allRows.map(
      (row) => within(row).getByTestId('chat-name').textContent
    );
    expect(allNames).toEqual(['Alice Nguyen', 'Carol Pham', 'Bob Tran']);

    await user.click(screen.getByRole('button', { name: /unread \(2\)/i }));
    const unreadRows = screen.getAllByRole('button', {
      name: /open conversation with/i,
    });
    expect(unreadRows).toHaveLength(2);
    const unreadNames = unreadRows.map(
      (row) => within(row).getByTestId('chat-name').textContent
    );
    expect(unreadNames).toEqual(['Alice Nguyen', 'Carol Pham']);

    await user.click(
      screen.getByRole('button', { name: /booking-linked \(2\)/i })
    );
    const bookingRows = screen.getAllByRole('button', {
      name: /open conversation with/i,
    });
    const bookingNames = bookingRows.map(
      (row) => within(row).getByTestId('chat-name').textContent
    );
    expect(bookingNames).toEqual(['Alice Nguyen', 'Carol Pham']);
  });

  it('refetches staff queue and active thread on reconnect recovery', async () => {
    mockState.reconnectStatus = 'recovering';

    render(<ChatPage customerId="staff-1" />);

    await waitFor(() => {
      expect(mockState.refreshChats).toHaveBeenCalledTimes(1);
      expect(mockState.retryCurrentThread).toHaveBeenCalledTimes(1);
    });
  });

  it('marks thread as read on open and clears unread badge', async () => {
    const user = userEvent.setup();

    mockState.chats = [
      buildChat('chat-3', {
        firstName: 'Carol',
        lastName: 'Pham',
        lastMessageAt: '2026-04-19T09:15:00.000Z',
        unreadCount: 4,
        bookingId: 'booking-3',
        staffId: 'staff-1',
      }),
    ];
    mockState.currentChat = mockState.chats[0];

    render(<ChatPage customerId="staff-1" />);

    expect(screen.getByText('4')).toBeInTheDocument();

    mockState.selectChat.mockImplementationOnce(async () => {
      mockState.chats = [{ ...mockState.chats[0], unreadCount: 0 }];
      mockState.currentChat = mockState.chats[0];
    });

    await user.click(
      screen.getByRole('button', { name: /open conversation with carol pham/i })
    );

    await waitFor(() => {
      expect(mockState.selectChat).toHaveBeenCalledWith('chat-3');
    });
  });

  it('shows Required permission: chat.reply when reply permission is missing', () => {
    mockState.canReply = false;
    mockState.replyForbiddenReason = 'Required permission: chat.reply';

    render(<ChatPage customerId="staff-1" />);

    expect(
      screen.getByRole('button', { name: /send message/i })
    ).toBeDisabled();
    expect(
      screen.getByText(/required permission: chat\.reply/i)
    ).toBeInTheDocument();
  });

  it('surfaces Missing permission: chat.read in disabled-reason copy', () => {
    mockState.canRead = false;
    mockState.replyForbiddenReason = 'Missing permission: chat.read';

    render(<ChatPage customerId="staff-1" />);

    expect(
      screen.getByText(/missing permission: chat\.read/i)
    ).toBeInTheDocument();
  });

  it('does not render raw-id chat controls or read-receipt glyphs', () => {
    render(<ChatPage customerId="staff-1" />);

    expect(screen.queryByText('✓✓')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /new chat/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText(/enter customer id/i)
    ).not.toBeInTheDocument();
  });
});
