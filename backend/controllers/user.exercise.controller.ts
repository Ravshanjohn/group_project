import { type Request, type Response } from 'express';
import { database } from '../lib/db.js';
import { handleControllerError } from '../lib/utils.js';


export const setUserExerciseStatus = async (req: Request, res: Response) => {
  const { slug } = req.params;
  const { status } = req.body;
  const userId = (req as any).user?.id;

  if (!slug) return res.status(400).json({ message: 'Slug is required' });
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const { data, error } = await database
      .rpc('set_user_exercise_status', { 
        param_user_id: userId, 
        param_exercise_slug: slug, 
        param_status_exercise: status 
      });
    if (error) return res.status(400).json({ message: error.message || 'Failed to set exercise status' });

    return res.status(200).json({ 
      success: true,
      message: 'Exercise status updated successfully'
    });
  } catch (error) {
    return handleControllerError(res, error, "setUserExerciseStatus controller");
  }
};

export const setUserExerciseViewed = async (req: Request, res: Response) => {
  const { slug } = req.params;
  const userId = (req as any).user?.id;

  if (!slug) return res.status(400).json({ message: 'Slug is required' });
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const { data, error } = await database
      .rpc('set_user_exercise_viewed', { 
        param_user_id: userId, 
        param_exercise_slug: slug 
      });
    if (error) return res.status(400).json({ message: error.message || 'Failed to set exercise viewed status' });

    return res.status(200).json({ 
      success: true,
      message: 'Exercise viewed status set successfully'
    });
  } catch (error) {
    return handleControllerError(res, error, "setUserExerciseViewed controller");
  }
};

export const getUserCode = async (req: Request, res: Response) => {
  const { slug } = req.params;
  const userId = (req as any).user?.id;
  const  {language_id}  = req.query;

  if (!slug) return res.status(400).json({ message: 'Slug is required' });
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });
  if (!language_id) return res.status(400).json({ message: 'Language ID is required' });

  try {
    const { data, error } = await database
      .rpc('get_user_code', { 
        param_user_id: userId, 
        param_exercise_slug: slug,
        param_language_id: language_id
      })
      .maybeSingle(); 
    if (error) return res.status(400).json({ message: error.message || 'Failed to fetch user code' });
    if (!data) return res.status(404).json({ message: 'User code not found' });

    return res.status(200).json({ 
      success: true,
      user_code: data,
      message: 'User code fetched successfully'
    });
  } catch (error) {
    return handleControllerError(res, error, "getUserCode controller");
  }
};

export const saveUserCode = async (req: Request, res: Response) => {
  const { slug } = req.params;
  const userId = (req as any).user?.id;
  const { code, language_id } = req.body;

  if (!slug) return res.status(400).json({ message: 'Slug is required' });
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });
  if (!code) return res.status(400).json({ message: 'Code is required' });
  if (!language_id) return res.status(400).json({ message: 'Language ID is required' });

  try {
    const { data, error } = await database
      .rpc('save_user_code', { 
        param_user_id: userId, 
        param_exercise_slug: slug,
        param_user_code: code,
        param_language_id: language_id
      });
    if (error) return res.status(400).json({ message: error.message || 'Failed to save user code' });
    
    return res.status(200).json({ 
      success: true,
      message: 'User code saved successfully'
    });
  } catch (error) {
    return handleControllerError(res, error, "saveUserCode controller");
  }
};

export const setUserExerciseCompleted = async (req: Request, res: Response) => {
  const { slug } = req.params;
  const userId = (req as any).user?.id;
  
  if (!slug) return res.status(400).json({ message: 'Slug is required' });
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const { data, error } = await database
      .rpc('set_user_exercise_completed', { 
        param_user_id: userId, 
        param_exercise_slug: slug, 
      });
    if (error) return res.status(400).json({ message: error.message || 'Failed to set exercise completed' });

    return res.status(200).json({
      success: true,
      message: 'Exercise marked as completed'
    });
  } catch (error) {
    return handleControllerError(res, error, "setUserExerciseCompleted controller");
  }
};

export const getUserExerciseCompleted = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const { data, error } = await database
      .rpc('get_user_exercise_completed', { 
        param_user_id: userId,
      });
    
    if (error) return res.status(400).json({ message: error.message || 'Failed to fetch completed exercises' });
    if (!data) return res.status(404).json({ message: 'No completed exercises found' });

    return res.status(200).json({
      success: true, 
      completed_exercises: data, 
      message: 'Completed exercises fetched successfully' 
    });
  } catch (error) {
    return handleControllerError(res, error, "getUserExerciseCompleted controller");
  }
};


