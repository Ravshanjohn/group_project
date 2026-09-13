import express from 'express';
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  updateUserProfile,
  buyMap,
  topUpBalance,
  getSubscribedMaps
} from '../controllers/user.controller.js';


const router = express.Router();

router.patch("/update", protectRoute, updateUserProfile);
router.patch("/buy/map", protectRoute, buyMap);
router.get("/subscribed/maps", protectRoute, getSubscribedMaps);
router.post("/top-up/balance", protectRoute, topUpBalance);

export default router;
