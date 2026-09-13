import express, { type Request, type Response } from "express";
import { checkAuthStatus, forgotPassword, getSystemInfo, getUser, login, logout, resetPassword, signup, verifyAccount, verifyEmail } from "../controllers/auth.controller.js";
import {  protectRoute } from "../middleware/auth.middleware.js";



const router = express.Router();


router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout); 
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/email-verification/:token", verifyAccount);
router.post("/verify-email", verifyEmail);

router.get("/get-user", protectRoute, getUser);
router.get("/profile", protectRoute,  checkAuthStatus);
router.get("/device-info", protectRoute, getSystemInfo);

export default router;