# Personal Tracker

A personal daily to-do app, built to grow into a hobby tracker and equipment
purchase-order tracker. React + Vite + MUI.

## Getting started

```bash
npm install
npm run dev
```

Open the printed localhost URL. Log in with **any** username/password — auth
is currently a mock placeholder (see below).

## Project structure

```
src/
  App.jsx                  Routes + top-level providers
  theme.js                 MUI theme (colors, shape) — edit freely
  context/
    AuthContext.jsx         MOCK auth (any credentials work). Swap-out plan
                             documented in the file itself.
  services/
    storage/
      localStorageAdapter.js  Actual localStorage read/write logic
      index.js                 Exports the ACTIVE adapter — change this one
                                file to switch to Supabase later
  hooks/
    useCollection.js         Generic CRUD hook (loading/add/update/remove)
                              used by every list-based feature
  features/
    todos/                   Fully built: TodoPage, TodoForm, TodoList, TodoItem
    hobbies/                 Placeholder — will reuse useCollection('hobbies')
    purchases/                Placeholder — will reuse useCollection('purchases')
    auth/
      LoginPage.jsx
  components/
    layout/
      NavBar.jsx
      ProtectedRoute.jsx
```

## Why it's built this way (for future-you)

**Storage is abstracted behind an adapter.** Nothing in `features/` talks to
`localStorage` directly — it all goes through `services/storage/index.js`,
which currently points at `localStorageAdapter.js`. When you're ready to add
Supabase:

1. Create `services/storage/supabaseAdapter.js` implementing the same four
   methods: `getAll(key)`, `create(key, item)`, `update(key, id, updates)`,
   `remove(key, id)`.
2. Change the one-line export in `services/storage/index.js`.
3. Nothing else changes.

**Lists share one hook.** To-dos, hobbies, and purchase orders are all just
"collections" with different item shapes. `useCollection(key)` gives any
feature loading state + add/update/remove for free. When you build out
Hobbies or Purchases, you'll mostly be copying `TodoPage.jsx` and swapping
the form fields — the data layer is already done.

**Auth is a clearly-marked placeholder.** `AuthContext.jsx` accepts any
non-empty username/password and just gates routes via `ProtectedRoute`. It's
commented with the exact swap-out plan for Supabase Auth when you get there.

## Next steps (suggested order)

1. Use the to-do list for a bit, see what's missing/annoying.
2. Build out `HobbiesPage` using the same pattern as `TodoPage`.
3. Build out `PurchasesPage` similarly (fields like vendor, price, status).
4. Swap in Supabase for storage once the data shapes feel settled.
5. Swap in Supabase Auth (or Clerk) for real login.
6. Consider a PWA wrapper for a more native-feeling iPhone experience.
