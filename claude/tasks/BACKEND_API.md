# tasks/BACKEND_API.md — Add Backend API Endpoint

Step-by-step guide to add or modify a backend API endpoint.

**Quick Navigation**: [Overview](#overview) | [Create Controller](#step-1-create-the-controller) | [Create Route](#step-2-create-or-update-route) | [Mount in Server](#step-3-mount-route-in-server) | [Testing](#testing-your-endpoint) | [Common Patterns](#common-patterns)

---

## Overview

Three files needed:
1. **Controller** — Business logic
2. **Route** — HTTP method + path
3. **Mount** in `server.ts` — Register route

---

## Step 1: Create Controller

File: `backend/controllers/feature.controller.ts`

Pattern:
- Validate input early (return 400 if invalid)
- Use `database` for queries
- Throw error if DB fails
- Return `{ success, data?, message? }`
- Wrap in try/catch
- Call `handleControllerError()` in catch

```typescript
// Validate input
// Query DB
// Check for errors
// Return response (200, 201, 400, 404, etc)
```

Status codes: 200 (OK), 201 (Created), 400 (Bad input), 401 (Unauthorized), 403 (Forbidden), 404 (Not found)

---

## Step 2: Create Route

File: `backend/routes/feature.route.ts`

Pattern:
- Import controller
- Create `express.Router()`
- Define endpoints: `router.get/post/put/delete('/path', protectRoute?, handler)`
- Use `protectRoute` for auth-required endpoints
- Export router

```typescript
// Import { handler } from controller
// Create router
// Define methods: get, post, put, delete
// Use protectRoute middleware if needed
// Export router
```

---

## Step 3: Mount in Server

File: `backend/server.ts`

Add to app initialization:
```typescript
// Import your route
// Use: app.use('/api/path', routerImport)
```

---

## Full Endpoint Checklist

- [ ] Controller validates input (400 if empty)
- [ ] Controller queries DB correctly
- [ ] Controller handles errors with try/catch
- [ ] Controller returns standard format
- [ ] Route file created with handlers
- [ ] Route registered in server.ts
- [ ] Test via Postman or browser
- [ ] TypeScript compiles: `npx tsc --noEmit`

// Protected endpoint (requires JWT)
router.post('/protected-endpoint', protectRoute, myOtherHandler);

// Admin-only endpoint
router.delete('/admin-endpoint', protectRoute, isAdmin, myHandler);

export default router;
```

### Option B: Update Existing Route File

If route file exists (e.g., `auth.route.ts`), just add:

```typescript
router.post('/new-endpoint', protectRoute, myNewHandler);
```

### Key Points:
- Import handlers from controller
- Import middleware: `protectRoute`, `isAdmin`
- Syntax: `router.METHOD(path, [middleware...], handler)`
- Methods: `get`, `post`, `put`, `patch`, `delete`
- Order matters: middleware runs left-to-right
- Final URL: `/api` + route file path prefix + route path

---

## Step 3: Mount Route in Server

File: `backend/server.ts`

Add before `server.listen()`:

```typescript
import featureRoutes from './routes/feature.route.js';

// ... other routes ...

app.use('/api', featureRoutes);  // Final URL: /api/public-endpoint, etc.

server.listen(PORT, () => {
  console.log(`Server running on PORT: ${PORT}`);
});
```

### Key Points:
- Import route file
- Use `app.use('/api', featureRoutes)` to mount
- Order doesn't matter much, but keep organized
- All mounted routes are prefixed with `/api`

---

## Step 4: Update Frontend (if needed)

If your new endpoint returns data, update the frontend store.

File: `frontend/src/stores/feature.store.ts`

```typescript
import { create } from 'zustand';
import instance from '../lib/axios';
import { toast } from 'react-hot-toast';

interface Feature {
  id: string;
  name: string;
}

interface Store {
  data: Feature | null;
  loading: boolean;
  fetchData: (id: string) => Promise<void>;
}

export const feature_store = create<Store>((set) => ({
  data: null,
  loading: false,

  fetchData: async (id: string) => {
    set({ loading: true });
    try {
      const response = await instance.get(`/public-endpoint?id=${id}`);
      const { data } = response.data;
      set({ data });
      toast.success('Data loaded!');
    } catch (error) {
      toast.error('Failed to load data');
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
```

Use in component:

```typescript
'use client';
import { feature_store } from '@/src/stores/feature.store';

export default function MyComponent() {
  const { data, loading } = feature_store();

  useEffect(() => {
    feature_store().fetchData('123');
  }, []);

  return (
    <div>
      {loading && <p>Loading...</p>}
      {data && <p>{data.name}</p>}
    </div>
  );
}
```

---

## Example: Full Flow

### Scenario: Add endpoint to fetch user games

**1. Controller** (`backend/controllers/games.controller.ts`):
```typescript
export const getUserGames = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;  // From protectRoute middleware

    const { data: games, error } = await database
      .from('user_games')
      .select('id, game_slug, score')
      .eq('user_id', user.id);

    if (error) throw new Error(error.message);

    return res.status(200).json({
      success: true,
      data: games,
    });
  } catch (error) {
    return handleControllerError(res, error, 'getUserGames');
  }
};
```

**2. Route** (`backend/routes/games.route.ts`):
```typescript
router.get('/my-games', protectRoute, getUserGames);
```

**3. Mount** (already exists in `server.ts`):
```typescript
app.use('/api', gamesRoutes);
```

**4. Frontend** (`frontend/src/stores/games.store.ts`):
```typescript
getUserGames: async () => {
  set({ loading: true });
  try {
    const res = await instance.get('/my-games');
    set({ games: res.data.data });
  } catch (error) {
    toast.error('Failed to load games');
    throw error;
  } finally {
    set({ loading: false });
  }
},
```

**5. Use** (`frontend/src/app/(games)/games/page.tsx`):
```typescript
'use client';
import { games_store } from '@/src/stores/games.store';

export default function GamesPage() {
  const { games } = games_store();

  useEffect(() => {
    games_store().getUserGames();
  }, []);

  return <div>{games?.map(g => <p key={g.id}>{g.game_slug}</p>)}</div>;
}
```

---

## Testing Your Endpoint

### Via cURL

```bash
# GET (public)
curl http://localhost:5000/api/public-endpoint

# POST with JSON
curl -X POST http://localhost:5000/api/protected-endpoint \
  -H "Content-Type: application/json" \
  -H "Cookie: jwt=<your-token>" \
  -d '{"field": "value"}'

# GET with auth
curl -H "Cookie: jwt=<your-token>" http://localhost:5000/api/my-games
```

### Via Postman
1. Create request
2. Set method (GET/POST/etc.)
3. Set URL: `http://localhost:5000/api/endpoint-path`
4. If protected, add Cookie header: `jwt=<token>`
5. If POST/PUT, set Body → JSON → add payload
6. Send

---

## Common Patterns

### Query Parameters (GET)
```typescript
// Route
router.get('/search', myHandler);

// Controller
const { query } = req.query;  // /search?query=text → "text"

// Frontend
instance.get('/search', { params: { query: 'text' } });
```

### URL Parameters (Dynamic)
```typescript
// Route
router.get('/item/:id', myHandler);

// Controller
const { id } = req.params;  // /item/123 → "123"

// Frontend
instance.get(`/item/${itemId}`);
```

### Body Parameters (POST/PUT)
```typescript
// Route
router.post('/create', myHandler);

// Controller
const { field1, field2 } = req.body;

// Frontend
instance.post('/create', { field1: 'val1', field2: 'val2' });
```

### Protected Routes
```typescript
// Add protectRoute middleware
router.post('/protected', protectRoute, myHandler);

// Access user in controller
const user = (req as any).user;
```

---

## Checklist

- [ ] Controller exported and has try/catch
- [ ] Input validated; return 400 if invalid
- [ ] Database query has error check
- [ ] Response has `{ success: boolean, data?, message? }`
- [ ] Route file created or updated
- [ ] Route mounted in `server.ts`
- [ ] Frontend store updated (if data endpoint)
- [ ] TypeScript compiles: `npx tsc --noEmit`
- [ ] Tested with cURL/Postman
- [ ] No secrets logged

---

**See Also**:
- [backend/CLAUDE.md](../backend/CLAUDE.md) — Full backend conventions
- [AUTH.md](./AUTH.md) — Auth flow updates
- [TYPES.md](./TYPES.md) — Type definitions

**Last Updated**: 2026-03-19
