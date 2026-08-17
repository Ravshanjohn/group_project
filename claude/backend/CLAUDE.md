# CLAUDE.md — Backend Guide

**Express.js + TypeScript backend.** For global rules, see `../CLAUDE.md`.

---

## 🚀 Quick Start
```bash
npm run dev  # → http://localhost:5000
```

## 📦 Tech Stack
Express, TypeScript (strict), Supabase (PostgreSQL), JWT (7-day expiry), bcrypt, Socket.io, Mailtrap

## 📁 Directory Structure
```
backend/
├── server.ts              # Entry point, route mounting
├── routes/                # Route definitions (auth, games, exercises)
├── controllers/           # Business logic
├── middleware/            # auth.middleware.ts (JWT validation)
├── lib/                   # db.ts (Supabase), utils.ts (helpers)
├── email/                 # email.ts (send), email.template.ts (HTML)
├── socket/                # Socket.io setup
└── constants/             # roles.ts
```

---

## 🔀 Endpoint Pattern (3 Steps)

**1. Controller** (`controllers/feature.controller.ts`):
Validate input → return 400 if invalid | Query `database` → throw if error | Return `{ success: boolean, data?, message? }` | Wrap in try/catch → `handleControllerError(res, error, 'handlerName')`

**2. Route** (`routes/feature.route.ts`):
Import controller + `express.Router()` | Define: `router.post('/path', protectRoute?, handler)` | Export router

**3. Mount** (`server.ts`):
```typescript
import featureRoutes from './routes/feature.route.js';
app.use('/api', featureRoutes);
```

**Status Codes**: 200 (OK), 201 (Created), 400 (Bad input), 401 (Unauthorized), 403 (Forbidden), 404 (Not found), 500 (Server error)

---

## 🔐 Middleware

**`protectRoute`** — Validates JWT cookie, fetches user, checks `is_verified` + `deleted_at`
```typescript
router.get('/secure', protectRoute, handler);
// Inside: const user = (req as any).user;
```
**`isAdmin`** — Checks role (TODO: use DB column instead of hardcode)

## 💾 Database & Auth

**Client**: `database` from `lib/db.ts`

**Patterns**:
```typescript
// Select
const { data, error } = await database.from('users').select('id, email').eq('id', userId).single();
if (error) throw new Error(error.message);

// Insert
const { data, error } = await database.from('users').insert({ email, password_hash }).select().single();

// RPC
const { data, error } = await database.rpc('func_name', { param: value });
```

**Auth Flow**: Signup → Hash password (bcrypt) → Insert user (`is_verified = false`) → Send verification email | Email Verify → Validate token → Update `is_verified = true` | Login → Validate credentials → Generate JWT → Set httpOnly cookie | Protected Routes → `protectRoute` validates JWT

**JWT Cookie**: httpOnly + sameSite (strict/none) + secure + 7-day expiry | **Utils**: `generateToken(userId, res)` in `lib/utils.ts`

## 📧 Email

**Template** (`email/email.template.ts`): `export const TEMPLATE = '<html>...<a href="{url}">Link</a>...</html>';`
**Sender** (`email/email.ts`): `await mailtrapClient.send({ from, to: [{ email }], subject, html: TEMPLATE.replace('{url}', url), category });`
**Call**: `await sendEmail(user.email, token);`

---

## 📋 How-To

**Add Endpoint**: 1) Create controller with validation, DB query, response | 2) Add route: `router.method('/path', protectRoute?, handler)` | 3) Mount in `server.ts`: `app.use('/api', routes)` | 4) Test: `curl -X POST http://localhost:5000/api/path -d '{}' -H "Content-Type: application/json"`

**Database Migration**: Supabase dashboard → SQL Editor → Run: `ALTER TABLE users ADD COLUMN phone VARCHAR;` → Update controller: `.select('id, email, phone, ...')` → Update frontend types if needed

**Error Handling**: Wrap in try/catch → `return handleControllerError(res, error, 'functionName')` | Validation: Return 400 early | DB Errors: Throw | Auth: Middleware returns 401/403

**Response Format**: `{ "success": true|false, "data?": {...}, "message?": "string" }`

---

## 🌐 Environment Variables

**File**: `backend/.env` (never commit!)
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=https://xxx.supabase.co
DATABASE_KEY=eyJ...
JWT_SECRET=your_secret_here
CLIENT_URL=http://localhost:3000
EMAIL_TOKEN=mailtrap_token
SENDER=hello@example.com
```

---

## ✅ Checklist

- [ ] Controller has try/catch + error handling
- [ ] Input validated (400 for invalid)
- [ ] DB query has error check
- [ ] Response uses standard format `{ success, data?, message? }`
- [ ] Route mounted in `server.ts`
- [ ] TypeScript compiles: `npx tsc --noEmit`
- [ ] Tested with Postman/cURL
- [ ] Protected routes use `protectRoute`
- [ ] No secrets logged

---

## 🔗 Key Files

- **Auth**: `controllers/auth.controller.ts`, `middleware/auth.middleware.ts`
- **DB**: `lib/db.ts`
- **Utils**: `lib/utils.ts` (generateToken, handleControllerError)
- **Email**: `email/email.ts`, `email/email.template.ts`
- **Socket**: `socket/index.ts`, `socket/socket.ts`

---

## ❓ Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with auto-reload |
| `npx tsc --noEmit` | Type-check without build |

---

**Last Updated**: 2026-03-19
