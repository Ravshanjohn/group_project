import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest, createMockResponse, mockDatabase, mockSupabaseChain } from './setup.js';
import { resetPassword, forgotPassword } from '../controllers/auth.controller.js';

vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('$2b$10$newhashedpassword'),
    compare: vi.fn(),
  },
}));

describe('Password Reset Controller — Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Re-establish chain defaults after clearing
    mockSupabaseChain.select.mockReturnThis();
    mockSupabaseChain.insert.mockReturnThis();
    mockSupabaseChain.update.mockReturnThis();
    mockSupabaseChain.delete.mockReturnThis();
    mockSupabaseChain.eq.mockReturnThis();
    mockSupabaseChain.order.mockReturnThis();
  });

  // TC-10: Password reset accepts snake_case field (EP, Critical — regression for BUG-003)
  it('TC-10: should accept new_password (snake_case) field', async () => {
    const req = createMockRequest({
      params: { token: 'valid-reset-token' },
      body: { new_password: 'newSecurePass123' },
    });
    const res = createMockResponse();

    // consume_token RPC succeeds
    mockDatabase.rpc.mockResolvedValueOnce({
      data: [{ success: true, user_id: '1' }],
      error: null,
    });
    // User password update: .from('users').update().eq().select().single()
    mockSupabaseChain.single.mockResolvedValueOnce({
      data: { email: 'john@example.com' },
      error: null,
    });
    // Token revocation: .from('tokens').update().eq().eq() — no special handling needed

    await resetPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: null, error: null });
  });

  // TC-10 variant: accepts camelCase newPassword field too
  it('TC-10b: should accept newPassword (camelCase) field', async () => {
    const req = createMockRequest({
      params: { token: 'valid-reset-token' },
      body: { newPassword: 'newSecurePass456' },
    });
    const res = createMockResponse();

    mockDatabase.rpc.mockResolvedValueOnce({
      data: [{ success: true, user_id: '1' }],
      error: null,
    });
    mockSupabaseChain.single.mockResolvedValueOnce({
      data: { email: 'john@example.com' },
      error: null,
    });

    await resetPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  // BVA: reject password below 6 characters on reset
  it('should reject reset password shorter than 6 characters', async () => {
    const req = createMockRequest({
      params: { token: 'valid-token' },
      body: { new_password: 'Ab1c5' },  // 5 chars
    });
    const res = createMockResponse();

    await resetPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'password_too_short' }),
      })
    );
  });

  // Missing new password
  it('should reject reset when new password is missing', async () => {
    const req = createMockRequest({
      params: { token: 'valid-token' },
      body: {},
    });
    const res = createMockResponse();

    await resetPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'password_required' }),
      })
    );
  });

  // Invalid/expired token
  it('should reject reset with invalid or expired token', async () => {
    const req = createMockRequest({
      params: { token: 'expired-token' },
      body: { new_password: 'newPass123' },
    });
    const res = createMockResponse();

    mockDatabase.rpc.mockResolvedValueOnce({
      data: [],
      error: null,
    });

    await resetPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'invalid_token' }),
      })
    );
  });

  // Forgot password — valid email
  it('should accept forgot password request for verified user', async () => {
    const req = createMockRequest({
      body: { email: 'john@example.com' },
    });
    const res = createMockResponse();

    // User lookup
    mockSupabaseChain.single.mockResolvedValueOnce({
      data: { id: '1', email: 'john@example.com', is_verified: true, deleted_at: null },
      error: null,
    });
    // can_send_email RPC
    mockDatabase.rpc
      .mockResolvedValueOnce({ data: true, error: null })   // can_send_email
      .mockResolvedValueOnce({ data: true, error: null });   // insert_token

    await forgotPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  // Forgot password — missing email
  it('should reject forgot password when email is missing', async () => {
    const req = createMockRequest({ body: {} });
    const res = createMockResponse();

    await forgotPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'email_required' }),
      })
    );
  });
});
