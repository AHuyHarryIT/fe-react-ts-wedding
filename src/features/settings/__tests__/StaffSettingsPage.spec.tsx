import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StaffSettingsPage } from '../StaffSettingsPage';

const renderPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <StaffSettingsPage />
    </QueryClientProvider>
  );
};

const changePasswordMock = vi.fn();

vi.mock('@services/AuthService', () => ({
  authApi: {
    changePassword: (...args: unknown[]) => changePasswordMock(...args),
  },
}));

describe('StaffSettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders password change form fields', () => {
    renderPage();

    expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^new password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /update password/i })
    ).toBeInTheDocument();
  });

  it('blocks submit when confirm password does not match', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(
      screen.getByLabelText(/current password/i),
      'current-pass-123'
    );
    await user.type(screen.getByLabelText(/^new password$/i), 'new-pass-123');
    await user.type(
      screen.getByLabelText(/confirm new password/i),
      'different-pass-123'
    );

    await user.click(screen.getByRole('button', { name: /update password/i }));

    expect(
      await screen.findByText(/passwords do not match!/i)
    ).toBeInTheDocument();
    expect(changePasswordMock).not.toHaveBeenCalled();
  });

  it('submits change password and clears fields on success', async () => {
    const user = userEvent.setup();
    changePasswordMock.mockResolvedValueOnce({
      message: 'Password changed successfully',
    });

    renderPage();

    const currentPasswordInput = screen.getByLabelText(/current password/i);
    const newPasswordInput = screen.getByLabelText(/^new password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm new password/i);

    await user.type(currentPasswordInput, 'current-pass-123');
    await user.type(newPasswordInput, 'new-pass-123');
    await user.type(confirmPasswordInput, 'new-pass-123');

    await user.click(screen.getByRole('button', { name: /update password/i }));

    await waitFor(() => {
      expect(changePasswordMock).toHaveBeenCalledTimes(1);
    });

    expect(changePasswordMock.mock.calls[0]?.[0]).toEqual({
      currentPassword: 'current-pass-123',
      newPassword: 'new-pass-123',
      confirmPassword: 'new-pass-123',
    });

    await waitFor(() => {
      expect(screen.getByLabelText(/current password/i)).toHaveValue('');
      expect(screen.getByLabelText(/^new password$/i)).toHaveValue('');
      expect(screen.getByLabelText(/confirm new password/i)).toHaveValue('');
    });
  });

  it('shows backend error message when API call fails', async () => {
    const user = userEvent.setup();
    changePasswordMock.mockRejectedValueOnce({
      response: {
        data: {
          message: 'Current password is incorrect',
        },
      },
    });

    renderPage();

    await user.type(
      screen.getByLabelText(/current password/i),
      'wrong-current-123'
    );
    await user.type(screen.getByLabelText(/^new password$/i), 'new-pass-123');
    await user.type(
      screen.getByLabelText(/confirm new password/i),
      'new-pass-123'
    );

    await user.click(screen.getByRole('button', { name: /update password/i }));

    await waitFor(() => {
      expect(changePasswordMock).toHaveBeenCalledTimes(1);
    });

    expect(
      await screen.findByText(/current password is incorrect/i)
    ).toBeInTheDocument();
  });
});
