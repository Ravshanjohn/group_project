import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import {
  getUserExerciseCompleted,
  getUserCode,  
  saveUserCode,  
  setUserExerciseCompleted,  
  setUserExerciseStatus, 
  setUserExerciseViewed,
  getUserUnlockedExercises,
  getUserSubscribedMaps,
} from '../controllers/user.exercise.controller.js';

const router = express.Router();


router.get('/user/exercises/get-user-code/:slug', protectRoute, getUserCode);
router.get('/user/exercises/get-user-exercises-completed', protectRoute, getUserExerciseCompleted);
router.get("/user/unlocked/exercises", protectRoute, getUserUnlockedExercises);
router.get("/user/subscribed/maps", protectRoute, getUserSubscribedMaps);


router.post('/user/exercises/save-user-code/:slug', protectRoute, saveUserCode);
router.post('/user/exercises/set-exercise-user-status/:slug', protectRoute, setUserExerciseStatus);
router.post('/user/exercises/set-exercise-user-viewed/:slug', protectRoute, setUserExerciseViewed);
router.post('/user/exercises/set-exercise-user-completed/:slug', protectRoute, setUserExerciseCompleted);

export default router;