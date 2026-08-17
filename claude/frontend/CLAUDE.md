# CLAUDE.md — Frontend Guide

**Next.js 16 + React 19 frontend.** For global rules, see `../CLAUDE.md`.

---

## 🚀 Quick Start
```bash
npm run dev  # → http://localhost:3000
```

## 📦 Tech Stack
Next.js 16, React 19, TypeScript (strict), Zustand, Axios, Tailwind 4, DaisyUI, PrimeReact, styled-components, Socket.io client

## 📁 Directory Structure
```
frontend/src/
├── app/                   # Pages (Next.js App Router)
│   ├── (auth)/           # Auth pages: login, signup, verify-email, reset-password
│   ├── (root)/           # Home page
│   ├── (games)/          # Games section
│   ├── (user_settings)/  # User profile/settings
│   └── layout.tsx        # Root layout
├── stores/               # Zustand state (user, games, exercises, ui)
├── components/           # Shared UI (Container, Toast, menu, etc.)
└── lib/                  # axios.ts (HTTP client), socket setup
```

**Route Groups**: Use `(name)/` to organize without affecting URL. Example: `(auth)/login/page.tsx` → `/login`

---

## 💾 State Management (Zustand)

**Create Store** (`stores/feature.store.ts`):
```typescript
import { create } from 'zustand';
import instance from '../lib/axios';
import { toast } from 'react-hot-toast';

interface Store {
  data: any | null;
  loading: boolean;
  fetch: () => Promise<void>;
}

export const feature_store = create<Store>((set) => ({
  data: null,
  loading: false,

  fetch: async () => {
    set({ loading: true });
    try {
      const res = await instance.get('/endpoint');
      set({ data: res.data.data });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      set({ loading: false });
    }
  },
}));
```

**Use in Component**:
```typescript
'use client';
import { feature_store } from '@/src/stores/feature.store';

export default function Page() {
  const { data, loading, fetch } = feature_store();

  useEffect(() => { fetch(); }, []);

  return <div>{loading ? 'Loading...' : data}</div>;
}
```

**Error Handler**: Use `getErrorMessage(error)` utility to extract error messages from Axios errors

---

## 🌐 HTTP Client (Axios)

**Setup**: `src/lib/axios.ts`
```typescript
const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  withCredentials: true,  // Send JWT cookies
});
```

**Env var**: `frontend/.env.local` → `NEXT_PUBLIC_API_URL`

**Pattern**: All store methods use try/catch with `toast.error()` for error feedback

---

## 🎨 Styling

**Tailwind**: Layout (`flex`, `grid`, `w-*`, `p-*`, `m-*`, `gap-*`), Text (`text-*`, `font-bold`), Colors (`bg-gray-900`, `text-white`), Responsive (`md:flex-row`, `lg:w-1/2`)

**DaisyUI**: `btn btn-primary`, `card`, `input input-bordered`, `select select-bordered`

**PrimeReact**: Used for advanced components (see `app/layout.tsx` for theme imports)

**No custom CSS unless Tailwind can't do it.** File: `src/globals.css`

---

## 🔐 Authentication

**Flow**: Signup → POST `/api/auth/signup` → Email verification → POST `/api/auth/email-verification/{token}` → Login → POST `/api/auth/login` (JWT cookie set) → Protected calls use cookie (auto-sent via `withCredentials`)

**Check Auth**:
```typescript
const { user } = user_store();
if (!user) { /* Redirect to /login */ }
```

**Store**: `stores/user.store.ts` handles signup, login, logout, verify, reset password

---

## 📋 How-To

**Add Page**: 1) Create `src/app/(group)/page-name/page.tsx` with `'use client'` directive | 2) Import store | 3) Use `useEffect` to load data | 4) Style with Tailwind

**Add Component**: 1) Create `src/components/MyComponent.tsx` | 2) Accept props with TypeScript | 3) Import in page: `import MyComponent from '@/src/components/MyComponent'` | 4) Use: `<MyComponent title='Hello' />`

**Add API Call**: 1) Add method to store: `const res = await instance.get('/api-path'); set({ data: res.data.data });` | 2) Call in component: `useEffect(() => { store().fetchData(); }, []);` | 3) Render: `const { data } = store(); return <div>{data}</div>;`

**Form Validation**: Validate inputs before submit → Show `toast.error()` for validation errors → Never bypass client + server validation

---

## ⚠️ Error Handling

**Pattern**:
```typescript
try {
  const res = await instance.get('/endpoint');
  // Handle success
} catch (error) {
  const msg = getErrorMessage(error);
  toast.error(msg);
}
```

**Always**: Show user feedback (toast) | Handle loading states | Check response success flag

---

## ✅ Checklist

- [ ] Page/component has `'use client'` directive (if interactive)
- [ ] Store added (if fetching data)
- [ ] Styled with Tailwind (no inline styles)
- [ ] TypeScript compiles: `npx tsc --noEmit`
- [ ] Tested in browser at http://localhost:3000
- [ ] No console errors
- [ ] Form validation works (client + server)
- [ ] Error handling shows toast messages
- [ ] Loading states render correctly
- [ ] Responsive on mobile + desktop

---

## 🔗 Key Files

- **Auth**: `stores/user.store.ts`
- **HTTP Client**: `lib/axios.ts`
- **Socket**: `components/SocketInitializer.tsx`
- **Layout**: `app/layout.tsx`
- **Stores**: `stores/` (user, games, exercises, ui)

---

## ❓ Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (http://localhost:3000) |
| `npm run build` | Production build |
| `npm run lint` | Check code style |
| `npx tsc --noEmit` | Type-check (strict mode) |

---

**Last Updated**: 2026-03-19
