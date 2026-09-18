import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest, createMockResponse, mockDatabase, mockSupabaseChain } from './setup.js';
import { login } from '../controllers/auth.controller.js';

vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('$2b$10$hashedpassword'),
    compare: vi.fn(),
  },
}));

import bcrypt from 'bcrypt';

const validUser = {
  id: '1',
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com',
  password: '$2b$10$hashedpassword',
  avatar: null,
  balance: 100,
  is_verified: true,
  active_status: 'active',
  created_at: '2025-01-01T00:00:00Z',
  deleted_at: null,
};

describe('Login Controller — Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Token insert succeeds by default
    mockSupabaseChain.insert.mockReturnThis();
    mockSupabaseChain.select?.mockReturnThis?.();
  });

  // TC-05: Login with valid credentials (EP - valid class, Critical)
  it('TC-05: should authenticate with valid credentials', async () => {
    const req = createMockRequest({
      body: { email: 'john@example.com', password: 'correctPassword' },
    });
    const res = createMockResponse();

    mockSupabaseChain.single.mockResolvedValueOnce({ data: validUser, error: null });
    (bcrypt.compare as any).mockResolvedValueOnce(true);
    // Token storage
    mockDatabase.from.mockReturnValueOnce({
      ...mockSupabaseChain,
      insert: vi.fn().mockResolvedValueOnce({ error: null }),
    });

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          user: expect.objectContaining({ email: 'john@example.com' }),
        }),
        error: null,
      })
    );
  });

  // TC-06: Reject invalid login (EP - invalid class, High)
  it('TC-06: should reject login with wrong password', async () => {
    const req = createMockRequest({
      body: { email: 'john@example.com', password: 'wrongPassword' },
    });
    const res = createMockResponse();

    mockSupabaseChain.single.mockResolvedValueOnce({ data: validUser, error: null });
    (bcrypt.compare as any).mockResolvedValueOnce(false);

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'invalid_credentials' }),
      })
    );
  });

  // TC-06 variant: non-existent user
  it('TC-06b: should reject login for non-existent user', async () => {
    const req = createMockRequest({
      body: { email: 'nonexistent@example.com', password: 'password123' },
    });
    const res = createMockResponse();

    mockSupabaseChain.single.mockResolvedValueOnce({ data: null, error: { message: 'not found' } });

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'invalid_credentials' }),
      })
    );
  });

  // TC-07: Handle deactivated account (Decision Table, High)
  it('TC-07: should return deactivated message for deleted account', async () => {
    const deactivatedUser = {
      ...validUser,
      active_status: 'deactivated',
      deleted_at: '2025-06-01T00:00:00Z',
    };
    const req = createMockRequest({
      body: { email: 'john@example.com', password: 'correctPassword' },
    });
    const res = createMockResponse();

    mockSupabaseChain.single.mockResolvedValueOnce({ data: deactivatedUser, error: null });
    (bcrypt.compare as any).mockResolvedValueOnce(true);

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'account_deactivated' }),
      })
    );
  });

  // EP — unverified email
  it('should reject login for unverified account', async () => {
    const unverifiedUser = { ...validUser, is_verified: false };
    const req = createMockRequest({
      body: { email: 'john@example.com', password: 'correctPassword' },
    });
    const res = createMockResponse();

    mockSupabaseChain.single.mockResolvedValueOnce({ data: unverifiedUser, error: null });
    (bcrypt.compare as any).mockResolvedValueOnce(true);

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'email_not_verified' }),
      })
    );
  });

  // EP — missing credentials
  it('should reject login when email is missing', async () => {
    const req = createMockRequest({
      body: { password: 'password123' },
    });
    const res = createMockResponse();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'credentials_required' }),
      })
    );
  });

  it('should reject login when password is missing', async () => {
    const req = createMockRequest({
      body: { email: 'john@example.com' },
    });
    const res = createMockResponse();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'credentials_required' }),
      })
    );
  });
});
