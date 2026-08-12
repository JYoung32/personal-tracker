# Personal Tracker

A personal tracker for daily to-dos, hobbies, a garage, and an armory —
each with recurring maintenance tasks that also show up on the to-do list.
React + Vite + MUI, backed by Supabase (Postgres + real email/password Auth).

**Live at <https://jyoung32.github.io/personal-tracker/>**, deployed via
GitHub Actions on every push to `master` — see [Deployment](#deployment).

## Getting started

1. Create a Supabase project, then in its SQL Editor run each file under
   [`supabase/migrations/`](supabase/migrations) in order (`001`, then
   `002`, ...). If you're catching an existing project up, just run
   whichever ones are new — they're all safe to re-run.
2. Copy `.env.example` to `.env.local` and fill in your project's URL and
   anon key (Project Settings > API in the Supabase dashboard).
3. In the Supabase dashboard under Authentication > URL Configuration, add
   your dev URL's `/reset-password` (e.g. `http://localhost:5173/reset-password`)
   to the allowed redirect URLs — needed for the "Forgot password?" flow.

```bash
npm install
npm run dev
```

Open the printed localhost URL and sign up for an account (or log in if you
already have one).

## Features

- **Overview** — the landing page (click "Personal Tracker" in the nav bar,
  or just log in). Shows every task across every tab — plain to-dos plus
  Garage/Armory/Hobbies tasks — collectively, using the same tabs/filter/
  list UI as To-Do. Read-only with respect to creating tasks; each tab
  still owns adding its own.
- **To-Do** — tasks created directly on this page (description, due date,
  priority, frequency — daily/weekly/monthly/quarterly/yearly). Recurring
  tasks auto-uncheck on a fixed schedule anchored to when the task was
  created (see `utils/recurrence.js`), optionally aligned to a day of the
  week for the first reset. Click a task to open a full edit view.
- **Hobbies** — a hobby's page has a pencil-editable name/description, a
  "Hobby Tasks" section (real to-dos, generated right there, defaulting to
  One-Time frequency instead of Daily), and a "Lists" section where you
  create Maintenance / Modifications / Wishlist / Equipment lists that then
  show up as tabs — the same tab structure as Garage/Armory. Nothing here
  depends on any other sub-entity existing first.
- **Garage** — vehicles (make/model/trim/color). Each vehicle's detail page
  has a Maintenance / Modifications / Wishlist tab row (Maintenance shown
  by default); only the selected tab's list — and its own add-to-list
  control — is on screen at a time. Maintenance tasks are real to-do items
  under the hood (tagged with `vehicleId`), so adding one here also puts it
  on the main To-Do page and the Overview page, and vice versa. The Garage
  page itself also has its own page-level Wishlist section, independent of
  any specific vehicle.
- **Armory** — the same structure as Garage (make/model/caliber instead of
  trim/color), including its own page-level Wishlist section.
- **Finances** — a tab row: **Owe** (bills/debts — name, description, $
  owed, optional months left, priority defaulting to Low) and **Wish to
  Purchase** (name, description, item amount, amount saved — the amount-
  saved field shows a live "% saved" helper text). The Owe list sorts by
  priority (not shown in the list itself, only on its edit form) and shows
  a computed, non-stored "Monthly payment" on the form when both $ owed and
  months left are set; the list row lets you click the $ owed amount or
  months-left directly to edit them inline, and totals a "Total" and
  "Monthly Owed" underneath.
- **Profile** — email (read-only), optional username, first name, last
  name, reached by clicking the nav-bar identity. Setting a username makes
  it show in the nav bar instead of your email.
- **Nav bar** — at `md` and up: hover over Garage/Armory for a dropdown of
  their items, hover the profile icon to reveal Log out. Below `md`: a
  hamburger opens a drawer with plain links instead (hover doesn't work on
  touch).
- **Auth** — real Supabase email/password accounts: sign up, log in, and
  "Forgot password?" (emails a reset link). Every row in every collection
  is scoped to the account that created it via Postgres row-level security,
  so separate accounts never see each other's data.
- **Installable / mobile** — responsive down to a narrow phone (stacked
  form fields, scrollable tab rows, a drawer nav) and installable as a PWA
  from either the Android/Chrome install prompt or iOS Safari's Share >
  "Add to Home Screen" — see [Deployment](#deployment).

## Project structure

```
src/
  App.jsx                  Routes + top-level providers
  theme.js                 MUI theme (colors, shape) — edit freely
  context/
    AuthContext.jsx         Real Supabase Auth — login/signup/logout plus
                             password reset, session restore + live sync
                             via onAuthStateChange.
  services/
    supabase/
      client.js               The Supabase client, built from
                                VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
    storage/
      localStorageAdapter.js  Old localStorage read/write logic — unused
                                now but kept as a reference/fallback
      supabaseAdapter.js       ACTIVE adapter — talks to Postgres, converts
                                camelCase <-> snake_case generically
      index.js                 Exports the ACTIVE adapter — change this one
                                file to switch storage backends
  hooks/
    useCollection.js         Generic CRUD hook (loading/add/update/remove)
                              used by every list-based feature
    useRecurringReset.js     Auto-uncheck recurring todos/maintenance tasks
                              on their scheduled reset date
    useProfile.js             Reads/writes the `profiles` table (username,
                              first/last name) for the logged-in user
  constants/
    taskOptions.js            Frequency/priority/day-of-week option lists
    hobbyListTypes.js          The 4 hobby list types (Maintenance/
                               Modifications/Wishlist/Equipment)
  utils/
    recurrence.js              Date-only parsing + reset-schedule math
  features/
    overview/                 OverviewPage — the full, cross-tab task list
    todos/                    TodoPage (scoped to its own tasks), TodoBoard
                               (shared tabs/filter/list UI — also used by
                               OverviewPage), useTodoFilters (sort/filter
                               logic), TodoForm, TodoList, TodoItem,
                               TaskDetailPage
    hobbies/                  HobbiesPage, HobbyDetailPage (tasks + tabbed
                               lists), HobbyListForm, HobbyListEntryDetailPage
    garage/                   GaragePage (vehicles + page-level Wishlist),
                               VehicleForm, VehicleDetailPage (tabbed
                               Maintenance/Modifications/Wishlist),
                               modification/wishlist detail pages
    armory/                   Mirrors garage/ (firearms instead of vehicles)
    purchases/                PurchasesPage ("Finances" tab: Owe + Wish to
                               Purchase, each its own Section/Form/
                               ItemDetailPage trio)
    profile/                  ProfilePage
    auth/
      LoginPage.jsx, SignupPage.jsx, ForgotPasswordPage.jsx,
      ResetPasswordPage.jsx
  components/
    layout/
      NavBar.jsx, ProtectedRoute.jsx, NavDropdownItem.jsx,
      GarageNavItem.jsx, ArmoryNavItem.jsx, UserNavMenu.jsx
    common/
      Shared building blocks reused across features — see below.
supabase/
  migrations/                 The schema, in order — 001 creates every
                              table with "allow all" RLS, 002 adds owner-
                              scoped RLS + the profiles table + its
                              trigger. Every statement is safe to re-run
                              (Supabase's GitHub integration replays these
                              against preview branches cloned from
                              production, which already has them applied)
public/
  404.html                    GitHub Pages SPA-routing redirect (see
                              Deployment)
  pwa-192.png, pwa-512.png,    App icons (rasterized from favicon.svg) for
  apple-touch-icon.png         the PWA manifest and iOS home screen
.github/
  workflows/deploy.yml        Builds + deploys to GitHub Pages on push
```

### Shared `components/common/` building blocks

- **`useCollection`-backed CRUD flow**: `AddFormPanel` renders a form and
  exposes `submit()` via ref; `PageHeader`'s "+" icon toggles it via
  `AddToggleActions` (swaps to a checkmark/X pair while the form is open).
  `FormActions` is the submit button + inline Cancel (X) pairing every form
  ends with.
- **Edit-in-place**: `EditableDetails` swaps a read-only summary for a form;
  its header shows a pencil (edit) and, if `onDelete` is passed, a red X
  (delete) in the upper-right corner — used for a vehicle/armory item's
  core fields (pencil + delete) and a hobby's name/description (pencil
  only, since hobbies delete from the Hobbies list page instead).
  `SimpleItemDetailPage` (modification/wishlist item edit views) and
  `TaskDetailPage` follow the same red-X-in-header pattern for delete, with
  a grey Cancel X inline next to Save.
- **Related-list tabs**: `RelatedListTabs` renders a row of tabs where only
  the selected tab's content is mounted — used for a vehicle/armory item's
  Maintenance / Modifications / Wishlist lists, a hobby's user-created
  lists, and the Finances page's Owe / Wish to Purchase tabs, so each tab's
  add-to-list control only shows and works for the list currently selected.
- **`SimpleListSection`/`MaintenanceSection`**: the actual tab content (or,
  with `showHeading`, a standalone section with a visible title — used for
  a hobby's "Hobby Tasks" and Garage/Armory's page-level Wishlist).
  `MaintenanceSection` accepts `defaultFrequency` to change what the add
  form starts on (Hobby Tasks default to One-Time instead of Daily).
- **Delete confirmation**: `ConfirmDeleteButton` wraps any delete trigger
  with a confirmation dialog — used everywhere something can be deleted.
- **List rendering**: `NavigableRowList` (click to drill in),
  `ChecklistRowList` (checkbox, no navigation), `MaintenanceTaskList`
  (checkbox + inline frequency/day controls) — all three delete through
  `ConfirmDeleteButton`.
- **Reusable forms**: `SingleFieldForm` (one text field), `SimpleItemForm`
  + `SimpleItemDetailPage` (name + detail, used for modifications/wishlist
  items), `MaintenanceTaskForm`.
- Every add/edit form follows the same convention:
  `{ initialValues, onSubmit, submitLabel }` — omit `initialValues` for
  "add" mode (the form clears itself after submit), pass an existing record
  to prefill for editing.

## Why it's built this way (for future-you)

**Storage is abstracted behind an adapter.** Nothing in `features/` talks to
Supabase (or localStorage) directly — it all goes through
`services/storage/index.js`, which currently points at `supabaseAdapter.js`.
Swapping backends again is still just changing that one export, as long as
the new adapter implements the same four methods: `getAll(key)`,
`create(key, item)`, `update(key, id, updates)`, `remove(key, id)`.

**One collection key = one table, no manual mapping.** Every feature's
collection key is camelCase (`garageVehicles`, `oweItems`, ...); every
Postgres table/column is snake_case (`garage_vehicles`, `owe_items`,
`trim_level`, ...). `supabaseAdapter.js` converts both directions
generically (`toSnakeCase`/`toCamelCase` on every object key, and on the
collection key itself to get the table name), so a brand new collection
only ever needs a matching table in `supabase/migrations/` — never a code
change in the adapter.

**Every row is owned by the account that created it.** Each table has a
`user_id` column defaulting to `auth.uid()` (filled in automatically from
the logged-in request, so the app never sends it explicitly) and a
row-level-security policy restricting all access to `auth.uid() = user_id`.
That's what actually enforces "separate accounts see separate data" — it
holds even against direct API calls, not just what the UI happens to show.

**Lists share one hook.** Todos, hobbies/hobby lists/list entries, vehicles,
firearms, modifications, and wishlist items are all just "collections" with
different item shapes. `useCollection(key)` gives any feature loading state
+ add/update/remove for free.

**To-Do and Overview share one board.** Both pages fetch the full `todos`
collection and render `TodoBoard` (tabs, frequency filter, sorted list).
TodoPage filters to tasks with no `vehicleId`/`armoryItemId`/`hobbyId`
before handing them to the board and passes `onAddTodo`; OverviewPage
passes the unfiltered list and omits `onAddTodo`, which hides `TodoBoard`'s
add form — so creating a task always happens on the tab that owns it, while
Overview stays a pure read-through.

**A hobby's "maintenance-type list" tasks and its own "Hobby Tasks" are
both just `todos`, distinguished by tags.** A task belongs to a hobby
directly if it has `hobbyId` but no `hobbyListId`; it belongs to one of the
hobby's Maintenance-type lists if it has both. Garage/Armory maintenance
tasks follow the same tagging idea with `vehicleId`/`armoryItemId` (there's
only ever one Maintenance list per vehicle/firearm, so no extra list-id tag
is needed there).

**Auth is real Supabase Auth (email/password).** `AuthContext.jsx` restores
whatever session Supabase already persisted on load, then stays in sync via
`onAuthStateChange` (covers sign-in/out, token refresh, and the recovery
session created when a "Forgot password?" link is clicked).
`ProtectedRoute` just checks `isAuthenticated`, unchanged from before the
swap. New accounts get a blank `profiles` row automatically via a Postgres
trigger (`handle_new_user`, see `supabase/migrations/002_add_user_ownership_and_profiles.sql`)
— the app never has to create it.

**Username is optional and separate from the login identity.** Supabase
Auth's identity is always the email; `profiles.username` is just a display
name the nav bar prefers when set (`profile.username || user?.email`), with
a unique constraint at the database level so two accounts can't collide.

**Every migration must be safe to re-run.** Supabase's GitHub integration
replays every file in `supabase/migrations/` against preview branches
cloned from production — which already has all of them applied — so a
plain `CREATE TABLE`/`ALTER TABLE ... ADD COLUMN`/`CREATE POLICY` errors
there even though it's a no-op. Every migration in this repo guards with
`IF NOT EXISTS`/`IF EXISTS`/`OR REPLACE` (or, for the one-time backfill in
002, checks whether there's actually anything to backfill before doing
anything). Write new migrations the same way.

**Nav-bar hover dropdowns use plain CSS `:hover`, not MUI `Menu`.** An
earlier attempt with `Menu` flickered because its modal overlay renders on
top of the trigger button once open, which makes the browser think the
mouse left and immediately re-triggers enter/leave. `GarageNavItem` /
`ArmoryNavItem` / `UserNavMenu` instead reveal a plain `Paper` that lives in
the same DOM subtree as the trigger — no portal, no flicker.

**The mobile nav is a second, parallel implementation, not a responsive
version of the desktop one.** `GarageNavItem`/`ArmoryNavItem`'s hover
dropdowns fundamentally don't work on touch (no hover event), so `NavBar.jsx`
renders the existing `Stack` only at `md` and up and an entirely separate
`Drawer` below it, rather than trying to make one component handle both
input models. `RelatedListTabs` takes a lighter touch on the same problem:
past 4 tabs it switches to a scrollable row instead of a centered one, since
a hobby with several user-created lists could otherwise overflow a phone
screen.

**The PWA manifest uses relative URLs on purpose.** `start_url: '.'` and
`scope: '.'` in `vite.config.js`'s `VitePWA` block resolve relative to the
manifest file's own location rather than the domain root, so they still
land on `/personal-tracker/` under the GitHub Pages base path without
hardcoding it. The icons were generated once from `favicon.svg` via a
throwaway `sharp` script (not a project dependency) — regenerate them the
same way if the logo ever changes.

**This MUI version (9.x) wants `slotProps`, not `inputProps`/`InputProps`.**
Passing `inputProps={{ min: 0 }}` straight to a `TextField` throws a "React
does not recognize the `inputProps` prop" console error here — it leaks
through to the DOM instead of reaching the native `<input>`. Use
`slotProps={{ htmlInput: { min: 0 } }}` instead (see `OweItemForm.jsx` /
`OweItemRow.jsx`). Same idea as the earlier `Menu`
`MenuListProps` → `slotProps={{ list: {...} }}` fix.

## Deployment

Hosted on GitHub Pages as a project site
(`https://jyoung32.github.io/personal-tracker/`), deployed by
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) on every push
to `master` — build with the `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`
repo secrets baked in, then published via `actions/deploy-pages`. Repo
Settings > Pages > Source is set to "GitHub Actions" (not a branch).

Two things this required that a typical Vite SPA doesn't need to think
about:

- **A path prefix.** GitHub Pages serves a project site under
  `/<repo-name>/`, not `/`, so `vite.config.js` sets
  `base: '/personal-tracker/'` — but only for production builds
  (`command === 'build'`); the dev server stays at `/` so local URLs didn't
  change.
- **No server-side routing.** GitHub Pages 404s on a direct load or refresh
  of a route like `/personal-tracker/todos` — there's no server to fall
  back to `index.html` the way `npm run dev`'s dev server does.
  [`public/404.html`](public/404.html) redirects that 404 back to
  `index.html` with the real path packed into a query string; an inline
  script at the top of `index.html` unpacks it via
  `history.replaceState` before react-router (or anything else) sees the
  URL. (The alternative would've been switching to `HashRouter` — simpler,
  but `/#/todos`-style URLs; this keeps clean paths instead.)

Because of the path prefix, `AuthContext.jsx`'s password-reset
`redirectTo` is built from `import.meta.env.BASE_URL` rather than hardcoded,
so it resolves correctly in both places. Supabase's Authentication > URL
Configuration has both the GitHub Pages URL and `localhost:5173` in its
redirect allow-list for the same reason.

## Next steps (suggested order)

1. The production bundle is ~780 kB (one chunk, no code-splitting yet) — if
   load time on mobile networks becomes noticeable, split routes with
   `React.lazy`/dynamic `import()`.
2. A true native wrapper (Capacitor) for an actual App Store/Play Store
   listing, if that's ever wanted over "installs like an app" via the PWA.
