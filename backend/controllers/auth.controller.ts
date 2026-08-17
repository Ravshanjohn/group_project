import { type Request, type Response } from 'express';
import { database } from '../lib/db.js';
import bcrypt from 'bcrypt';
import crypto from "crypto";
import { sendWelcomeEmail, sendPasswordResetEmail, sendResetSuccessEmail, sendVerificationEmail } from "../email/email.js";
import { generateToken, handleControllerError } from '../lib/utils.js';
import { UAParser } from "ua-parser-js";

type s = string; 
type n = string;
type InsertedUser = { 
  id: number;
  email: string;
  first_name: string;
  last_name: string;
};
  

export const login = async ( req: Request, res: Response ) => {
  try {
    const { email, password } : { email: s, password: n } = req.body;

    // Basic validation
    if(!email || !password) return res.status(400).json({
      success: false,  
      message: 'Email and password are required' 
    });

    // Trim and normalize inputs
    const trimmedEmail = email.trim().toLowerCase();

    const { data: user, error: userError } = await database
      .from('users')
      .select('id, first_name, last_name, email, password,  is_verified, deleted_at')
      .eq('email', trimmedEmail)
      .single<{
        id: string, 
        first_name: string, 
        last_name: string, 
        email: string, 
        password: string, 
        avatar: string | null,
        balance: number,
        is_verified: boolean,
        active_status: string, 
        created_at: string,
        deleted_at: string | null,
      }>();

    // Handle potential errors during the database query
    if (userError || !user){
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    };

    if(!user.password) {
      return res.status(500).json({
        success: false,
        message: 'Account data is incomplete. Please contact support.'
      });
    };
    
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if(!isPasswordValid) return res.status(400).json({
      success: false,
      message: 'Invalid email or password'
    });


    if(!user.is_verified) {
      return res.status(403).json({ 
        success: false, 
        message: 'Email is not verified. Please check your inbox.' 
      });
    };

    if(user.deleted_at) {
      return  res.status(403).json({ 
        success: false, 
        message: `Account is ${user.active_status}. Please contact support.`
      });
    };

    // Generate a secure random token
    const token = await generateToken(user.id, res);
    const expires_at = new Date();
		expires_at.setDate(expires_at.getDate() + 7); // 7days

    // Store the token in the database
    const { error: tokenError } = await database
      .from('tokens')
      .insert({
        token,
        expires_at,
        token_type: 'cookie_token_login'
      });

    if (tokenError) {
      console.log('Error storing auth token during login:', tokenError);
      throw new Error(tokenError.message);
    };

    return res.status( 200 ).json( { 
      success: true, 
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user?.last_name,
        email: user.email,
        balance: user.balance || 0,
        avatar: user.avatar || null,
        is_verified: user.is_verified,
        created_at: user.created_at,
      },    
      message: 'User logged in successfully'
    } );
  } catch (error: unknown) {
    return handleControllerError(res, error, "login controller");
  };
};
      
export const signup = async ( req: Request, res: Response ) => {
  try {
    const { firstName, lastName, email, password } : { firstName: s, lastName: s | null, email: s, password: n } = req.body;

    // Basic validation
    if(!firstName || !email || !password) return res.status(400).json({
      success: false,  
      message: 'All fields are required' 
    });
    if( password.toString().length < 6 ) return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long'
    });

    // Trim and normalize inputs
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName ? lastName.trim() : null;

    const { data: userExists, error: userExistsError } = await database
      .from('users')
      .select('id, is_verified, active_status, deleted_at')
      .eq('email', trimmedEmail)
      .single<{
        id: string;
        is_verified: boolean;
        active_status: string;
        deleted_at: string | null;
      }>();

    // Handle potential errors during the database query
    if (userExistsError){
      console.log('Error checking existing user:', userExistsError);
      throw new Error(userExistsError.message);
    };

    // If user already exists, respond accordingly
    if (userExists) {
      // User exists and is active
      return res.status(409).json({
        success: false,  
        message: 'Email verification sent if account does not exists. Please check your inbox.' 
      });
    };

    const hashedPassword: string = await bcrypt.hash(password, 10);

    // Insert new user into the database
    const { data: newUser , error: newUserError } = await database
      .from('users')
      .insert([{
        first_name: trimmedFirstName, 
        last_name: trimmedLastName, 
        email: trimmedEmail, 
        password: hashedPassword,
      }])
      .select('id, email, first_name, last_name')
      .single<InsertedUser>();

    // Handle potential errors during user creation
    if (newUserError) {
      console.log('Error creating new user:', newUserError);
      throw new Error(newUserError.message);
    };
    
    // Generate email verification token
    const token = crypto.randomBytes(20).toString('hex');

    
    // Send verification email
    const isSent = await sendVerificationEmail(trimmedEmail, token);
    if (!isSent) {
      console.log("signup controller: Verification email not sent");
      throw new Error("Verification email not sent");
    }; 
    
    // Set token expiration time
    const expires_at: Date = new Date();
    expires_at.setHours(expires_at.getHours() + 1); // Token expires in 1 hour

    // Hash the token before storing
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Store the token in the database
    const { data: insertedToken, error: insertedTokenError } = await database
      .rpc('insert_token', {
        param_user_id: newUser.id,
        param_token: hashedToken,
        param_token_type: 'verify_account_email',
        param_expires_at: expires_at
      });
    
    if (insertedTokenError) {
      console.log('Error storing verification token:', insertedTokenError);
      throw new Error(insertedTokenError.message);
    };

    if (insertedToken !== true) {
      console.log('Error storing verification token:', insertedToken);
      throw new Error('Failed to store email verification token');
    };

    return res.status(200).json({ 
      success: true, 
      message: 'User signed up successfully. Please verify your email address.' 
    });
  } catch (error: unknown) {
    return handleControllerError(res, error, "signup controller");
  };
};

export const logout = async ( req: Request, res: Response ) => {
  const token: string | undefined = req.cookies.jwt;
  try {
    if (token) {
      // Delete the token from the database
      const { error } = await database
        .from('tokens')
        .update({ revoked: true })
        .eq('token', token)
        .eq('token_type', 'cookie_token_login');
      if (error) {
        console.log('Error revoking auth token during logout:', error);
        throw new Error(error.message);
      };
    };

    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie("jwt", "", {
      maxAge: 0,
      httpOnly: true,
      sameSite: isProduction ? "strict" : "lax",
      secure: isProduction,
      path: "/",
    });

    return res.status(200).json({ 
      success: true, 
      message: "Logged out successfully" 
    });
  } catch (error: unknown) {
    return handleControllerError(res, error, "logout controller");
  };
};

export const getSystemInfo = async (req: Request, res: Response) => {
  try {
    const userAgent = req.headers['user-agent'] || '';
    const ip = req.ip;

    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    const browserName = result.browser.name || 'Unknown';
    const browserVersion =  result.browser.major || 'Unknown';
    const browser = `${browserName} ${browserVersion}`;

    const deviceInfo = {
      os: result.os.name || "Unknown",
      browser: browser,
      userAgent: userAgent,
      ip: ip
    };
    console.log(navigator.userAgent);

    return res.status(200).json({ success: true, data: {
      os: deviceInfo.os, 
      browser: deviceInfo.browser, 
      userAgent: deviceInfo.userAgent,
      ip: deviceInfo.ip
    } });
  } catch (error) {
    handleControllerError(res, error, "getDeviceInfo controller");
  }
};

export const verifyAccount = async ( req: Request, res: Response ) => {
  try {
    const {token} = req.params as { token: s };
    
    if (!token) return res.status(400).json({ success: false, message: "Token is required" });
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Update token record to revoked
    const { data: tokenRecord, error: revokeError } = await database
      .rpc('consume_token', {
        param_token: hashedToken,
        param_token_type: 'verify_account_email',
      });

    if (revokeError) {
      console.log('Error consuming token:', revokeError);
      throw new Error(revokeError.message);
    };

    if (!Array.isArray(tokenRecord) || tokenRecord.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    };

    const { success, user_id } = tokenRecord[0];

    if (!success || !user_id) {
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    };

    const now = new Date(); // Current timestamp for updated_at field
    
    // Update user's is_verified status
    const { data: updatedUser, error: updateError } = await database
      .from('users')
      .update({ is_verified: true, active_status: 'active', updated_at: now })
      .eq('id', user_id)
      .select('email, first_name')
      .single<{email: string, first_name: string}>();
    if (updateError) {
      console.log('Error updating user verification status:', updateError);
      throw new Error(updateError.message);
    };

    
    // Send welcome email
    const isSent = await sendWelcomeEmail(updatedUser.email);
    if (!isSent) {
      console.log("Welcome email not sent");
      throw new Error("Welcome email not sent");
    };

    return res.status(200).json({ success: true, message: "Account verified successfully" });
  } catch (error: unknown) {
    return handleControllerError(res, error, "verifyAccount controller");
  }
};

//Send Verify email 
export const verifyEmail = async ( req: Request, res: Response) => {
  try {
    const { email }= req.body;

    //Validate email
    if (!email) return res.status(400).json({ success: false, message: "Email is required" });
    const trimmedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      console.log("Invalid email format");
      throw new Error("Invalid email format");
    };

    //Check if user exists
    const { data: user, error: userError } = await database
      .from('users')
      .select('id, is_verified, deleted_at')
      .eq('email', trimmedEmail)
      .single<{id: string, is_verified: boolean,  deleted_at: Date}>();

    if (userError) {
      console.log('Error fetching user for email verification:', userError);
      throw new Error(userError.message);
    };
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (user.is_verified) return res.status(400).json({ success: false, message: "Email is already verified" });
    if (user.deleted_at) return res.status(400).json({ success: false, message: "Account has been permanently deleted.Please contact support if you believe this is an error." });

    const {data: canSend, error: canSendError } = await database
      .rpc('can_send_email', {
        param_user_id: user.id,
        param_email_type: 'verify_account_email',
        param_email: trimmedEmail,
      });
    if (canSendError) {
      console.log('Error checking email send capability:', canSendError);
      throw new Error(canSendError.message);
    };

    if (canSend === true) {
      // Generate email verification token
      const token = crypto.randomBytes(20).toString('hex'); 
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      // Set token expiration time
      const expires: Date = new Date();
      expires.setHours(expires.getHours() + 1); // Token expires in 1 hour

      const { data: insertedToken, error: insertedTokenError } = await database
        .rpc('insert_token', {
          param_user_id: user.id,
          param_token: hashedToken,
          param_token_type: 'verify_account_email',
          param_expires_at: expires
        });
      if (insertedTokenError) {
        console.log('Error storing verification token:', insertedTokenError);
        throw new Error(insertedTokenError.message);
      };
      if (insertedToken !== true) {
        console.log('Error storing verification token:', insertedToken);
        throw new Error('Failed to store email verification token');
      };


      // Send verification email
      const isSent = await sendVerificationEmail(trimmedEmail, token);
      if (!isSent) {
        console.log("Verification email not sent");
        return res.status(400).json({ success: false, message: "Message is not sent (Error in verifyEmail controller)" });
      };

      return res.status(200).json({ success: true, message: "Verification email sent successfully" });
    } else {
      //Email cannot be sent due to limits
      return  res.status(400).json({ success: false, message: 'Email limit reached or cooldown active' });
    };
  } catch (error: unknown) {
    return handleControllerError(res, error, "verifyEmail controller") 
  };
};

export const forgotPassword = async ( req: Request, res: Response ) => {
  
  try {
    const { email } : { email: s } = req.body;
    // Basic validation
    if(!email) return res.status(400).json({
      success: false,  
      message: 'Email is required' 
    });

    // Trim and normalize inputs
    const trimmedEmail = email.trim().toLowerCase();
    //Check if user exists
    const { data: user, error: userError } = await database
      .from('users')
      .select('id, email, is_verified, deleted_at')
      .eq('email', trimmedEmail)
      .single<{id: string, email: string, is_verified: boolean, deleted_at: string | null}>();
    if (userError) {
      console.log('Error fetching user for password reset:', userError);
      throw new Error(userError.message)
    };
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (!user.is_verified) return res.status(403).json({ success: false, message: "Email is not verified" });
    if (user.deleted_at) return res.status(403).json({ success: false, message: "Account is deactivated. Please contact support." });

    //Check if can send email
    const {data: canSend, error: canSendError } = await database
      .rpc('can_send_email', {
        param_user_id: user.id,
        param_email_type: 'reset_password_account_email',
        param_email: trimmedEmail,
      });
    if (canSendError) {
      console.log('Error checking email send capability:', canSendError);
      throw new Error(canSendError.message);
    };

    if (canSend === true) {

      // Generate password reset token
      const token = crypto.randomBytes(20).toString('hex'); 
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      // Set token expiration time
      const expires_at: Date = new Date();
      expires_at.setHours(expires_at.getHours() + 1); // Token expires in 1 hour


      // Store the token in the database
      const { data: insertedToken, error: insertedTokenError } = await database
        .rpc('insert_token', {
          param_user_id: user.id,
          param_token: hashedToken,
          param_token_type: 'update_account_password',
          param_expires_at: expires_at
        });
      if (insertedTokenError) {
        console.log('Error storing password reset token:', insertedTokenError);
        throw new Error(insertedTokenError.message);
      };
      if (insertedToken !== true) {
        console.log('Error storing password reset token:', insertedToken);
        throw new Error('Failed to store password reset token');
      };

      const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
      // Send password reset email

      const isSent = await sendPasswordResetEmail(trimmedEmail, resetUrl);

      if (!isSent) {
        console.log("Password reset email not sent");
        return res.status(400).json({ 
          success: false, 
          message: "Message is not sent" 
        });
      };


    } else {
      //Email cannot be sent due to limits
      return  res.status(400).json({ 
        success: false, 
        message: 'Email limit reached or cooldown active' 
      });
    };

    return res.status(200).json({ 
      success: true, 
      message: "Password reset email sent successfully" 
    });
  } catch (error: unknown) {
    return handleControllerError(res, error, "forgotPassword controller");
  }
};

export const resetPassword = async ( req: Request, res: Response ) => {
  try {
    const { token } = req.params as { token: s } ;
    const { newPassword } : { newPassword: s } = req.body;

    // Basic validation
    if(!newPassword) return res.status(400).json({
      success: false,  
      message: 'New password is required' 
    });
    if( newPassword.toString().length < 6 ) return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long'
    });
    if(!token) return res.status(400).json({
      success: false,  
      message: 'Token is invalid or expired' 
    });

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const { data: tokenRecord, error: tokenError } = await database
      .rpc('consume_token', {
        param_token: hashedToken,
        param_token_type: 'update_account_password',
      });

    if (tokenError) {
      console.log('Error consuming token:', tokenError);
      throw new Error(tokenError.message);
    }

    if (!Array.isArray(tokenRecord) || tokenRecord.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    const { success, user_id } = tokenRecord[0];

    if (!success || !user_id) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    // Hash the new password
    const hashedPassword: string = await bcrypt.hash(newPassword, 10);
    const now = new Date();

    // Update user's password — use user_id from the result, not tokenRecord.user_id
    const { data: updatedUser, error: updateError } = await database
      .from('users')
      .update({ password: hashedPassword, updated_at: now })
      .eq('id', user_id)  // ✓ CORRECT
      .select('email')
      .single<{email: string}>();
    if (updateError) {
      console.log('Error updating user password:', updateError);
      throw new Error(updateError.message);
    };

    // Revoke the used token
    await database
      .from('tokens')
      .update({ revoked: true, updated_at: now })
      .eq('token', hashedToken)
      .eq('token_type', 'update_account_password'); 
    
    // Send password reset success email
    const isSent = await sendResetSuccessEmail(updatedUser.email);
    if (!isSent) {
      console.log("Password reset success email not sent");
      throw new Error("Password reset success email not sent");
    };

    return res.status(200).json({ success: true, message: "Password has been reset successfully" });
  } catch (error: unknown) {
    return handleControllerError(res, error, "resetPassword controller");
  };
};

export const getUser = async ( req: Request, res: Response ) => {
  const { id } = req.body as { id: string };
  try {
    const {data, error} = await database
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) {
      console.log('Error fetching user:', error);
      throw new Error(error.message);
    };



    return res.status(200).json({ success: true, data: data });
  } catch (error: unknown) {
    return handleControllerError(res, error, "getUser controller");
  };
};



export const checkAuthStatus = async (req: Request, res: Response) => {
	try {
		return res.status(200).json((req as any).user);
	} catch (error: unknown) {
    return handleControllerError(res, error, "checkAuthStatus controller");
	};
};





