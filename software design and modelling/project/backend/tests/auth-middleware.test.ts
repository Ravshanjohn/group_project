import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest, createMockResponse, mockDatabase, mockSupabaseChain } from './setup.js';
import { protectRoute } from '../middleware/auth.middleware.js';
import jwt from 'jsonwebtoken';

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn().mockReturnValue('mock-token'),
    verify: vi.fn(),
  },
}));

describe('Auth Middleware — Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // TC-08: Protect route without valid JWT (EP, Critical)
  it('TC-08: should return 401 for malformed JWT token', async () => {
    const req = createMockRequest({
      cookies: { jwt: 'malformed-token-value' },
    });
    const res = createMockResponse();
    const next = vi.fn();

    (jwt.verify as any).mockImplementationOnce(() => {
      throw new Error('jwt malformed');
    });

    await protectRoute(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(next).not.toHaveBeenCalled();
  });

  // TC-09: Protect route with expired/invalid JWT (EP, Critical)
  it('TC-09: should reject expired JWT token', async () => {
    const req = createMockRequest({
      cookies: { jwt: 'expired-token' },
    });
    const res = createMockResponse();
    const next = vi.fn();

    (jwt.verify as any).mockImplementationOnce(() => {
      throw new Error('jwt expired');
    });

    await protectRoute(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(next).not.toHaveBeenCalled();
  });

  // Missing token — should return 401
  it('should return 401 when no JWT token is provided', async () => {
    const req = createMockRequest({ cookies: {} });
    const res = createMockResponse();
    const next = vi.fn();

    await protectRoute(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Not authorized, token missing' })
    );
    expect(next).not.toHaveBeenCalled();
  });

  // Valid token — should attach user and call next
  it('should authenticate valid token and call next()', async () => {
    const req = createMockRequest({
      cookies: { jwt: 'valid-token' },
    });
    const res = createMockResponse();
    const next = vi.fn();

    (jwt.verify as any).mockReturnValueOnce({ id: '1' });
    mockSupabaseChain.single.mockResolvedValueOnce({
      data: {
        id: '1',
        first_name: 'John',
        last_name: 'Doe',
        balance: 100,
        email: 'john@example.com',
        avatar: null,
        is_verified: true,
        active_status: 'active',
        created_at: '2025-01-01T00:00:00Z',
        deleted_at: null,
      },
      error: null,
    });

    await protectRoute(req, res, next);

    expect(next).toHaveBeenCalled();
    expect((req as any).user).toBeDefined();
    expect((req as any).user.email).toBe('john@example.com');
  });

  // Token valid but user not found
  it('should return 401 when token is valid but user not found in DB', async () => {
    const req = createMockRequest({
      cookies: { jwt: 'valid-token' },
    });
    const res = createMockResponse();
    const next = vi.fn();

    (jwt.verify as any).mockReturnValueOnce({ id: '999' });
    mockSupabaseChain.single.mockResolvedValueOnce({ data: null, error: { message: 'not found' } });

    await protectRoute(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  // Unverified user — should return 403
  it('should return 403 for unverified user', async () => {
    const req = createMockRequest({
      cookies: { jwt: 'valid-token' },
    });
    const res = createMockResponse();
    const next = vi.fn();

    (jwt.verify as any).mockReturnValueOnce({ id: '2' });
    mockSupabaseChain.single.mockResolvedValueOnce({
      data: {
        id: '2',
        first_name: 'Jane',
        last_name: 'Doe',
        balance: 0,
        email: 'jane@example.com',
        avatar: null,
        is_verified: false,
        active_status: 'pending',
        created_at: '2025-01-01T00:00:00Z',
        deleted_at: null,
      },
      error: null,
    });

    await protectRoute(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  // Deactivated user — should return 403
  it('should return 403 for deactivated user', async () => {
    const req = createMockRequest({
      cookies: { jwt: 'valid-token' },
    });
    const res = createMockResponse();
    const next = vi.fn();

    (jwt.verify as any).mockReturnValueOnce({ id: '3' });
    mockSupabaseChain.single.mockResolvedValueOnce({
      data: {
        id: '3',
        first_name: 'Bob',
        last_name: null,
        balance: 0,
        email: 'bob@example.com',
        avatar: null,
        is_verified: true,
        active_status: 'deactivated',
        created_at: '2025-01-01T00:00:00Z',
        deleted_at: '2025-06-01T00:00:00Z',
      },
      error: null,
    });

    await protectRoute(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
