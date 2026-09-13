import { type Request, type Response } from 'express';
import { database } from '../lib/db.js';
import { handleControllerError } from '../lib/utils.js';


export const setUserExerciseStatus = async (req: Request, res: Response) => {
  const { slug } = req.params;
  const { status } = req.body;
  const userId = (req as any).user?.id;

  if (!slug) return res.status(400).json({ data: null, error: { code: 'slug_required', message: 'Slug is required' } });
  if (!userId) return res.status(401).json({ data: "unauthorized", error: {code: "user_not_found",message: "User not found"} });

  try {
    const { data, error } = await database
      .rpc('set_user_exercise_status', { 
        param_user_id: userId, 
        param_exercise_slug: slug, 
        param_status_exercise: status 
      });
    if (error) return res.status(400).json({ data: null, error: { code: 'exercise_status_failed', message: error.message || 'Failed to set exercise status' } });

    return res.status(200).json({ 
      data: null,
      error: null
    });
  } catch (error) {
    return handleControllerError(res, error, "setUserExerciseStatus controller");
  }
};

export const setUserExerciseViewed = async (req: Request, res: Response) => {
  const { slug } = req.params;
  const userId = (req as any).user?.id;

  if (!slug) return res.status(400).json({ data: null, error: { code: 'slug_required', message: 'Slug is required' } });
  if (!userId) return res.status(401).json({ data: "unauthorized", error: {code: "user_not_found",message: "User not found"} });

  try {
    const { data, error } = await database
      .rpc('set_user_exercise_viewed', { 
        param_user_id: userId, 
        param_exercise_slug: slug 
      });
    if (error) return res.status(400).json({ data: null, error: { code: 'exercise_viewed_failed', message: error.message || 'Failed to set exercise viewed status' } });

    return res.status(200).json({ 
      data: null,
      error: null
    });
  } catch (error) {
    return handleControllerError(res, error, "setUserExerciseViewed controller");
  }
};

export const getUserCode = async (req: Request, res: Response) => {
  const { slug } = req.params;
  const userId = (req as any).user?.id;
  const  {language_id}  = req.query;

  if (!slug) return res.status(400).json({ data: null, error: { code: 'slug_required', message: 'Slug is required' } });
  if (!userId) return res.status(401).json({ data: "unauthorized", error: {code: "user_not_found",message: "User not found"} });
  if (!language_id) return res.status(400).json({ data: null, error: { code: 'language_id_required', message: 'Language ID is required' } });

  try {
    const { data, error } = await database
      .rpc('get_user_code', { 
        param_user_id: userId, 
        param_exercise_slug: slug,
        param_language_id: language_id
      })
      .maybeSingle(); 
    if (error) return res.status(400).json({ data: null, error: { code: 'user_code_fetch_failed', message: error.message || 'Failed to fetch user code' } });
    if (!data) return res.status(404).json({ data: null, error: { code: 'user_code_not_found', message: 'User code not found' } });

    return res.status(200).json({ 
      data,
      error: null
    });
  } catch (error) {
    return handleControllerError(res, error, "getUserCode controller");
  }
};

export const saveUserCode = async (req: Request, res: Response) => {
  const { slug } = req.params;
  const userId = (req as any).user?.id;
  const { code, language_id } = req.body;

  if (!slug) return res.status(400).json({ data: null, error: { code: 'slug_required', message: 'Slug is required' } });
  if (!userId) return res.status(401).json({ data: "unauthorized", error: {code: "user_not_found",message: "User not found"} });
  if (!code) return res.status(400).json({ data: null, error: { code: 'code_required', message: 'Code is required' } });
  if (!language_id) return res.status(400).json({ data: null, error: { code: 'language_id_required', message: 'Language ID is required' } });

  try {
    const { data, error } = await database
      .rpc('save_user_code', { 
        param_user_id: userId, 
        param_exercise_slug: slug,
        param_user_code: code,
        param_language_id: language_id
      });
    if (error) return res.status(400).json({ data: null, error: { code: 'user_code_save_failed', message: error.message || 'Failed to save user code' } });
    
    return res.status(200).json({ 
      data: null,
      error: null
    });
  } catch (error) {
    return handleControllerError(res, error, "saveUserCode controller");
  }
};

export const setUserExerciseCompleted = async (req: Request, res: Response) => {
  const { slug } = req.params;
  const userId = (req as any).user?.id;
  
  if (!slug) return res.status(400).json({ data: null, error: { code: 'slug_required', message: 'Slug is required' } });
  if (!userId) return res.status(401).json({ data: "unauthorized", error: {code: "user_not_found",message: "User not found"} });

  try {
    const { data, error } = await database
      .rpc('set_user_exercise_completed', { 
        param_user_id: userId, 
        param_exercise_slug: slug, 
      });
    if (error) return res.status(400).json({ data: null, error: { code: 'exercise_completed_failed', message: error.message || 'Failed to set exercise completed' } });

    return res.status(200).json({
      data: null,
      error: null
    });
  } catch (error) {
    return handleControllerError(res, error, "setUserExerciseCompleted controller");
  }
};

export const getUserExerciseCompleted = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  if (!userId) return res.status(401).json({ data: "unauthorized", error: {code: "user_not_found",message: "User not found"} });

  try {
    const { data, error } = await database
      .rpc('get_user_exercise_completed', { 
        param_user_id: userId,
      });
    
    if (error) return res.status(400).json({ data: null, error: { code: 'completed_exercises_fetch_failed', message: error.message || 'Failed to fetch completed exercises' } });
    if (!data) return res.status(404).json({ data: null, error: { code: 'completed_exercises_not_found', message: 'No completed exercises found' } });

    return res.status(200).json({
      data,
      error: null
    });
  } catch (error) {
    return handleControllerError(res, error, "getUserExerciseCompleted controller");
  }
};

export const getUserUnlockedExercises = async (req: Request, res: Response) => {
  const user_id = (req as any).user?.id;

  if (!user_id) return res.status(401).json({ data: "unauthorized", error: {code: "user_not_found",message: "User not found"} });

  try {
    const { data, error } = await database
      .from("exercise_unlocked")
      .select("*")
      .eq("user_id", user_id);
    
    return res.status(200).json({
      data: data ?? [],
      error: null
    });
  } catch (error) {
    return handleControllerError(res, error, "getUserUnlockedExercises controller");
  };
};

export const getUserSubscribedMaps = async (req: Request, res: Response) => {
  const user_id = (req as any).user?.id;

  if (!user_id) return res.status(401).json({ data: "unauthorized", error: {code: "user_not_found",message: "User not found"} });

  try {
    const { data, error } = await database
      .from("map_subscription")
      .select("*")
      .eq("user_id", user_id);
    
    return res.status(200).json({
      data: data ?? [],
      error: null
    });
  } catch (error) {
    return handleControllerError(res, error, "getUserUnlockedExercises controller");
  };
};


