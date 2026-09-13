# CLAUDE.md — Project Guide

**Full-stack Node.js + React application with Express backend and Next.js frontend.**

---

## 🚀 Quick Start

**Frontend**: `cd frontend && npm run dev` → http://localhost:3000
**Backend**: `cd backend && npm run dev` → http://localhost:5000

---

## 📍 Navigation

- **Frontend work** → `frontend/CLAUDE.md`
- **Backend work** → `backend/CLAUDE.md`

---

## 🏗️ Architecture

```
project/
├── frontend/                # Next.js 16 + React 19 (Port 3000)
│   ├── CLAUDE.md           # Frontend docs
│   └── src/
│       ├── app/            # Pages (App Router)
│       ├── stores/         # Zustand state
│       ├── components/     # Shared UI
│       └── lib/            # Axios, Socket.io
│
├── backend/                # Express + TypeScript (Port 5000)
│   ├── CLAUDE.md          # Backend docs
│   ├── server.ts          # Entry point
│   ├── routes/            # Route definitions
│   ├── controllers/       # Business logic
│   ├── middleware/        # Auth middleware
│   ├── lib/               # DB client, utils
│   └── email/             # Email templates
│
└── claude/                # This folder
    ├── CLAUDE.md          # This file
    ├── backend/CLAUDE.md  # Backend specific
    └── frontend/CLAUDE.md # Frontend specific
```

---

## 📦 Tech Stack

**Backend**: Express, TypeScript, Supabase (PostgreSQL), JWT, bcrypt, Socket.io, Mailtrap
**Frontend**: Next.js 16, React 19, TypeScript, Zustand, Axios, Tailwind 4, DaisyUI, PrimeReact

---

## 🔒 Global Rules

1. **API Contract**: Always sync backend response shape with frontend expectations
2. **Security**: Never log JWT tokens, DATABASE_KEY, or email credentials
3. **TypeScript**: Avoid `any` types; strict mode enabled
4. **Auth**: Protected routes require `is_verified = true` and `deleted_at = null`
5. **Dependencies**: Justify new packages before installing

---

## 🔄 Common Workflows

### Add New Feature (API + UI)
1. **Backend**: Add controller → route → mount in server.ts
2. **Frontend**: Add store method → create page/component
3. **Verify**: Ensure API response shape matches frontend store

### Modify Auth Flow
1. **Backend**: Update `controllers/auth.controller.ts` + `middleware/auth.middleware.ts`
2. **Frontend**: Update `stores/user.store.ts`
3. **Pattern**: Signup → Email verification → Login → Protected routes

### Add Database Changes
1. Run migration in Supabase SQL editor
2. Update backend queries in controllers
3. Update frontend TypeScript interfaces if needed

---

## ✅ Definition of Done

- [ ] TypeScript compiles with no errors (`npm run dev`)
- [ ] Tested manually (browser or Postman)
- [ ] No breaking API changes without coordinating frontend
- [ ] No secrets in logs or console
- [ ] Error handling shows user-friendly messages
- [ ] Code follows patterns in `frontend/CLAUDE.md` or `backend/CLAUDE.md`

---

## 🔗 Response Format (Standard)

All API endpoints return:
```json
{
  "success": boolean,
  "data?": any,
  "message?": string
}
```

---

## 🎯 File Locations

**Auth**: `backend/controllers/auth.controller.ts`, `frontend/stores/user.store.ts`
**Database**: `backend/lib/db.ts` (Supabase client)
**Email**: `backend/email/email.ts` + `email.template.ts`
**HTTP Client**: `frontend/src/lib/axios.ts`
**Socket**: `backend/socket/index.ts`, `frontend/src/components/SocketInitializer.tsx`

---

## ❓ When Unsure

- **How to add endpoint?** → `backend/CLAUDE.md` → "How to Add an Endpoint"
- **How to add page?** → `frontend/CLAUDE.md` → "How to Add a Page"
- **Database patterns?** → `backend/CLAUDE.md` → "Database" section
- **State management?** → `frontend/CLAUDE.md` → "State Management Pattern"
- **Auth issues?** → Check middleware and store implementations

---

**Last Updated**: 2026-03-19
