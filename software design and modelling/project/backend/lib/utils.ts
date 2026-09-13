import jwt from 'jsonwebtoken';
import { type Response } from 'express';

const JWT_SECRET = process.env.JWT_SECRET;

export const generateToken = async (id: string, res: Response): Promise<string> => {
  if (!JWT_SECRET) {
    console.error("JWT_SECRET is not defined in environment variables");
    throw new Error("JWT_SECRET is not defined");
  }

  const token = jwt.sign({ id }, JWT_SECRET, { expiresIn: "7d" });

  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    sameSite: isProduction ? "strict" : "lax",
    secure: isProduction,
    path: "/",
  });

  return token;
};

export const handleControllerError = (res: Response, error: unknown, context: string = "controller") => {
  if (error instanceof Error) {
    console.error(`Error in ${context}:`, error.message);
    return res.status(500).json({
      data: null,
      error: { code: "internal_error", message: error.message }
    });
  }

  console.error(`Unknown error in ${context}:`, error);
  return res.status(500).json({
    data: null,
    error: { code: "internal_error", message: "An unknown error occurred" }
  });
};
