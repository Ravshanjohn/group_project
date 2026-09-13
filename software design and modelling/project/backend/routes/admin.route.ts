import express from "express";
import { 
  getExercises, 
  changeExerciseStatus, 
  changeExerciseDifficulty, 
  diactivateActivateExercise, 
  getMapExercises, 
  getMaps,
  addExerciseToMap,
  removeExerciseFromMap,
  setExerciseXP
} from "../controllers/admin.controller.js";
// import { protectRoute,  isAdmin } from "../middleware/auth.middleware.js";


const router = express.Router();


// router.get("/admin/count-users-authenticated", protectRoute,  isAdmin, count_user_authenticated);
// router.get("/admin/count-users-all", protectRoute,  isAdmin, count_user_all);
router.get("/exercises", getExercises);
router.get("/map/:map_id/exercises", getMapExercises);
router.get("/maps", getMaps);

router.post("/map/:map_id/exercise/:exercise_id", addExerciseToMap);
router.patch("/exercise/:exercise_id/xp", setExerciseXP);

router.delete("/map/:map_id/exercise/:exercise_id", removeExerciseFromMap);


router.patch("/exercise/:exercise_id/status", changeExerciseStatus);
router.patch("/exercise/:exercise_id/difficulty", changeExerciseDifficulty);
router.patch("/exercise/:exercise_id", diactivateActivateExercise);
// route



export default router;