import { type Request, type Response } from "express";
import { handleControllerError } from '../lib/utils.js';
import { UAParser } from "ua-parser-js";
import { database } from "../lib/db.js";


export const getDeviceInfo = async (req: Request, res: Response) => {
  try {
    const userAgent = req.headers['user-agent'] || '';
    const ip = req.ip;

    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    const browserVersion = result.browser.version && result.browser.version !== "0.0.0" ? result.browser.version : "Unknown";
    
    const deviceInfo = {
      os: result.os.name || "Unknown",
      browser: browserVersion,
      userAgent: userAgent,
      ip: ip
    };
    return res.status(200).json({ data: {
      os: deviceInfo.os, 
      browser: deviceInfo.browser, 
      ip: deviceInfo.ip
    }, error: null });


  } catch (error) {
    return handleControllerError(res, error, "getDeviceInfo controller");
  }
};

export const updateUserProfile = async (req: Request, res: Response) => {
  const user = (req as any).user;

  if (!user) {
    return res.status(401).json({
      data: "unauthorized",
      error: {
        code: "user_not_found",
        message: "User not found",
      },
    });
  }

  try {
    const updates: Record<string, string> = {};

    if (req.body?.first_name !== undefined) {
      if (typeof req.body.first_name !== "string") {
        return res.status(400).json({
          data: null,
          error: { code: "invalid_first_name", message: "First name must be a string" },
        });
      }
      updates.first_name = req.body.first_name.trim();
    }

    if (req.body?.last_name !== undefined) {
      if (typeof req.body.last_name !== "string") {
        return res.status(400).json({
          data: null,
          error: { code: "invalid_last_name", message: "Last name must be a string" },
        });
      }
      updates.last_name = req.body.last_name.trim();
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        data: null,
        error: { code: "no_updates", message: "At least one profile field is required" },
      });
    }

    const { data, error } = await database
      .from("users")
      .update(updates)
      .eq("id", user.id)
      .select("id, first_name, last_name, email, avatar, balance, is_verified, created_at")
      .single();

    if (error) {
      return res.status(400).json({
        data: null,
        error,
      });
    }

    return res.status(200).json({
      data,
      error: null,
    });
  } catch (error) {
    return res.status(500).json({
      data: null,
      error,
    });
  }
}

export const buyMap = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { map_id, price, p_expires_at } = req.body;

  if (!userId) {
    return res.status(401).json({
      data: "unauthorized",
      error: {
        code: "fields_required",
        message: "User not found",
      },
    });
  }
  if (!map_id || !price || !p_expires_at) {
    return res.status(400).json({
      data: null,
      error: {
        code: "fields_required",
        message: "Map ID, price, and purchase expiration date are required",
      },
    });
  }

  try {
    const { data, error } = await database.rpc('subscribe_to_map', {
      p_user_id: userId,
      p_map_id: map_id,
      p_price: price,
      p_expires_at: p_expires_at
    });
    if (error) { return handleControllerError(res, error, "buyMap controller"); }

    return res.status(200).json({
      data,
      error: null,
    });
  } catch (error) {
    return handleControllerError(res, error, "buyMap controller");
  }
}

export const getSubscribedMaps = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  if (!userId) {
    return res.status(401).json({
      data: "unauthorized",
      error: {
        code: "user_not_found",
        message: "User not found",
      },
    });
  }

  try {
    const { data, error } = await database.rpc('get_subscribed_maps', {
      p_user_id: userId
    });
    if (error) { return handleControllerError(res, error, "getSubscribedMaps controller"); }

    return res.status(200).json({
      data,
      error: null,
    });
  } catch (error) {
    return handleControllerError(res, error, "getSubscribedMaps controller");
  }
}





export const topUpBalance = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { amount } = req.body;

  if (!userId) {
    return res.status(401).json({
      data: null,
      error: { code: "user_not_found", message: "User not found" },
    });
  }

  if (!amount || typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({
      data: null,
      error: { code: "invalid_amount", message: "A positive XP amount is required" },
    });
  }

  try {
    const { data: user, error: fetchError } = await database
      .from('users')
      .select('balance')
      .eq('id', userId)
      .single<{ balance: number }>();

    if (fetchError || !user) {
      return res.status(400).json({
        data: null,
        error: { code: "user_fetch_failed", message: "Failed to fetch user balance" },
      });
    }

    const newBalance = user.balance + amount;

    const { data, error } = await database
      .from('users')
      .update({ balance: newBalance })
      .eq('id', userId)
      .select('balance')
      .single<{ balance: number }>();

    if (error) {
      return handleControllerError(res, error, "topUpBalance controller");
    }

    return res.status(200).json({
      data: { balance: data.balance },
      error: null,
    });
  } catch (error) {
    return handleControllerError(res, error, "topUpBalance controller");
  }
};
