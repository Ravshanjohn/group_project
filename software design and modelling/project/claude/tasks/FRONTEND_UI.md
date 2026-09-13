# tasks/FRONTEND_UI.md — Add Frontend Page/Component

Quick guide for adding frontend pages and components.

## Overview

Three core requirements:
1. **Page file** in `frontend/src/app/` (Next.js routing)
2. **Store** (if needed) in `frontend/src/stores/` for shared state
3. **Styling** using Tailwind CSS

## Page Structure

Create page files in `frontend/src/app/`. Folder structure maps to URLs:
- `src/app/page.tsx` → `/`
- `src/app/login/page.tsx` → `/login`
- `src/app/(group)/page.tsx` → `/` (group hides in URL)
- `src/app/games/[slug]/page.tsx` → `/games/:slug` (dynamic route)

## Step 1: Create Page

File: `frontend/src/app/your-path/page.tsx`

```typescript
// Use 'use client' for interactivity (hooks, state)
// Import store if data-heavy, else use useState for local state
// Call store.loadData() in useEffect on mount
// Handle loading state during fetch
// Apply Tailwind classes for styling
// Import reusable components as needed
```

## Step 2: Create Store (if data-heavy)

File: `frontend/src/stores/feature.store.ts`

```typescript
// Use zustand with create()
// Define data interface for type safety
// Use setError, setLoading for state management
// Make async methods return Promise
// Wrap API calls in try/catch via instance (axios)
// Show toast.error() on failures
// Use getErrorMessage() utility for consistent errors
```

## Step 3: Style with Tailwind

Use core classes:
- **Layout**: `w-full`, `flex`, `items-center` → grid layouts
- **Text**: `text-3xl`, `font-bold`, `text-white` → typography
- **Colors**: `bg-gray-900`, `text-gray-400` → Keep the UI visually consistent across the entire app. Use a simple, uniform dark theme. Avoid “AI-designed” flashy palettes and avoid introducing new/random colors per page.
- **Spacing**: `p-6`, `m-4`, `space-y-4` → gaps & padding
- **Responsive**: `md:flex-row` → mobile-first breakpoints
- **DaisyUI**: `btn btn-primary`, `input input-bordered`, `card` → components

## Step 4: Handle Forms

```typescript
// Use useState for form state
// Call validate() before submit
// Await store method and catch errors
// Reset form on success
// Show loading state during submission
```

## Step 5: Reusable Components

Create in `frontend/src/components/`:
```typescript
// Accept children and props as interface
// Use ReactNode type for children
// Apply Tailwind for styling
// Keep pure & testable
```

## Testing Checklist

- [ ] Page renders at correct URL
- [ ] Data loads on mount
- [ ] Loading state displays during fetch
- [ ] Error messages shown on failure
- [ ] Forms validate & submit correctly
- [ ] Styling responsive (mobile + desktop)
- [ ] No console errors
- [ ] TypeScript compiles
