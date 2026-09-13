import express from 'express';
import { 
  getAllExercises, 
  getExerciseBySlug, 
  getExerciseLanguages, 
  getExerciseSignature, 
  getInitialCode, 
  getTestCase,  
  getMapExercises,
  getMaps,
  recordExerciseEvent,
  createExercise
} from '../controllers/exercises.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

// More specific routes MUST come before generic /:slug route
router.get('/exercises/maps', getMapExercises);
router.get('/maps', getMaps);
router.get('/exercises/initial-code/:slug', protectRoute, getInitialCode);
router.get('/exercises/test-case/:slug', getTestCase);
router.get('/exercises/signature/:slug', getExerciseSignature);
router.get('/exercises/get-exercise-languages/:slug', getExerciseLanguages);
router.get('/exercises', getAllExercises);
router.get('/exercises/:slug', getExerciseBySlug);



router.post('/exercises/record-exercise-event/:slug', protectRoute, recordExerciseEvent);

router.post('/exercises/create', protectRoute, createExercise);

export default router;