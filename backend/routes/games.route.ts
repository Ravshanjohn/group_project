import express from 'express';
import { protectRoute,  isAdmin } from "../middleware/auth.middleware.js";
import {getAllActiveGames, getGameBySlug, getScoresByDifficulty, setUserScore, findUserScore } from '../controllers/games.controller.js';


const router = express.Router();


router.get("/games/slug/:slug", getGameBySlug);
router.get("/games", getAllActiveGames);
router.get("/games/score/leaderboard", protectRoute, getScoresByDifficulty);
router.get("/games/find/score", protectRoute,  findUserScore); // Admin route to view all scores without user filter


router.post("/games/set/score", protectRoute, setUserScore);



export default router;