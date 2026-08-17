import { type Request, type Response } from 'express';
import { database } from '../lib/db.js';
import { handleControllerError } from '../lib/utils.js';
import { type CreateExercisePayload } from '../constants/types.js';


export const getExerciseBySlug = async (req: Request, res: Response) => {
  const { slug } = req.params;
  if (!slug) return res.status(400).json({ message: 'Slug is required' });

  try {
    const exercise = await database
      .from('exercise')
      .select('*')
      .eq('slug', slug)
      .single();

    if (!exercise)  return res.status(404).json({ message: 'Exercise not found' });
    
    return res.status(200).json({ exercise, success: true });
  } catch (error) {
    return handleControllerError(res, error, "getExerciseBySlug controller");
  }
};

export const getAllExercises = async (req: Request, res: Response) => {
  try {
    const { data: exercises, error } = await database
      .from('exercise')
      .select('*')
      .order('position', { ascending: true });
    
    if (error) return res.status(400).json({ message: error.message || 'Failed to fetch exercises' });

    return res.status(200).json({ exercises, success: true });
  } catch (error) {
    return handleControllerError(res, error, "getAllExercises controller");
  }
};

export const getTestCase = async (req: Request, res: Response) => {
  const { slug } = req.params;
  if (!slug) return res.status(400).json({ message: 'Slug is required' });

  try {
    const {data, error} = await database
      .rpc('get_exercise_test_case', { param_exercise_slug: slug });

    if (error) return res.status(400).json({ message: error.message || 'Failed to fetch exercise test case' });
    if (!data) return res.status(404).json({ message: 'Exercise test case not found' });

    return res.status(200).json({ output: data, success: true });
  } catch (error) {
    return handleControllerError(res, error, "getTestCase controller");
  }
};

export const getExerciseSignature = async (req: Request, res: Response) => {
  const { slug } = req.params;
  if (!slug) return res.status(400).json({ message: 'Slug is required' });

  try {
    const { data, error } = await database
      .rpc('get_exercise_signature', { param_exercise_slug: slug })
      .maybeSingle();
    if (error) return res.status(400).json({ message: error.message || 'Failed to fetch exercise signature' });
    if (!data) return res.status(404).json({ message: 'Exercise signature not found' });

    return res.status(200).json({ 
      success: true,
      signature: data,
      message: 'Exercise signature fetched successfully'
    });
  } catch (error) {
    return handleControllerError(res, error, "getExerciseSignature controller");
  }
}

export const getInitialCode = async (req: Request, res: Response) => {
  const { slug } = req.params;
  const language_id = req.query.language_id as string;
  const userId = (req as any).user?.id;

  if (!slug) return res.status(400).json({ message: 'Slug is required' });
  if (!language_id) return res.status(400).json({ message: 'Language ID is required' });
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const { data, error } = await database
      .rpc('get_exercise_initial_code', { param_exercise_slug: slug, param_language_id: language_id, param_user_id: userId })
      .maybeSingle();

    if (error) return res.status(400).json({ message: error.message || 'Failed to fetch initial code' });
    if (!data) return res.status(404).json({ message: 'Initial code not found' });

    return res.status(200).json({ 
      success: true,
      initial_code: data,
      message: 'Initial code fetched successfully'
    });
  } catch (error) {
    return handleControllerError(res, error, "getInitialCode controller");
  }
};

export const getExerciseLanguages = async (req: Request, res: Response) => {
  const { slug } = req.params;
  if (!slug) return res.status(400).json({ message: 'Slug is required' });

  try {
    const { data, error } = await database
      .rpc('get_exercise_languages', { param_exercise_slug: slug });
    if (error) return res.status(400).json({ message: error.message || 'Failed to fetch exercise languages' });
    if (!data) return res.status(404).json({ message: 'Exercise languages not found' });
  
    return res.status(200).json({ 
      success: true,
      languages: data,
      message: 'Exercise languages fetched successfully'
    });
  } catch (error) {
    return handleControllerError(res, error, "getExerciseLanguages controller");
  }
};

export const recordExerciseEvent = async (req: Request, res: Response) => {
  const { slug } = req.params;
  const userId = (req as any).user?.id;
  const { language_id, reason, code} : { language_id: number; reason: string; code: string } = req.body;

  if (!slug) return res.status(400).json({ message: 'Slug is required' });
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });
  if (!language_id) return res.status(400).json({ message: 'Language ID is required' });
  if (!reason) return res.status(400).json({ message: 'Reason is required' });
  if (!code) return res.status(400).json({ message: 'Code is required' });

  try {
    const { data, error } = await database
      .rpc('record_user_exercise_event', {
        param_user_id: userId,
        param_exercise_slug: slug,
        param_language_id: language_id,
        param_reason: reason,
        param_code: code
      });
    if (error) return res.status(400).json({ message: error.message || 'Failed to record exercise event' });

    return res.status(200).json({
      success: true,
      message: 'Exercise event recorded successfully'
    });
  } catch (error) {
    return handleControllerError(res, error, "RecordExerciseEvent controller");
  }
};



export const createExercise = async (req: Request, res: Response) => {
  try {
  //Request body should match the CreateExercisePayload type
  const payload : CreateExercisePayload = req.body;

  const {data, error} = await database.rpc('create_exercise', { payload });
  
  if(error) return res.status(400).json({ message: error.message || 'Failed to create exercise' });
  if(!data) return res.status(500).json({ message: 'Exercise creation failed' });
  
  return res.status(201).json(data);
  } catch (error) {
    return handleControllerError(res, error, "createExercise controller");
  }
};



