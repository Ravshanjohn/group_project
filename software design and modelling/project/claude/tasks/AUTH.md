# tasks/AUTH.md — Update Authentication Flow

Guide to modifying authentication, password reset, email verification, and token handling.

**Quick Navigation**: [Overview](#overview) | [Current Flow](#current-flow-diagram) | [Modify Signup](#step-2-modify-signup-flow) | [Modify Login](#step-3-modify-login-flow) | [Password Reset](#step-4-add-password-reset) | [Checklist](#checklist-for-auth-changes)

---

## Overview

Auth flow: Signup → Verify Email → Login → Protected Routes

**Backend**: `controllers/auth.controller.ts`, `middleware/auth.middleware.ts`
**Frontend**: `stores/user.store.ts`

---

## Authentication Flow

```
Signup
  → Validate email/password
  → Hash password (bcrypt)
  → Insert user (is_verified = false)
  → Generate email token
  → Send verification email
  
Email Click
  → Validate token
  → Mark user verified (is_verified = true)
  → Send welcome email
  
Login
  → Find user by email
  → Compare passwords (bcrypt compare)
  → Create JWT token
  → Set httpOnly cookie
  → Return user data
  
Protected Routes
  → Check JWT in cookie
  → Verify JWT signature
  → Fetch user from DB
  → Check is_verified = true AND deleted_at = null
  → Attach user to request
```

---

## To Modify Auth

**Backend** (`controllers/auth.controller.ts`):
- Validate input early (email format, password strength)
- Hash password with bcrypt before saving
- Generate tokens using `generateToken()` utility
- Query DB for user by email
- Mark emails sent in logs for debugging

**Frontend** (`stores/user.store.ts`):
- Call `/api/auth/signup`, `/api/auth/login` endpoints
- Store JWT in cookie (automatic if httpOnly)
- Show `toast.error()` on failure
- Save user to store state on success
- Clear user state on logout

**Middleware** (`middleware/auth.middleware.ts`):
- Read JWT from cookies
- Verify signature
- Check is_verified = true, deleted_at = null
- Attach user object to request

---

## When Adding Auth Changes

1. Update controller (validation, tokens, DB queries)
2. Update route (if new endpoint)
3. Mount in server.ts (if new endpoint)
4. Update frontend store (API calls, error handling)
5. Test signup → verify email → login flow
  // 2. Compare password (bcrypt)
  // 3. Check is_verified
  // 4. Generate JWT + cookie
  // 5. Return user + token
};

export const verifyAccount = async (req: Request, res: Response) => {
  // 1. Find verification token
  // 2. Mark user as verified
  // 3. Send welcome email
  // 4. Delete token
};

export const resetPassword = async (req: Request, res: Response) => {
  // 1. Find password reset token
  // 2. Hash new password
  // 3. Update user password
  // 4. Send success email
};
```

### Backend: `backend/middleware/auth.middleware.ts`

```typescript
export const protectRoute = async (req: Request, res: Response, next: NextFunction) => {
  // 1. Read JWT from cookies
  // 2. Verify JWT signature
  // 3. Fetch user from DB
  // 4. Check is_verified + deleted_at
  // 5. Attach user to req.user
  // 6. Call next()
};
```

### Frontend: `frontend/src/stores/user.store.ts`

Key store methods:
```typescript
{
  signup: (email, password, ...) => Promise<void>,
  login: (email, password) => Promise<void>,
  logout: () => Promise<void>,
  getUser: () => Promise<User | null>,
  verifyEmail: (token) => Promise<void>,
  resetPassword: (token, newPassword) => Promise<void>,
  forgotPassword: (email) => Promise<void>,
}
```

---

## Step 2: Modify Signup Flow

### Add New Field to Signup

**Scenario**: Add `phone` field to signup

**Backend Controller**:
```typescript
export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password, first_name, last_name, phone } = req.body;  // NEW

    if (!email || !password || !phone) {  // UPDATED
      return res.status(400).json({
        success: false,
        message: 'Email, password, and phone are required',
      });
    }

    // ... rest of signup logic ...

    const { data: newUser, error } = await database
      .from('users')
      .insert({
        email: email.toLowerCase(),
        password: hashedPassword,
        first_name,
        last_name,
        phone,  // NEW
      })
      .select()
      .single();

    // ... send email, return ...
  } catch (error) {
    return handleControllerError(res, error, 'signup');
  }
};
```

**Backend Route** (no change needed):
```typescript
router.post('/signup', signup);
```

**Frontend Store**:
```typescript
signup: async (
  first_name: string,
  last_name: string,
  email: string,
  password: string,
  confirmPassword: string,
  phone: string,  // NEW
) => {
  set({ loading: true });
  try {
    const res = await instance.post('/auth/signup', {
      email,
      password,
      first_name,
      last_name,
      phone,  // NEW
    });

    const { user, token } = res.data.data;
    set({ user });
    toast.success('Signup successful! Check your email.');
  } catch (error) {
    const msg = getErrorMessage(error, 'signup');
    toast.error(msg);
    throw error;
  } finally {
    set({ loading: false });
  }
};
```

**Frontend Component**:
```typescript
'use client';
import { useState } from 'react';
import { user_store } from '@/src/stores/user.store';

export default function SignupPage() {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',  // NEW
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.phone) {
      toast.error('Phone is required');
      return;
    }

    await user_store().signup(
      form.first_name,
      form.last_name,
      form.email,
      form.password,
      form.confirmPassword,
      form.phone,  // NEW
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ... existing fields ... */}
      <input
        type='tel'
        name='phone'
        value={form.phone}
        onChange={handleChange}
        placeholder='Phone'
        className='input input-bordered w-full'
      />
      <button type='submit' className='btn btn-primary w-full'>
        Sign Up
      </button>
    </form>
  );
}
```

---

## Step 3: Modify Login Flow

### Scenario: Require Phone Verification After Login

**Backend Controller**:
```typescript
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const { data: user, error: userError } = await database
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (userError || !user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if verified
    if (!user.is_verified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email first',
      });
    }

    // NEW: Check if phone verified
    if (!user.phone_verified) {
      // Send OTP, don't set JWT yet
      await sendPhoneOTP(user.id, user.phone);

      return res.status(200).json({
        success: true,
        requiresPhoneVerification: true,  // NEW FLAG
        data: { user_id: user.id },
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate JWT
    const token = await generateToken(user.id, res);

    return res.status(200).json({
      success: true,
      data: {
        user: { ...user, password: undefined },
        token,
      },
    });
  } catch (error) {
    return handleControllerError(res, error, 'login');
  }
};
```

**Frontend Store**:
```typescript
login: async (email: string, password: string) => {
  set({ loading: true });
  try {
    const res = await instance.post('/auth/login', { email, password });

    if (res.data.requiresPhoneVerification) {
      // NEW: Redirect to phone verification
      set({ requiresPhoneVerification: true, tempUserId: res.data.data.user_id });
      // Don't set user yet; wait for phone OTP
      return;
    }

    const { user, token } = res.data.data;
    set({ user });
    toast.success('Logged in!');
    // Redirect to /home
  } catch (error) {
    const msg = getErrorMessage(error, 'login');
    toast.error(msg);
    throw error;
  } finally {
    set({ loading: false });
  }
};
```

---

## Step 4: Add Password Reset

### Backend Implementation

**Route**:
```typescript
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
```

**Controller**:
```typescript
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const { data: user, error } = await database
      .from('users')
      .select('id, email')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !user) {
      // Don't reveal if user exists (security)
      return res.status(200).json({
        success: true,
        message: 'If email exists, reset link sent',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Save token to DB (with expiry)
    await database.from('password_resets').insert({
      user_id: user.id,
      token: resetToken,
      expires_at: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour
    });

    // Send reset email
    const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendPasswordResetEmail(user.email, resetURL);

    return res.status(200).json({
      success: true,
      message: 'If email exists, reset link sent',
    });
  } catch (error) {
    return handleControllerError(res, error, 'forgotPassword');
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords are required',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    // Find valid reset token
    const { data: resetRecord, error } = await database
      .from('password_resets')
      .select('user_id')
      .eq('token', token)
      .gt('expires_at', new Date())  // Not expired
      .single();

    if (error || !resetRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset link',
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    const { error: updateError } = await database
      .from('users')
      .update({ password: hashedPassword })
      .eq('id', resetRecord.user_id);

    if (updateError) throw new Error(updateError.message);

    // Delete used token
    await database.from('password_resets').delete().eq('token', token);

    // Fetch user for success email
    const { data: user } = await database
      .from('users')
      .select('email')
      .eq('id', resetRecord.user_id)
      .single();

    if (user) {
      await sendResetSuccessEmail(user.email);
    }

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now log in.',
    });
  } catch (error) {
    return handleControllerError(res, error, 'resetPassword');
  }
};
```

### Frontend Store

```typescript
forgotPassword: async (email: string) => {
  set({ loading: true });
  try {
    await instance.post('/auth/forgot-password', { email });
    toast.success('Reset link sent! Check your email.');
  } catch (error) {
    const msg = getErrorMessage(error, 'forgotPassword');
    toast.error(msg);
    throw error;
  } finally {
    set({ loading: false });
  }
},

resetPassword: async (token: string, newPassword: string) => {
  set({ loading: true });
  try {
    const res = await instance.post(`/auth/reset-password/${token}`, {
      newPassword,
      confirmPassword: newPassword,
    });

    toast.success('Password reset successfully!');
    // Redirect to /login
    return res.data;
  } catch (error) {
    const msg = getErrorMessage(error, 'resetPassword');
    toast.error(msg);
    throw error;
  } finally {
    set({ loading: false });
  }
},
```

---

## Step 5: Update Protected Routes Middleware

### Add Role-Based Access

**Current**:
```typescript
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;

  if (user.name !== 'Ravshan') {  // ❌ Hardcoded!
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admins only.',
    });
  }

  next();
};
```

**Improved** (role-based):
```typescript
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;

  if (user.role !== 'admin') {  // ✅ Uses database role
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.',
    });
  }

  next();
};

export const hasRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
      });
    }

    next();
  };
};
```

**Use in routes**:
```typescript
router.get('/admin/data', protectRoute, hasRole(['admin']), getAllData);
router.get('/moderator/data', protectRoute, hasRole(['admin', 'moderator']), getAllData);
```

---

## Checklist for Auth Changes

### Backend
- [ ] Modified `auth.controller.ts` for changes
- [ ] Updated routes if new endpoints
- [ ] Updated middleware if adding guards
- [ ] New database fields migrated in Supabase
- [ ] Error messages are clear
- [ ] No secrets logged
- [ ] Password hashing with bcrypt
- [ ] JWT expires in reasonable time (7 days)
- [ ] Cookies have httpOnly + Secure flags

### Frontend
- [ ] Updated `user.store.ts` with new methods
- [ ] Page/form updated to use new store methods
- [ ] Error handling shows toasts
- [ ] Loading states work
- [ ] Redirect after login/logout
- [ ] Form validates input
- [ ] No secrets stored in frontend

### Testing
- [ ] Signup works end-to-end
- [ ] Verification email sent and link works
- [ ] Login works (password validated)
- [ ] Protected route returns 401 without JWT
- [ ] Deleted user can't log in
- [ ] Password reset works
- [ ] Logout clears cookies

---

## Common Changes

### Add Optional Profile Fields
```typescript
// Database: Add new columns
ALTER TABLE users ADD COLUMN avatar_url VARCHAR;
ALTER TABLE users ADD COLUMN bio TEXT;

// Controller: Include in response
const { data: user } = await database
  .from('users')
  .select('id, email, avatar_url, bio, ...')
  .eq('id', userId)
  .single();
```

### Require Email Verification
```typescript
// In protectRoute middleware:
if (!user.is_verified) {
  return res.status(403).json({
    success: false,
    message: 'Please verify your email',
  });
}
```

### Add Social Login (OAuth)
```typescript
// New endpoint:
router.post('/auth/google', socialLogin);  // Handle Google token
// In controller: Validate Google token, upsert user, set JWT
```

### Add Two-Factor Authentication
```typescript
// After login, before JWT:
if (user.two_factor_enabled) {
  // Send OTP to phone/email
  // Require OTP verification before setting JWT
}
```

---

**See Also**:
- [backend/CLAUDE.md](../backend/CLAUDE.md) — Full backend conventions
- [BACKEND_API.md](./BACKEND_API.md) — Endpoint patterns
- [EMAIL.md](./EMAIL.md) — Email templates
- [TYPES.md](./TYPES.md) — Authentication types

**Last Updated**: 2026-03-19
