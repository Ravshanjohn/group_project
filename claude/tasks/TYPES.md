# tasks/TYPES.md — Define & Update Types

Guide to creating and managing TypeScript interfaces and types.

**Quick Navigation**: [Overview](#overview) | [Frontend Types](#frontend-types) | [Backend Types](#backend-types) | [API Contracts](#api-contract-types) | [Common Patterns](#common-type-patterns) | [Organization](#file-organization)

---

## Overview

Types define data shape flowing through app:
- **Frontend**: Based on backend API responses
- **Backend**: Based on database tables
- **Shared**: Common interfaces used by both

---

## When to Create a Type

| Scenario | Action |
|----------|--------|
| Single-use in one file | Inline interface in component |
| Used in 2+ files | Create in `src/types/` |
| API response shape | Define on backend first |
| Database row | Define on backend |

---

## Frontend Types

**Inline** (single file):
```typescript
interface FormData { email: string; password: string; }
```

**Exported** (multi-file):
```typescript
// src/types/user.ts
export interface User {
  id: string; email: string; first_name: string;
  is_verified: boolean; created_at: string;
}
```

Use in store:
```typescript
// stores/user.store.ts
const response = await instance.post('/auth/login');
const { user }: { user: User } = response.data.data;
```

---

## Backend Types

**Database schema reflection**:
```typescript
// Define based on Supabase table structure
interface DbUser {
  id: string; email: string; first_name: string;
  is_verified: boolean; created_at: string;
}
```

**API response wrapper**:
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}
```

---

## TypeScript Rules

- No `any` types (strict mode enabled)
- Use `interface` for objects, `type` for unions
- Export reusable types from `types/` folder
- Match API contract between frontend + backend
- Use `Partial<T>` for optional fields
- Use generics for reusable patterns

```typescript
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Game {
  id: string;
  slug: string;
  name: string;
  description: string;
  is_active: boolean;
}

export interface Score {
  user_id: string;
  user_name: string;
  score: number;
  difficulty: Difficulty;
  status: 'completed' | 'failed';
}
```

---

## Backend Types

### Inline (Single Controller)

```typescript
// backend/controllers/auth.controller.ts
const { email, password }: { email: string; password: string } = req.body;
```

### Exported (Multi-Controller)

File: `backend/types/user.ts` (create if needed)

```typescript
export interface User {
  id: string;
  email: string;
  password: string; // Hashed!
  first_name: string;
  last_name: string;
  is_verified: boolean;
  deleted_at: string | null;
}

export interface SignupRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: Omit<User, 'password'>;
    token: string;
  };
}
```

**Use in controller**:

```typescript
import type { User, SignupRequest } from '../types/user';

export const signup = async (req: Request, res: Response) => {
  const { email, password }: SignupRequest = req.body;
  // ...
  const user: User = await db.insert(...);
};
```

---

## Database Types (Supabase)

Database table to type mapping:

**Table: `users`**
```sql
id UUID
email VARCHAR
password_hash VARCHAR
first_name VARCHAR
last_name VARCHAR
is_verified BOOLEAN
deleted_at TIMESTAMP
created_at TIMESTAMP
```

**Type**:
```typescript
export interface User {
  id: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  is_verified: boolean;
  deleted_at: string | null;
  created_at: string;
}
```

**Query with type**:
```typescript
const { data: user } = await database
  .from('users')
  .select('*')
  .eq('id', userId)
  .single<User>();
```

---

## API Contract Types

### Standard Response Format

All API endpoints return:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}
```

**Usage**:
```typescript
// Backend
return res.status(200).json({
  success: true,
  data: { user, token },
});

// Frontend
const res = await instance.post('/endpoint');
const { data }: ApiResponse<AuthData> = res.data;
```

### Define Endpoint Contracts

```typescript
// backend/types/endpoints.ts
export interface GetGamesResponse {
  success: boolean;
  data: Game[];
}

export interface SetScoreRequest {
  game_slug: string;
  score: number;
  status: 'completed' | 'failed';
  difficulty: Difficulty;
}

export interface SetScoreResponse {
  success: boolean;
  data: { score_id: string };
}

// frontend/src/types/api.ts (mirror)
import type {
  GetGamesResponse,
  SetScoreRequest,
  SetScoreResponse,
} from '@/src/api/endpoints';

// Use in store
const response = await instance.get<GetGamesResponse>('/games');
```

---

## Frontend Store Types

### Full Store Interface

```typescript
// frontend/src/stores/exercises.store.ts
import type { Exercise } from '@/src/types/exercises';

interface ExercisesStore {
  exercises: Exercise[];
  loading: boolean;
  currentExercise: Exercise | null;
  solutionCode: string;

  fetchExercises: () => Promise<void>;
  selectExercise: (id: string) => void;
  submitSolution: (code: string) => Promise<boolean>;
  reset: () => void;
}

export const exercises_store = create<ExercisesStore>((set, get) => ({
  exercises: [],
  loading: false,
  currentExercise: null,
  solutionCode: '',

  fetchExercises: async () => {
    // Implementation
  },

  // ... other methods
}));
```

---

## Validation Types (Frontend)

### Form Data Types

```typescript
interface LoginFormData {
  email: string;
  password: string;
}

interface SignupFormData extends LoginFormData {
  first_name: string;
  last_name: string;
  confirmPassword: string;
}

// Use
const [form, setForm] = useState<LoginFormData>({ email: '', password: '' });
```

### Validate Before Submit

```typescript
function validateSignup(data: SignupFormData): string[] {
  const errors: string[] = [];

  if (!data.email) errors.push('Email required');
  if (!data.password) errors.push('Password required');
  if (data.password !== data.confirmPassword) errors.push('Passwords must match');

  return errors;
}
```

---

## Common Type Patterns

### Optional Fields

```typescript
interface User {
  id: string;
  email: string;
  avatar?: string;  // Optional
}

// Using
const user: User = { id: '1', email: 'test@example.com' };  // ✅ OK
```

### Union Types (One of Several)

```typescript
type GameStatus = 'active' | 'paused' | 'completed';
type Difficulty = 'Easy' | 'Medium' | 'Hard';

interface GameScore {
  status: GameStatus;
  difficulty: Difficulty;
}
```

### Readonly

```typescript
interface Config {
  readonly API_URL: string;
}

const config: Config = { API_URL: 'http://localhost:5000/api' };
// config.API_URL = 'new'; // ❌ Error
```

### Omit (Remove Fields)

```typescript
interface User {
  id: string;
  email: string;
  password: string;
}

// API returns user without password
type UserPublic = Omit<User, 'password'>;
const user: UserPublic = { id: '1', email: 'test@example.com' };
```

### Pick (Select Fields)

```typescript
type UserPreview = Pick<User, 'id' | 'email'>;
```

### Array of Types

```typescript
interface Game {
  id: string;
  name: string;
}

const games: Game[] = [
  { id: '1', name: 'Snake' },
  { id: '2', name: 'Tic-Tac-Toe' },
];
```

---

## File Organization

### Simple Project
```
frontend/src/
├── types/           # All types
│   ├── user.ts
│   ├── game.ts
│   └── api.ts
└── stores/
    ├── user.store.ts
    └── games.store.ts
```

### Growing Project
```
backend/
├── types/
│   ├── user.ts
│   ├── game.ts
│   ├── db.ts       # All database types
│   └── api.ts      # API response shapes
├── controllers/
├── routes/
└── lib/
```

---

## Updating Existing Types

### When to Update
- API response adds new field → Update response type
- Database column added → Update database type
- Frontend store adds property → Update store type

### Process
1. **Update type definition**
2. **Update consuming code** (store, controller, component)
3. **Compile**: `npx tsc --noEmit`
4. **Test**: Run app, verify no errors

### Example

**Old**:
```typescript
interface User {
  id: string;
  email: string;
}
```

**New** (added `avatar` field):
```typescript
interface User {
  id: string;
  email: string;
  avatar?: string;  // New optional field
}
```

**Update APIs**:
```typescript
// Backend: Return new field
return res.json({
  success: true,
  data: { user, ...includingAvatar },
});

// Frontend: Handle new field
const { user } = response.data;
display(user.avatar);  // May be undefined, but that's OK
```

---

## Checklist

- [ ] Type matches actual data shape (frontend vs backend)
- [ ] Required vs optional fields correct
- [ ] Used consistently across files
- [ ] API responses typed
- [ ] Database queries typed
- [ ] Store interfaces fully type store methods
- [ ] No `any` types (use proper types)
- [ ] TypeScript compiles: `npx tsc --noEmit`
- [ ] No runtime errors related to types

---

**See Also**:
- [frontend/CLAUDE.md](../frontend/CLAUDE.md) — Frontend conventions
- [backend/CLAUDE.md](../backend/CLAUDE.md) — Backend conventions
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) — Full reference

**Last Updated**: 2026-03-19
