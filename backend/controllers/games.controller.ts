import { type Request, type Response } from 'express';
import { database } from '../lib/db.js';
import { handleControllerError } from '../lib/utils.js';



export const getGameBySlug = async (req: Request, res: Response) => {
  const { slug } = req.params;
  if(!slug) return res.status(400).json({ success: false, message: "Game slug is required" });
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

    if (!data) return res.status(404).json({ success: false, message: "Game not found" });
    if (!data.is_active || data.deleted_at) return res.status(400).json({ success: false, message: "Game is not active" });
    return res.status(200).json({ success: true, data: data });
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

    return res.status(200).json({ success: true, data: data });
  } catch (error) {
    return handleControllerError(res, error, "getAllActiveGames controller");
  }
};

export const setUserScore = async (req: Request, res: Response) => {
  const user = (req as any).user;

  const { game_slug, score, status, difficulty } = req.body;
  if(!game_slug || score === undefined || !status || !difficulty) return res.status(400).json({ 
    success: false, 
    message: "Game slug, score, status and difficulty are required" 
  });


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
    return res.status(200).json({ success: true, data: data });
  } catch (error) {
    return handleControllerError(res, error, "setUserScore controller");
  }
};

export const getScoresByDifficulty = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { game_slug, difficulty } = req.query;
  if (!game_slug || !difficulty) return res.status(400).json({ 
    success: false, 
    message: "Game slug and difficulty are required" 
  });

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

    return res.status(200).json({ success: true, data: data });
  } catch (error) {
    return handleControllerError(res, error, "getScoresByDifficulty controller");
  }
};

export const findUserScore = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { game_slug, difficulty } = req.body;

  if (!game_slug || !difficulty) return res.status(400).json({ 
    success: false, 
    message: "Game slug and difficulty are required" 
  });

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
    return res.status(200).json({ success: true, data: data });
  } catch (error) {
    return handleControllerError(res, error, "findUserScore controller");
  }
};