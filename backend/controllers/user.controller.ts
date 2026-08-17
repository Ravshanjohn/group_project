import { type Request, type Response } from "express";
import { handleControllerError } from '../lib/utils.js';
import { UAParser } from "ua-parser-js";


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
    console.log(navigator.userAgent);

    return res.status(200).json({ success: true, data: {
      os: deviceInfo.os, 
      browser: deviceInfo.browser, 
      ip: deviceInfo.ip
    }});


  } catch (error) {
    handleControllerError(res, error, "getDeviceInfo controller");
  }
};

// export const getUserActiveDevices = 
