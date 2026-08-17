import jwt from 'jsonwebtoken';
import { type Response, type Request, type NextFunction } from 'express';
import { database } from '../lib/db.js';
import { handleControllerError } from '../lib/utils.js';

// Middleware to protect routes and ensure the user is authenticated
export const protectRoute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.jwt;

    if (!token) return res.status(401).json({ success: false, message: "Not authorized, token missing" });
   
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };

    if(!decoded || !decoded.id) return res.status(401).json({ success: false, message: "Not authorized, invalid token" });

    const {data, error} = await database
      .from('users')
      .select('id, first_name, last_name, email, avatar, is_verified, active_status, created_at, deleted_at')
      .eq('id', decoded.id)
      .single();
    
    if (error || !data) return res.status(401).json({ success: false, message: "Not authorized, user not found" });

    if(data.is_verified === false) {
      return res.status(403).json({ success: false, message: "Account not verified. Please verify your email." });
    }

    if(data.deleted_at) {
      return res.status(403).json({ success: false, message: "Account is deactivated. Please contact support." });
    }

    // Attach user to request object
    (req as any).user = data;
    next();
  } catch (error: unknown) {
    return handleControllerError(res, error, "protectRoute middleware");
  };
};



export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;

  

  if (user.name !== "Ravshan") {
    return res.status(403).json({ success: false, message: "Access denied. Admins only." });
  };

  next();
};