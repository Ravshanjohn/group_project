import { vi } from 'vitest';

// Mock environment variables
vi.stubEnv('JWT_SECRET', 'test-jwt-secret-key-for-testing');
vi.stubEnv('NODE_ENV', 'test');
vi.stubEnv('DATABASE_URL', 'https://fake-supabase.supabase.co');
vi.stubEnv('DATABASE_KEY', 'fake-key');
vi.stubEnv('CLIENT_URL', 'http://localhost:4001');

// Mock Supabase database
const mockSupabaseChain = {
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn(),
  maybeSingle: vi.fn(),
  order: vi.fn().mockReturnThis(),
};

const mockDatabase = {
  from: vi.fn(() => mockSupabaseChain),
  rpc: vi.fn(),
};

vi.mock('../lib/db.js', () => ({
  database: mockDatabase,
}));

// Mock email functions
vi.mock('../email/email.js', () => ({
  sendVerificationEmail: vi.fn().mockResolvedValue(true),
  sendWelcomeEmail: vi.fn().mockResolvedValue(true),
  sendPasswordResetEmail: vi.fn().mockResolvedValue(true),
  sendResetSuccessEmail: vi.fn().mockResolvedValue(true),
}));

// Helper to create mock Express request/response
export function createMockRequest(overrides: Record<string, any> = {}) {
  return {
    body: {},
    params: {},
    query: {},
    cookies: {},
    headers: {},
    ip: '127.0.0.1',
    ...overrides,
  } as any;
}

export function createMockResponse() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.cookie = vi.fn().mockReturnValue(res);
  return res;
}

export { mockDatabase, mockSupabaseChain };
