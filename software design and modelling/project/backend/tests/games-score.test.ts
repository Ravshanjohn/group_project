import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest, createMockResponse, mockDatabase, mockSupabaseChain } from './setup.js';
import { setUserScore, getScoresByDifficulty, getGameBySlug, getAllActiveGames, setUserBalance } from '../controllers/games.controller.js';

describe('Games & Score Controller — Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // TC-11: Submit valid game score (EP, Medium)
  it('TC-11: should accept a valid game score submission', async () => {
    const req = createMockRequest({
      body: {
        game_slug: 'tic-tac-toe',
        score: 150,
        status: 'completed',
        difficulty: 'Easy',
      },
    });
    (req as any).user = { id: '1' };
    const res = createMockResponse();

    mockDatabase.rpc.mockResolvedValueOnce({ data: { id: 1 }, error: null });

    await setUserScore(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: null })
    );
    expect(mockDatabase.rpc).toHaveBeenCalledWith('set_user_score', {
      param_user_id: '1',
      param_game_slug: 'tic-tac-toe',
      param_score: 150,
      param_status: 'completed',
      param_difficulty: 'easy',
    });
  });

  // TC-12: Reject incomplete game-score payload (EP, Medium)
  it('TC-12: should reject score submission missing game_slug', async () => {
    const req = createMockRequest({
      body: { score: 150, status: 'completed', difficulty: 'Easy' },
    });
    (req as any).user = { id: '1' };
    const res = createMockResponse();

    await setUserScore(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'score_fields_required' }),
      })
    );
  });

  it('TC-12b: should reject score submission missing difficulty', async () => {
    const req = createMockRequest({
      body: { game_slug: 'snake', score: 100, status: 'completed' },
    });
    (req as any).user = { id: '1' };
    const res = createMockResponse();

    await setUserScore(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'score_fields_required' }),
      })
    );
  });

  it('TC-12c: should reject score submission missing status', async () => {
    const req = createMockRequest({
      body: { game_slug: 'snake', score: 100, difficulty: 'medium' },
    });
    (req as any).user = { id: '1' };
    const res = createMockResponse();

    await setUserScore(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  // Get game by slug — valid
  it('should return game data for valid slug', async () => {
    const req = createMockRequest({ params: { slug: 'tic-tac-toe' } });
    const res = createMockResponse();

    mockSupabaseChain.maybeSingle.mockResolvedValueOnce({
      data: { id: 1, slug: 'tic-tac-toe', name: 'Tic Tac Toe', is_active: true, deleted_at: null },
      error: null,
    });

    await getGameBySlug(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  // Get game by slug — not found
  it('should return 404 for non-existent game slug', async () => {
    const req = createMockRequest({ params: { slug: 'nonexistent-game' } });
    const res = createMockResponse();

    mockSupabaseChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null });

    await getGameBySlug(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  // Get game by slug — missing slug
  it('should return 400 when game slug is missing', async () => {
    const req = createMockRequest({ params: {} });
    const res = createMockResponse();

    await getGameBySlug(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  // Get all active games
  it('should return list of active games', async () => {
    const res = createMockResponse();
    const req = createMockRequest({});

    mockDatabase.rpc.mockResolvedValueOnce({
      data: [{ id: 1, slug: 'snake' }, { id: 2, slug: 'breakout' }],
      error: null,
    });

    await getAllActiveGames(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: null })
    );
  });

  // Leaderboard — missing required fields
  it('should reject leaderboard request without game_slug', async () => {
    const req = createMockRequest({ query: { difficulty: 'easy' } });
    (req as any).user = { id: '1' };
    const res = createMockResponse();

    await getScoresByDifficulty(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'leaderboard_fields_required' }),
      })
    );
  });

  // Leaderboard — valid request
  it('should return leaderboard for valid game and difficulty', async () => {
    const req = createMockRequest({
      query: { game_slug: 'snake', difficulty: 'Easy' },
    });
    (req as any).user = { id: '1' };
    const res = createMockResponse();

    mockDatabase.rpc.mockResolvedValueOnce({
      data: [
        { user_id: '1', score: 300, first_name: 'John' },
        { user_id: '2', score: 200, first_name: 'Jane' },
      ],
      error: null,
    });

    await getScoresByDifficulty(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  // Set user balance — valid
  it('should add XP to user balance', async () => {
    const req = createMockRequest({ body: { amount: 50 } });
    (req as any).user = { id: '1' };
    const res = createMockResponse();

    mockSupabaseChain.maybeSingle
      .mockResolvedValueOnce({ data: { balance: 100 }, error: null })   // fetch current
      .mockResolvedValueOnce({ data: { balance: 150 }, error: null });  // after update

    await setUserBalance(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  // Set user balance — invalid amount
  it('should reject negative XP amount', async () => {
    const req = createMockRequest({ body: { amount: -10 } });
    (req as any).user = { id: '1' };
    const res = createMockResponse();

    await setUserBalance(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'invalid_amount' }),
      })
    );
  });
});
