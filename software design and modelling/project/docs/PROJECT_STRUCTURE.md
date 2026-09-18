# Project Structure — Programming Learning Platform

## Overview

The Programming Learning Platform is a full-stack web application built with **Next.js** (frontend) and **Express.js** (backend), using **Supabase** as the database layer. The platform supports user authentication, programming exercises, progress tracking, educational games, and leaderboards.

---

## Root Directory

```
project/
├── backend/            # Express.js REST API server
├── frontend/           # Next.js web application
├── docs/               # Project documentation and test artefacts
├── package.json        # Root workspace config
└── .gitignore
```

---

## Backend (`backend/`)

The backend is a **TypeScript + Express 5** API server that communicates with **Supabase** for database operations. It uses **JWT** for authentication and **bcrypt** for password hashing.

```
backend/
├── server.ts                          # Entry point — Express app setup, middleware, route mounting
├── package.json                       # Dependencies and scripts (dev: nodemon + tsx)
├── tsconfig.json                      # TypeScript configuration (ESM, strict mode)
├── .env                               # Environment variables (DB credentials, JWT secret, etc.)
│
├── controllers/                       # Request handlers (business logic)
│   ├── auth.controller.ts             # login, signup, logout, verifyAccount, verifyEmail, forgotPassword, resetPassword, getUser, checkAuthStatus, getSystemInfo
│   ├── exercises.controller.ts        # getExerciseBySlug, getAllExercises, getTestCase, getExerciseSignature, getInitialCode, getExerciseLanguages, recordExerciseEvent, createExercise, getMaps, getMapExercises
│   ├── games.controller.ts            # getGameBySlug, getAllActiveGames, setUserBalance, setUserScore, getScoresByDifficulty, findUserScore, getUserXP
│   ├── user.controller.ts             # User profile operations
│   ├── user.exercise.controller.ts    # getUserCode, saveUserCode, setUserExerciseStatus, setUserExerciseViewed, setUserExerciseCompleted, getUserExerciseCompleted, getUserUnlockedExercises, getUserSubscribedMaps
│   ├── admin.controller.ts            # Admin-only operations
│   └── bcrypt.d.ts                    # Type declaration for bcrypt
│
├── routes/                            # Express route definitions
│   ├── auth.route.ts                  # /api/auth/* — signup, login, logout, password reset, email verification
│   ├── games.route.ts                 # /api/games/* — game data, scores, leaderboards, XP balance
│   ├── exercises.route.ts             # /api/exercises/* — exercise CRUD, test cases, signatures, languages
│   ├── user.exercise.route.ts         # /api/user/exercises/* — user code, progress, completion status
│   ├── user.route.ts                  # /api/user/* — user profile routes
│   └── admin.route.ts                 # /api/admin/* — admin-only routes
│
├── middleware/
│   └── auth.middleware.ts             # protectRoute (JWT verification + user lookup), isAdmin
│
├── lib/
│   ├── db.ts                          # Supabase client initialisation
│   └── utils.ts                       # generateToken (JWT + cookie), handleControllerError
│
├── email/
│   ├── email.ts                       # Email sending functions
│   ├── email.config.ts                # Mailtrap configuration
│   └── email.template.ts             # HTML email templates
│
├── constants/
│   ├── types.ts                       # Shared TypeScript types (CreateExercisePayload)
│   └── roles.ts                       # Role constants
│
└── socket/
    ├── index.ts                       # Socket.IO server setup
    └── socket.ts                      # Socket event handlers
```

### Key Backend API Routes

| Method | Route                                          | Auth Required | Description                        |
|--------|------------------------------------------------|---------------|------------------------------------|
| POST   | `/api/auth/signup`                             | No            | Register a new user                |
| POST   | `/api/auth/login`                              | No            | Authenticate and receive JWT       |
| POST   | `/api/auth/logout`                             | No            | Revoke session token               |
| POST   | `/api/auth/forgot-password`                    | No            | Request password reset email       |
| POST   | `/api/auth/reset-password/:token`              | No            | Reset password with token          |
| POST   | `/api/auth/email-verification/:token`          | No            | Verify email address               |
| POST   | `/api/auth/verify-email`                       | No            | Resend verification email          |
| GET    | `/api/auth/get-user`                           | Yes           | Get authenticated user data        |
| GET    | `/api/auth/profile`                            | Yes           | Check auth status                  |
| GET    | `/api/auth/device-info`                        | Yes           | Get client device info             |
| GET    | `/api/games`                                   | No            | List all active games              |
| GET    | `/api/games/slug/:slug`                        | No            | Get game by slug                   |
| GET    | `/api/games/score/leaderboard`                 | Yes           | Get leaderboard by game/difficulty |
| GET    | `/api/games/find/score`                        | Yes           | Find user's active game session    |
| GET    | `/api/user/balance`                            | Yes           | Get user XP balance                |
| POST   | `/api/games/score`                             | Yes           | Add XP to user balance             |
| POST   | `/api/games/set/score`                         | Yes           | Submit game score                  |
| GET    | `/api/exercises`                               | No            | List all exercises                 |
| GET    | `/api/exercises/:slug`                         | No            | Get exercise by slug               |
| GET    | `/api/exercises/test-case/:slug`               | No            | Get exercise test cases            |
| GET    | `/api/exercises/signature/:slug`               | No            | Get exercise function signature    |
| GET    | `/api/exercises/initial-code/:slug`            | Yes           | Get initial code for exercise      |
| GET    | `/api/exercises/get-exercise-languages/:slug`  | No            | Get supported languages            |
| POST   | `/api/exercises/record-exercise-event/:slug`   | Yes           | Record exercise interaction        |
| GET    | `/api/user/exercises/get-user-code/:slug`      | Yes           | Get user's saved code              |
| POST   | `/api/user/exercises/save-user-code/:slug`     | Yes           | Save user's code                   |
| POST   | `/api/user/exercises/set-exercise-user-status/:slug`    | Yes | Update exercise status    |
| POST   | `/api/user/exercises/set-exercise-user-viewed/:slug`    | Yes | Mark exercise as viewed   |
| POST   | `/api/user/exercises/set-exercise-user-completed/:slug` | Yes | Mark exercise completed   |

---

## Frontend (`frontend/`)

The frontend is a **Next.js 16** application using the **App Router**, **TypeScript**, **Tailwind CSS 4**, and **DaisyUI** for styling. State management uses **Zustand**.

```
frontend/
├── package.json                       # Dependencies and scripts
├── tsconfig.json                      # TypeScript configuration
├── next.config.ts                     # Next.js configuration
├── eslint.config.mjs                  # ESLint configuration
├── postcss.config.mjs                 # PostCSS (Tailwind) configuration
├── tailwind.config.ts                 # Tailwind CSS configuration
├── public/                            # Static assets (SVGs)
│
└── src/
    ├── app/
    │   ├── layout.tsx                 # Root layout
    │   ├── globals.css                # Global styles
    │   ├── favicon.ico
    │   │
    │   ├── (auth)/                    # Authentication pages (grouped route)
    │   │   ├── login/page.tsx
    │   │   ├── signup/
    │   │   │   ├── page.tsx
    │   │   │   └── signup_components/
    │   │   │       ├── HandleSignUp.tsx        # Form validation + password strength logic
    │   │   │       └── PasswordStrength.tsx    # Password strength indicator UI
    │   │   ├── verify-email/
    │   │   │   ├── page.tsx
    │   │   │   └── [token]/page.tsx
    │   │   └── reset-password/
    │   │       ├── page.tsx
    │   │       ├── layout.tsx
    │   │       └── [token]/page.tsx
    │   │
    │   ├── (root)/                    # Main landing / home pages
    │   │   ├── page.tsx
    │   │   ├── my-paths/page.tsx
    │   │   └── components_home/
    │   │       ├── cards.tsx
    │   │       └── FilterBar.tsx
    │   │
    │   ├── exercises/
    │   │   └── [slug]/
    │   │       ├── page.tsx
    │   │       └── components/
    │   │           ├── Terminal.tsx
    │   │           ├── ResizableSidebar.tsx
    │   │           └── ResetConfirmationModal.tsx
    │   │
    │   ├── (games)/                   # Games section (grouped route)
    │   │   ├── games/
    │   │   │   ├── page.tsx           # Games listing
    │   │   │   ├── layout.tsx
    │   │   │   ├── [slug]/page.tsx    # Individual game page
    │   │   │   ├── breakout/page.tsx
    │   │   │   ├── snake/page.tsx
    │   │   │   └── tic-tac-toe/
    │   │   │       ├── page.tsx
    │   │   │       ├── ai/page.tsx
    │   │   │       └── select/page.tsx
    │   │   └── components/
    │   │       ├── LeftSideBarMenu.tsx
    │   │       ├── RightSideBarMenu.tsx
    │   │       ├── games.config.tsx
    │   │       └── games.types.ts
    │   │
    │   ├── (user_settings)/           # User settings (grouped route)
    │   │   ├── user/
    │   │   │   ├── layout.tsx
    │   │   │   ├── profile/page.tsx
    │   │   │   ├── settings/page.tsx
    │   │   │   ├── progress/page.tsx
    │   │   │   ├── balance/page.tsx
    │   │   │   └── certificates/page.tsx
    │   │   └── components/
    │   │       ├── UserSettingsContainer.tsx
    │   │       └── UserSettingsMenu.tsx
    │   │
    │   ├── admin/                     # Admin panel
    │   │   ├── page.tsx
    │   │   ├── exercises/page.tsx
    │   │   └── maps/
    │   │       ├── page.tsx
    │   │       └── [id]/page.tsx
    │   │
    │   └── shortcuts/page.tsx
    │
    ├── api/                           # API client functions (Axios)
    │   ├── auth.api.ts
    │   ├── exercises.api.ts
    │   ├── games.api.ts
    │   ├── user.api.ts
    │   ├── user.exercise.api.ts
    │   └── admin.api.ts
    │
    ├── stores/                        # Zustand state stores
    │   ├── auth.store.ts
    │   ├── exercises.store.ts
    │   ├── games.store.ts
    │   ├── ui.store.ts
    │   └── user.exercise.store.ts
    │
    ├── lib/                           # Shared utilities
    │   ├── axios.ts                   # Axios instance configuration
    │   ├── errors.ts                  # getErrorMessage() — unified error extraction
    │   ├── socket.ts                  # Socket.IO client
    │   └── useTheme.ts               # Theme hook
    │
    ├── components/                    # Shared UI components
    │   ├── Container.tsx
    │   ├── LoadingSpinner.tsx
    │   ├── menu.tsx
    │   ├── MoreOption.tsx
    │   ├── SocketInitializer.tsx
    │   └── Toast.tsx
    │
    ├── types/
    │   └── user.ts                    # User type definitions
    │
    └── proxy.ts                       # API proxy configuration
```

---

## Technology Stack

| Layer      | Technology                                              |
|------------|---------------------------------------------------------|
| Frontend   | Next.js 16, React 19, TypeScript, Tailwind CSS 4, DaisyUI, Zustand |
| Backend    | Express 5, TypeScript, Node.js (ESM)                   |
| Database   | Supabase (PostgreSQL)                                   |
| Auth       | JWT (jsonwebtoken), bcrypt, HTTP-only cookies           |
| Email      | Mailtrap                                                |
| Real-time  | Socket.IO                                               |
| Testing    | Vitest (unit + integration), Playwright (system/E2E)    |
| Linting    | ESLint, TypeScript strict mode                          |

---

## How to Run

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:4001` and the backend port is configured via `PORT` in `.env`.
