# tasks/EMAIL.md — Add Email Template

Guide to creating and sending email templates via Mailtrap.

**Quick Navigation**: [Overview](#overview) | [Define Template](#step-1-define-email-template) | [Create Sender](#step-2-create-send-function) | [Call from Controller](#step-3-call-from-controller) | [Testing](#testing-emails) | [Troubleshooting](#troubleshooting)

---

## Overview

Email flow:
1. **Template** in `email.template.ts` — HTML with `{placeholder}` syntax
2. **Sender** in `email.ts` — Function that replaces placeholders
3. **Trigger** in controller — Call sender from business logic

All sent via Mailtrap (no fallback service).

---

## Step 1: Define Template

File: `backend/email/email.template.ts`

Pattern:
- HTML with `{placeholder}` syntax for dynamic values
- Style inline (no external CSS)
- Keep simple and readable
- Include unsubscribe option if marketing

```typescript
// Export TEMPLATE_NAME = `HTML string with {placeholder}`
// Placeholders: {userName}, {actionURL}, {verificationCode}, etc
```

---

## Step 2: Create Sender Function

File: `backend/email/email.ts`

Pattern:
- Accept template string + placeholder values object
- Replace `{placeholder}` with actual values
- Call Mailtrap client to send
- Return result or throw error

```typescript
// Function signature: async (to, placeholders) => Promise
// Replace placeholders using regex or string.replace()
// Send via MAILTRAP_CLIENT
// Handle errors
```

---

## Step 3: Call from Controller

File: `backend/controllers/auth.controller.ts` (or any controller)

Pattern:
- Import email function
- Call after successful DB operation
- Don't block on email (use .catch() to log errors)
- Continue with response

```typescript
// await sendVerificationEmail(email, { userName, link })
// Errors should not block signup/login response
```

---

## Email Checklist

- [ ] Template defined with placeholders
- [ ] Sender function created
- [ ] Function called from correct controller
- [ ] Placeholders properly replaced
- [ ] Error handling (don't block response)
- [ ] Tested via Postman/browser (check email logs)
      <p>Your password has been reset successfully.</p>
      <p>You can now log in with your new password.</p>
    </body>
  </html>
`;

export const WELCOME_EMAIL_TEMPLATE = `
  <!DOCTYPE html>
  <html>
    <body>
      <h2>Welcome, {senderName}!</h2>
      <p>Your account is now active. Start using our service today.</p>
      <p>
        <a href="{dashboardURL}">Go to Dashboard</a>
      </p>
    </body>
  </html>
`;
```

**Key Points**:
- Use `{placeholder}` syntax (Mailtrap replaces these)
- Keep HTML simple; complex styling may not render in all clients
- Include unsubscribe/copyright info
- Make action buttons prominent
- Always explain what email is for

---

## Step 2: Create Send Function

File: `backend/email/email.ts`

### Simple Send

```typescript
import { VERIFICATION_EMAIL_TEMPLATE } from './email.template.js';
import { mailtrapClient, sender } from './email.config.js';

export const sendVerificationEmail = async (email: string, token: string) => {
  const recipient = [{ email }];

  try {
    await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: 'Verify your email',
      html: VERIFICATION_EMAIL_TEMPLATE
        .replace('{verificationCode}', token)
        .replace('{verificationURL}', `${process.env.CLIENT_URL}/verify-email/${token}`),
      category: 'Email Verification',
    });

    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
};
```

### With Error Handling

```typescript
export const sendPasswordResetEmail = async (email: string, resetToken: string) => {
  const recipient = [{ email }];

  try {
    const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: 'Reset your password',
      html: PASSWORD_RESET_REQUEST_TEMPLATE
        .replace('{resetURL}', resetURL)
        .replace('{senderName}', sender.name),
      category: 'Password Reset',
    });

    return true;
  } catch (error: unknown) {
    console.error('Error sending reset email:', error);

    let message: string;
    if (error instanceof Error) {
      message = error.message;
    } else {
      message = String(error);
    }

    throw new Error(`Failed to send reset email: ${message}`);
  }
};
```

**Key Points**:
- Use `mailtrapClient.send()` with required fields
- Replace `{placeholders}` with actual values
- Category helps organize in Mailtrap dashboard
- Return true/false or throw on failure
- Log errors but don't expose to user

---

## Step 3: Call from Controller

File: `backend/controllers/auth.controller.ts`

```typescript
import { sendVerificationEmail, sendWelcomeEmail } from '../email/email.js';

export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password, first_name, last_name } = req.body;

    // ... validation and password hashing ...

    // Insert user
    const { data: newUser, error } = await database
      .from('users')
      .insert({
        email: email.toLowerCase(),
        password: hashedPassword,
        first_name,
        last_name,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Save token to DB (pseudo-code)
    await saveVerificationToken(newUser.id, verificationToken);

    // Send verification email
    const emailSent = await sendVerificationEmail(newUser.email, verificationToken);

    if (!emailSent) {
      console.warn('Verification email failed; user can request resend');
    }

    // Return response
    return res.status(201).json({
      success: true,
      data: {
        message: 'Signup successful. Check your email to verify your account.',
        user: newUser,
      },
    });
  } catch (error) {
    return handleControllerError(res, error, 'signup');
  }
};
```

---

## Step 4: Handle Email Verification

### Endpoint to Verify Email Link

```typescript
export const verifyAccount = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required',
      });
    }

    // Lookup token in DB
    const { data: verification, error } = await database
      .from('email_verifications')
      .select('user_id')
      .eq('token', token)
      .single();

    if (error || !verification) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token',
      });
    }

    // Mark user as verified
    const { error: updateError } = await database
      .from('users')
      .update({ is_verified: true })
      .eq('id', verification.user_id);

    if (updateError) throw new Error(updateError.message);

    // Delete used token
    await database
      .from('email_verifications')
      .delete()
      .eq('token', token);

    // Send welcome email
    const { data: user } = await database
      .from('users')
      .select('email')
      .eq('id', verification.user_id)
      .single();

    if (user) {
      await sendWelcomeEmail(user.email);
    }

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully!',
    });
  } catch (error) {
    return handleControllerError(res, error, 'verifyAccount');
  }
};
```

---

## Common Email Scenarios

### 1. Welcome Email (After Signup)

```typescript
export const sendWelcomeEmail = async (email: string) => {
  await mailtrapClient.send({
    from: sender,
    to: [{ email }],
    subject: 'Welcome to My App!',
    html: WELCOME_EMAIL_TEMPLATE
      .replace('{senderName}', sender.name)
      .replace('{dashboardURL}', `${process.env.CLIENT_URL}/home`),
    category: 'Welcome',
  });
};
```

### 2. Password Reset (On Forgot Password)

```typescript
export const sendPasswordResetEmail = async (email: string, resetToken: string) => {
  await mailtrapClient.send({
    from: sender,
    to: [{ email }],
    subject: 'Reset Your Password',
    html: PASSWORD_RESET_REQUEST_TEMPLATE
      .replace('{resetURL}', `${process.env.CLIENT_URL}/reset-password/${resetToken}`)
      .replace('{senderName}', sender.name),
    category: 'Password Reset',
  });
};
```

### 3. Notification Email

```typescript
export const sendNotificationEmail = async (
  email: string,
  title: string,
  message: string
) => {
  const template = `
    <h2>{title}</h2>
    <p>{message}</p>
  `;

  await mailtrapClient.send({
    from: sender,
    to: [{ email }],
    subject: title,
    html: template.replace('{title}', title).replace('{message}', message),
    category: 'Notification',
  });
};
```

---

## Testing Emails

### 1. Check Mailtrap Inbox

- Log in to [Mailtrap](https://mailtrap.io/)
- Check the **Inbox** for sent emails
- Verify HTML rendering and placeholders replaced

### 2. Test with cURL

```bash
# Trigger signup endpoint (sends verification email)
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "first_name": "John",
    "last_name": "Doe"
  }'

# Check Mailtrap for email
```

### 3. Inspect Email in DevTools

- Check email subject, sender, recipient
- Verify all `{placeholders}` replaced with actual values
- Check HTML renders correctly

---

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| Email not sent | Mailtrap token invalid | Check `EMAIL_TOKEN` in `.env` |
| Placeholders not replaced | `.replace()` typo | Match placeholder name exactly |
| Wrong sender | `sender.email` wrong | Update `SENDER` in `.env` |
| HTML not rendering | Complex CSS | Simplify styles; test in email clients |
| Email caught as spam | Missing unsubscribe | Add footer info |

---

## Best Practices

✅ **Do**:
- Keep templates simple and readable
- Always handle send failures gracefully
- Log what went wrong for debugging
- Test with real email provider (Mailtrap)
- Use descriptive categories
- Include contact/unsubscribe info

❌ **Don't**:
- Put secrets in emails
- Use complex CSS or images
- Require clicking links to activate features (unless critical)
- Send too many emails to one address
- Expose error messages to user (log them)

---

## Checklist

- [ ] Template created in `email.template.ts`
- [ ] Sender function created in `email.ts`
- [ ] Function called from controller
- [ ] Placeholders replaced correctly
- [ ] Error handling in place
- [ ] Mailtrap credentials in `.env`
- [ ] Email sent to Mailtrap inbox (verified)
- [ ] HTML renders correctly
- [ ] No secrets in template
- [ ] Category describes email purpose

---

**See Also**:
- [backend/CLAUDE.md](../backend/CLAUDE.md) — Backend conventions
- [BACKEND_API.md](./BACKEND_API.md) — Controller patterns
- [Mailtrap Docs](https://mailtrap.io/docs/) — Email service setup

**Last Updated**: 2026-03-19
