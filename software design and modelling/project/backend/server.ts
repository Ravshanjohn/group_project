import dotenv from 'dotenv';
import express from "express";
import cookieParser from 'cookie-parser';
import authRoutes from "./routes/auth.route.js";
import gamesRoutes from "./routes/games.route.js";
import exercisesRoutes from "./routes/exercises.route.js";
import userExerciseRoutes from "./routes/user.exercise.route.js";
import adminRoutes from "./routes/admin.route.js";
import { app, server } from './socket/index.js';
import userRoutes from "./routes/user.route.js";
import cors from 'cors';



// Load .env from parent (workspace root) so variables defined at d:\zth\.env are picked up
dotenv.config();
const PORT = process.env.PORT

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.set("trust proxy", 1);
app.use( 
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
)
app.use('/api/auth', authRoutes);
app.use('/api', gamesRoutes);
app.use('/api', exercisesRoutes);
app.use('/api', userExerciseRoutes);
app.use('/api/admin', adminRoutes);
app.use("/api/user", userRoutes);
 
server.listen(PORT, () => {
  console.log(`The server running on PORT:${PORT}`)
})

