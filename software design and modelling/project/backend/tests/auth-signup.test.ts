import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest, createMockResponse, mockDatabase, mockSupabaseChain } from './setup.js';
import { signup } from '../controllers/auth.controller.js';

// Mock bcrypt
vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('$2b$10$hashedpassword'),
    compare: vi.fn(),
  },
}));

describe('Signup Controller — Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // TC-01: Register with valid data (EP - valid class)
  it('TC-01: should register a new user with valid data', async () => {
    const req = createMockRequest({
      body: {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        password: 'securePass123',
      },
    });
    const res = createMockResponse();

    // User does not exist
    mockSupabaseChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    // Insert new user succeeds
    mockSupabaseChain.single.mockResolvedValueOnce({
      data: { id: 1, email: 'john@example.com', first_name: 'John', last_name: 'Doe' },
      error: null,
    });
    // Token insert via RPC succeeds
    mockDatabase.rpc.mockResolvedValueOnce({ data: true, error: null });

    await signup(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: null, error: null });
  });

  // TC-01 variant: accepts camelCase field names (firstName/lastName)
  it('TC-01b: should accept camelCase firstName/lastName fields', async () => {
    const req = createMockRequest({
      body: {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        password: 'password123',
      },
    });
    const res = createMockResponse();

    mockSupabaseChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    mockSupabaseChain.single.mockResolvedValueOnce({
      data: { id: 2, email: 'jane@example.com', first_name: 'Jane', last_name: 'Smith' },
      error: null,
    });
    mockDatabase.rpc.mockResolvedValueOnce({ data: true, error: null });

    await signup(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  // TC-02: Reject password below minimum — BVA (below boundary: 5 chars)
  it('TC-02: should reject password with 5 characters (below minimum boundary)', async () => {
    const req = createMockRequest({
      body: {
        first_name: 'John',
        email: 'john@example.com',
        password: 'Ab1c5',  // 5 characters
      },
    });
    const res = createMockResponse();

    await signup(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'password_too_short' }),
      })
    );
  });

  // TC-03: Accept minimum password length — BVA (at boundary: 6 chars)
  it('TC-03: should accept password with exactly 6 characters (minimum boundary)', async () => {
    const req = createMockRequest({
      body: {
        first_name: 'John',
        email: 'john@example.com',
        password: 'Abc123',  // 6 characters
      },
    });
    const res = createMockResponse();

    mockSupabaseChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    mockSupabaseChain.single.mockResolvedValueOnce({
      data: { id: 3, email: 'john@example.com', first_name: 'John', last_name: null },
      error: null,
    });
    mockDatabase.rpc.mockResolvedValueOnce({ data: true, error: null });

    await signup(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  // TC-04: Accept value above password boundary — BVA (above boundary: 7 chars)
  it('TC-04: should accept password with 7 characters (above minimum boundary)', async () => {
    const req = createMockRequest({
      body: {
        first_name: 'John',
        email: 'john@example.com',
        password: 'Abc1234',  // 7 characters
      },
    });
    const res = createMockResponse();

    mockSupabaseChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    mockSupabaseChain.single.mockResolvedValueOnce({
      data: { id: 4, email: 'john@example.com', first_name: 'John', last_name: null },
      error: null,
    });
    mockDatabase.rpc.mockResolvedValueOnce({ data: true, error: null });

    await signup(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  // EP — invalid: missing required fields
  it('should reject signup when email is missing', async () => {
    const req = createMockRequest({
      body: { first_name: 'John', password: 'password123' },
    });
    const res = createMockResponse();

    await signup(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'fields_required' }),
      })
    );
  });

  it('should reject signup when first name is missing', async () => {
    const req = createMockRequest({
      body: { email: 'john@example.com', password: 'password123' },
    });
    const res = createMockResponse();

    await signup(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'fields_required' }),
      })
    );
  });

  // EP — invalid: duplicate user
  it('should reject signup when user already exists', async () => {
    const req = createMockRequest({
      body: {
        first_name: 'John',
        email: 'existing@example.com',
        password: 'password123',
      },
    });
    const res = createMockResponse();

    mockSupabaseChain.maybeSingle.mockResolvedValueOnce({
      data: { id: 10, is_verified: true, active_status: 'active', deleted_at: null },
      error: null,
    });

    await signup(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'user_exists' }),
      })
    );
  });
});
