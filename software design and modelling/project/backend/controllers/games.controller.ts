import { type Request, type Response } from 'express';
import { database } from '../lib/db.js';
import { handleControllerError } from '../lib/utils.js';



export const getGameBySlug = async (req: Request, res: Response) => {
  const { slug } = req.params;
  if(!slug) return res.status(400).json({ data: null, error: { code: "game_slug_required", message: "Game slug is required" } });
  try {
    const {data, error} = await database
      .from('games')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    if (error) {
      console.log('Error fetching game:', error);
      throw new Error(error.message);
    };

    if (!data) return res.status(404).json({ data: null, error: { code: "game_not_found", message: "Game not found" } });
    if (!data.is_active || data.deleted_at) return res.status(400).json({ data: null, error: { code: "game_not_active", message: "Game is not active" } });
    return res.status(200).json({ data, error: null });
  } catch (error) {
    return handleControllerError(res, error, "getGameBySlug controller");
  }
};

export const getAllActiveGames = async (req: Request, res: Response) => {
  try {
    const {data, error} = await database
      .rpc('fetch_all_games_active');
    if (error) {
      console.log('Error fetching all active games:', error);
      throw new Error(error.message);
    };

    return res.status(200).json({ data, error: null });
  } catch (error) {
    return handleControllerError(res, error, "getAllActiveGames controller");
  }
};

export const setUserBalance = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { amount } = req.body;
  if (amount === undefined || typeof amount !== 'number' || amount < 0) {
    return res.status(400).json({ data: null, error: { code: "invalid_amount", message: "A non-negative XP amount is required" } });
  }

  try {
    const { data: currentUser, error: fetchError } = await database
      .from("users")
      .select("balance")
      .eq("id", user.id)
      .maybeSingle<{ balance: number }>();

    if (fetchError) {
      return handleControllerError(res, fetchError, "setUserBalance controller");
    }

    const currentBalance = currentUser?.balance ?? 0;
    const newBalance = currentBalance + amount;

    const { data, error } = await database
      .from("users")
      .update({ balance: newBalance })
      .eq("id", user.id)
      .select("balance")
      .maybeSingle<{ balance: number }>();

    if (error) { return handleControllerError(res, error, "setUserBalance controller"); }

    return res.status(200).json({ data: data ?? { balance: newBalance }, error: null });
  } catch (error) {
    return handleControllerError(res, error, "setUserBalance controller");
  }
}

export const setUserScore = async (req: Request, res: Response) => {
  const user = (req as any).user;

  const { game_slug, score, status, difficulty } = req.body;
  if(!game_slug || score === undefined || !status || !difficulty) return res.status(400).json({ data: null, error: { code: "score_fields_required", message: "Game slug, score, status and difficulty are required" } });


  try {
    const { data, error } = await database
      .rpc('set_user_score', {
        param_user_id: user.id,
        param_game_slug: game_slug,
        param_score: score,
        param_status: status,
        param_difficulty: difficulty.toLowerCase()
      });

    if (error) {
      console.log('Error setting score:', error);
      throw new Error(error.message);
    }
    return res.status(200).json({ data, error: null });
  } catch (error) {
    return handleControllerError(res, error, "setUserScore controller");
  }
};

export const getScoresByDifficulty = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { game_slug, difficulty } = req.query;
  if (!game_slug || !difficulty) return res.status(400).json({ data: null, error: { code: "leaderboard_fields_required", message: "Game slug and difficulty are required" } });

  try {
    const { data, error } = await database
      .rpc('get_game_leaderboard', {
        param_game_slug: game_slug,
        param_difficulty: difficulty.toString().toLowerCase()
      });
    if (error) {
      console.log('Error fetching leaderboard:', error);
      throw new Error(error.message);
    };

    return res.status(200).json({ data, error: null });
  } catch (error) {
    return handleControllerError(res, error, "getScoresByDifficulty controller");
  }
};

export const findUserScore = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { game_slug, difficulty } = req.query;

  if (!game_slug || !difficulty) return res.status(400).json({ data: null, error: { code: "score_fields_required", message: "Game slug and difficulty are required" } });

  try {
    const { data, error } = await database
      .rpc('find_active_session', {
        param_user_id: user.id,
        param_game_slug: game_slug,
        param_difficulty: difficulty.toString().toLowerCase()
      });
    if (error) {
      console.log('Error finding user score:', error);
      throw new Error(error.message);
    };
    return res.status(200).json({ data, error: null });
  } catch (error) {
    return handleControllerError(res, error, "findUserScore controller");
  }
};

export const getUserXP = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  try {
    const {data, error} = await database
      .from('users')
      .select('balance')
      .eq('id', userId)
      .maybeSingle();

    if (error) return handleControllerError(res, error, "getUserXP controller");

    return res.status(200).json({ data: data?.balance || 0, error: null });
  } catch (error) {
    return handleControllerError(res, error, "getUserXP controller");
  }
}