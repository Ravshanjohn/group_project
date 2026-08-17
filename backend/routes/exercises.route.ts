import express from 'express';
import { 
  getAllExercises, 
  getExerciseBySlug, 
  getExerciseLanguages, 
  getExerciseSignature, 
  getInitialCode, 
  getTestCase,  
   
  recordExerciseEvent, 
  createExercise
} from '../controllers/exercises.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

// More specific routes MUST come before generic routes
router.get('/exercises/initial-code/:slug', protectRoute, getInitialCode);
router.get('/exercises/test-case/:slug', getTestCase);
router.get('/exercises', protectRoute, getAllExercises);
router.get('/exercises/:slug', getExerciseBySlug);
router.get('/exercises/signature/:slug', getExerciseSignature);
router.get('/exercises/get-exercise-languages/:slug', getExerciseLanguages);


router.post('/exercises/record-exercise-event/:slug', protectRoute, recordExerciseEvent);

router.post('/exercises/create', protectRoute, createExercise);

export default router;