import { type Request, type Response } from 'express';
import { database } from '../lib/db.js';
import { handleControllerError } from '../lib/utils.js';

// export const count_user_authenticated = async (req: Request, res: Response) => {
//   try {
//     const { data, error } = await database
//       .rpc('count_user_authenticated')
//     if (error) {
//       console.error('Error counting authenticated users:', error);
//       return res.status(500).json({ success: false, message: 'Failed to count authenticated users' });
//     };

//     return res.json({ success: true, count: data });
//   } catch (error) {
//     return handleControllerError(res, error, "count_user_authenticated controller");
//   };
// };

// export const count_user_all = async (req: Request, res: Response) => {
//   try {
//     const { data, error } = await database 
//       .rpc('count_user_all')
//     if (error) {
//       console.error('Error counting all users:', error);
//       return res.status(500).json({ success: false, message: 'Failed to count all users' });
//     };

//     return res.json({ success: true, count: data });
//   } catch (error) {
//     return handleControllerError(res, error, "count_user_all controller");
//   };
// }; 

export const getExercises = async (req: Request, res: Response) => {
  try {
    const { data, error } = await database
      .rpc('get_admin_exercises')
    if (error) return handleControllerError(res, error, "getExercises controller");


    return res.json({ data: data ?? null, error: null});
  } catch (error) {
    return handleControllerError(res, error, "getExercises controller");
  }
}

export const getMapExercises = async (req: Request, res: Response) => {
  const { map_id } = req.params;
  try {
    const { data, error } = await database
      .rpc('admin_get_map_exercises', { p_map_id: map_id })
    if (error) return handleControllerError(res, error, "getMapExercises controller");

    return res.json({ data: data ?? [], error: null});
  } catch (error) {
    return handleControllerError(res, error, "getMapExercises controller");
  };
};

export const addExerciseToMap = async (req: Request, res: Response) => {
  const { map_id, exercise_id } = req.params;
  try {
    const { data, error } = await database
      .rpc('admin_add_map_exercise', { p_map_id: map_id, p_exercise_id: exercise_id });
    if (error) return handleControllerError(res, error, "addExerciseToMap controller");

    return res.json({ data: null, error: null });
  } catch (error) {
    return handleControllerError(res, error, "addExerciseToMap controller");
  };
};

export const setExerciseXP = async (req: Request, res: Response) => {
  const { exercise_id } = req.params;
  const { xp } = req.body;

  try {
    const { data, error } = await database
      .from("exercise")
      .update({ xp_need: xp })
      .eq("id", exercise_id)
      .select("xp_need")
      .maybeSingle<{ xp: number }>();
    
    if (error) { return handleControllerError(res, error, "setExerciseXP controller"); }

    return res.status(200).json({ data, error: null });
  } catch (error) {
    return handleControllerError(res, error, "setExerciseXP controller");
  }
}

export const removeExerciseFromMap = async (req: Request, res: Response) => {
  const { map_id, exercise_id } = req.params;
  try {
    const { data, error } = await database
      .rpc('admin_remove_map_exercise', { p_map_id: map_id, p_exercise_id: exercise_id });
    if (error) return handleControllerError(res, error, "removeExerciseFromMap controller");

    return res.json({ data: null, error: null });
  } catch (error) {
    return handleControllerError(res, error, "removeExerciseFromMap controller");
  };
};

export const getMaps = async (req: Request, res: Response) => {
  try {
    const { data, error } = await database
      .from('maps')
      .select('*')
    if (error) return handleControllerError(res, error, "getMaps controller");

    return res.json({ data: data ?? null, error: null});
  } catch (error) {
    return handleControllerError(res, error, "getMaps controller");
  }
}

export const changeExerciseStatus = async (req: Request, res: Response) => {
  const { exercise_id } = req.params;
  const { status } = req.body;

  try {
    const { data, error } = await database
      .rpc('change_admin_exercise_status', { 
        p_exercise_id: exercise_id, 
        p_access_level: status 
      });
    if (error) return handleControllerError(res, error, "changeExerciseStatus controller");

    return res.json({ data: data ?? null, error: null });
  } catch (error) {
    return handleControllerError(res, error, "changeExerciseStatus controller");
  };
};

export const changeExerciseDifficulty = async (req: Request, res: Response) => {
  const { exercise_id } = req.params;
  const { difficulty } = req.body;

  try {
    const { data, error } = await database
      .rpc('change_admin_exercise_difficulty', { 
        p_exercise_id: exercise_id, 
        p_difficulty: difficulty 
      });
    if (error) return handleControllerError(res, error, "changeExerciseDifficulty controller"); 
  
  return res.json({ data: data ?? null, error: null });
  } catch (error) {
    return handleControllerError(res, error, "changeExerciseDifficulty controller");
  };
};

export const diactivateActivateExercise = async (req: Request, res: Response) => {
  const { exercise_id } = req.params;
  if (!exercise_id) {
    return res.status(400).json({ data: null, error: { code: "fields_required", message: 'Exercise ID is required' } });
  }
  try {
    const { data, error } = await database
      .rpc('admin_diactivate_activate_exercise', { 
        p_exercise_id: exercise_id
      });
    if (error) return handleControllerError(res, error, "diactivateActivateExercise controller");

    return res.json({ data: data ?? null, error: null });
  } catch (error) {
    return handleControllerError(res, error, "diactivateActivateExercise controller");
  };
};