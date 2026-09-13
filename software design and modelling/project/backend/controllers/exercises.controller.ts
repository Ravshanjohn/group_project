import { type Request, type Response } from 'express';
import { database } from '../lib/db.js';
import { handleControllerError } from '../lib/utils.js';
import { type CreateExercisePayload } from '../constants/types.js';


export const getExerciseBySlug = async (req: Request, res: Response) => {
  const { slug } = req.params;
  if (!slug) return res.status(400).json({ data: null, error: { code: 'slug_required', message: 'Slug is required' } });

  try {
    const { data: exercise, error } = await database
      .from('exercise')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error) return res.status(400).json({ data: null, error: { code: 'exercise_fetch_failed', message: error.message || 'Failed to fetch exercise' } });
    if (!exercise) return res.status(404).json({ data: null, error: { code: 'exercise_not_found', message: 'Exercise not found' } });

    return res.status(200).json({ data: exercise, error: null });
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
    
    if (error) return res.status(400).json({ data: null, error: { code: 'exercises_fetch_failed', message: error.message || 'Failed to fetch exercises' } });

    return res.status(200).json({ data: exercises, error: null });
  } catch (error) {
    return handleControllerError(res, error, "getAllExercises controller");
  }
};

export const getTestCase = async (req: Request, res: Response) => {
  const { slug } = req.params;
  if (!slug) return res.status(400).json({ data: null, error: { code: 'slug_required', message: 'Slug is required' } });

  try {
    const {data, error} = await database
      .rpc('get_exercise_test_case', { param_exercise_slug: slug });

    if (error) return res.status(400).json({ data: null, error: { code: 'test_case_fetch_failed', message: error.message || 'Failed to fetch exercise test case' } });
    if (!data) return res.status(404).json({ data: null, error: { code: 'test_case_not_found', message: 'Exercise test case not found' } });

    return res.status(200).json({ data, error: null });
  } catch (error) {
    return handleControllerError(res, error, "getTestCase controller");
  }
};

export const getExerciseSignature = async (req: Request, res: Response) => {
  const { slug } = req.params;
  if (!slug) return res.status(400).json({ data: null, error: { code: 'slug_required', message: 'Slug is required' } });

  try {
    const { data, error } = await database
      .rpc('get_exercise_signature', { param_exercise_slug: slug })
      .maybeSingle();
    if (error) return res.status(400).json({ data: null, error: { code: 'signature_fetch_failed', message: error.message || 'Failed to fetch exercise signature' } });
    if (!data) return res.status(404).json({ data: null, error: { code: 'signature_not_found', message: 'Exercise signature not found' } });

    return res.status(200).json({ 
      data,
      error: null
    });
  } catch (error) {
    return handleControllerError(res, error, "getExerciseSignature controller");
  }
}

export const getInitialCode = async (req: Request, res: Response) => {
  const { slug } = req.params;
  const language_id = req.query.language_id as string;
  const userId = (req as any).user?.id;

  if (!slug) return res.status(400).json({ data: null, error: { code: 'slug_required', message: 'Slug is required' } });
  if (!language_id) return res.status(400).json({ data: null, error: { code: 'language_id_required', message: 'Language ID is required' } });
  if (!userId) return res.status(401).json({ data: "unauthorized", error: {code: "user_not_found",message: "User not found"} });

  try {
    const { data, error } = await database
      .rpc('get_exercise_initial_code', { param_exercise_slug: slug, param_language_id: language_id, param_user_id: userId })
      .maybeSingle();

    if (error) return res.status(400).json({ data: null, error: { code: 'initial_code_fetch_failed', message: error.message || 'Failed to fetch initial code' } });
    if (!data) return res.status(404).json({ data: null, error: { code: 'initial_code_not_found', message: 'Initial code not found' } });

    return res.status(200).json({ 
      data,
      error: null
    });
  } catch (error) {
    return handleControllerError(res, error, "getInitialCode controller");
  }
};

export const getExerciseLanguages = async (req: Request, res: Response) => {
  const { slug } = req.params;
  if (!slug) return res.status(400).json({ data: null, error: { code: 'slug_required', message: 'Slug is required' } });

  try {
    const { data, error } = await database
      .rpc('get_exercise_languages', { param_exercise_slug: slug });
    if (error) return res.status(400).json({ data: null, error: { code: 'languages_fetch_failed', message: error.message || 'Failed to fetch exercise languages' } });
    if (!data) return res.status(404).json({ data: null, error: { code: 'languages_not_found', message: 'Exercise languages not found' } });
  
    return res.status(200).json({ 
      data,
      error: null
    });
  } catch (error) {
    return handleControllerError(res, error, "getExerciseLanguages controller");
  }
};

export const recordExerciseEvent = async (req: Request, res: Response) => {
  const { slug } = req.params;
  const userId = (req as any).user?.id;
  const { language_id, reason, code} : { language_id: number; reason: string; code: string } = req.body;

  if (!slug) return res.status(400).json({ data: null, error: { code: 'slug_required', message: 'Slug is required' } });
  if (!userId) return res.status(401).json({ data: "unauthorized", error: {code: "user_not_found",message: "User not found"} });
  if (!language_id) return res.status(400).json({ data: null, error: { code: 'language_id_required', message: 'Language ID is required' } });
  if (!reason) return res.status(400).json({ data: null, error: { code: 'reason_required', message: 'Reason is required' } });
  if (!code) return res.status(400).json({ data: null, error: { code: 'code_required', message: 'Code is required' } });

  try {
    const { data, error } = await database
      .rpc('record_user_exercise_event', {
        param_user_id: userId,
        param_exercise_slug: slug,
        param_language_id: language_id,
        param_reason: reason,
        param_code: code
      });
    if (error) return res.status(400).json({ data: null, error: { code: 'exercise_event_failed', message: error.message || 'Failed to record exercise event' } });

    return res.status(200).json({
      data: null,
      error: null
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
  
  if(error) return res.status(400).json({ data: null, error: { code: 'exercise_creation_failed', message: error.message || 'Failed to create exercise' } });
  if(!data) return res.status(500).json({ data: null, error: { code: 'exercise_creation_failed', message: 'Exercise creation failed' } });
  
  return res.status(201).json({ data, error: null });
  } catch (error) {
    return handleControllerError(res, error, "createExercise controller");
  }
};

export const getMaps = async (req: Request, res: Response) => {
  try {
    const { data, error } = await database
      .from('maps')
      .select('*');
    if (error) return handleControllerError(res, error, "getMaps controller");

    return res.status(200).json({ data: data ?? [], error: null });
  } catch (error) {
    return handleControllerError(res, error, "getMaps controller");
  }
};

export const getMapExercises = async (req: Request, res: Response) => {
  try {
    const { data, error } = await database
      .from('maps')
      .select('id, exercises_id');

    if (error) return handleControllerError(res, error, "getMapExercises controller");

    return res.status(200).json({
      data: data ?? [],
      error: null,
    });
  } catch (error) {
    return handleControllerError(res, error, "getMapExercises controller");
  };
};



