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

Run `npm test` for the automated test suite (Vitest) — see
[Testing](#testing).

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
  week for the first reset. Click a task to open a full edit view. Any task
  (plain or entity-linked — maintenance, hobby task, ...) can also carry
  free-form tags, filterable via a "Tags" dropdown next to the frequency
  filter, independent of the vehicle/firearm/hobby linking described below.
- **Hobbies** — a hobby's page has a pencil-editable name/description, a
  "Hobby Tasks" section (real to-dos, generated right there, defaulting to
  One-Time frequency instead of Daily), and a "Lists" section where you
  create Maintenance / Modifications / Wishlist / Equipment lists that then
  show up as tabs — the same tab structure as Garage/Armory. Nothing here
  depends on any other sub-entity existing first.
- **Garage** — vehicles (make/model/trim/color, plus an optional free-form
  notes field — VIN, insurance renewal, whatever doesn't fit its own
  field). Each vehicle's detail page has a Maintenance / Modifications /
  Wishlist tab row (Maintenance shown by default); only the selected tab's
  list — and its own add-to-list control — is on screen at a time.
  Maintenance tasks are real to-do items under the hood (tagged with
  `vehicleId`), so adding one here also puts it on the main To-Do page and
  the Overview page, and vice versa. The Garage page itself also has its
  own page-level Wishlist section, independent of any specific vehicle.
- **Armory** — the same structure as Garage (make/model/caliber instead of
  trim/color, notes field included too), including its own page-level
  Wishlist section.
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

Tests live next to the module they cover, as `*.test.js` (e.g.
`recurrence.js` + `recurrence.test.js`) — run with `npm test`. See
[Testing](#testing).

```
src/
  App.jsx                  Routes (lazy-loaded per-page, Suspense +
                             ErrorBoundary wrapped) + top-level providers
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
      caseConversion.js        toSnakeCase/toCamelCase, split out so they're
                                unit-testable without the real Supabase
                                client (which needs env vars to construct)
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
    tags.js                    normalizeTags — trims/dedupes a todo's
                               free-form tag list (see TodoForm)
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
                              table (RLS enabled, no policy — see its own
                              header for why), 002 adds owner-scoped RLS +
                              the profiles table + its trigger, 003 adds
                              todos.tags, 004 is a one-time cleanup for a
                              data-isolation incident (see its header), 005
                              adds notes to garage_vehicles/armory_items.
                              Every statement is safe to re-run (Supabase's
                              GitHub integration replays these against
                              preview branches cloned from production,
                              which already has them applied)
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

**`001_initial_schema.sql` never creates a permissive policy, even
temporarily — it only ever `DROP`s one.** It used to create an "allow all"
policy per table for the pre-Auth era, which caused a real incident: Postgres
OR's multiple *permissive* policies on the same table together, so if 001
was ever re-run against a database that already had 002's owner-only
policies applied, "allow all" got silently reinstated alongside them and
undid the isolation guarantee above — with no error, since both the create
and the drop-then-create were individually valid SQL. 001 now only enables
RLS and drops that policy name if found; 002 is what actually grants any
access at all. Fixed going forward in 001, with 004 as the one-time cleanup
for a database that already had the stale policy. The lesson generalizes:
"safe to re-run" isn't the same as "safe regardless of what already ran
after it" — a migration that recreates a policy/grant needs to consider
what a *later* migration may have already tightened, not just what an
*earlier* one left behind.

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
both just `todos`, distinguished by which id fields are set.** A task
belongs to a hobby directly if it has `hobbyId` but no `hobbyListId`; it
belongs to one of the hobby's Maintenance-type lists if it has both.
Garage/Armory maintenance tasks follow the same idea with
`vehicleId`/`armoryItemId` (there's only ever one Maintenance list per
vehicle/firearm, so no extra list-id field is needed there).

**Free-form tags are a separate, simpler mechanism layered on top of that
entity-linking scheme, not a replacement for it.** `todos.tags` is a plain
Postgres `text[]` (migration 003) — no join table, no per-tag row, since
tags are arbitrary user text with no fixed set at this scale. `TodoForm`
collects them with an `Autocomplete` in `freeSolo`+`multiple` mode (chips,
no suggestion list — see its own comment for why suggestions were skipped)
and normalizes them through `utils/tags.js`'s `normalizeTags` before
`onSubmit` (trim, drop empties, case-insensitive dedupe) so casing/typo
variants don't each become their own filter option.
`useTodoFilters.availableTags` derives the filter dropdown's options
straight from whatever tags are actually present in the current `todos`
list — no separate "list all tags" query. Because `tags` lives on the same
`todos` row as `vehicleId`/`hobbyId`/etc., an entity-linked task (a
maintenance item, a hobby task) can carry free-form tags too, exactly like
a plain to-do — `TaskDetailPage` reuses `TodoForm` for every task
regardless of origin, so this needed no extra wiring.

**Only `GarageVehicle`/`ArmoryItem` got a dedicated `notes` field (migration
005) — nowhere else did.** Every other entity with a detail page already
had an equivalent freeform text box (`SimpleItemForm`'s `detail` field for
modifications/wishlist items/hobby list entries; `description` on
`OweItem`/`WishToPurchaseItem`/`Hobby`) before this was added — giving
those a second, identically-shaped field would just be a redundant UI
element with no distinct purpose. Vehicles and firearms were the only two
with no freeform field at all (just make/model/trim-or-caliber/color), so
that's the one real gap this closes. If a future field is genuinely
distinct from an entity's existing freeform text (e.g. actual file
attachments — see Next steps), that's a different feature, not more of
this one.

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

**Mutation failures surface through one choke point, not per-page
plumbing.** `useCollection.js`'s `addItem`/`updateItem`/`removeItem` catch
whatever `storageAdapter` throws, map it to a short message via
`utils/friendlyError.js`, and set it as the collection's own `error` —
which almost every page already renders as an `<Alert>`. They also
re-throw the original error so a caller that needs to *react* (not just
display something) still can. Three shared components lean on that:
`AddFormPanel` and `ConfirmDeleteButton` await the call and only close
(the panel / the confirm dialog) on success, and `EditableDetails` only
drops out of edit mode on success — so a failed save or delete now shows
the error and leaves you where you were, instead of silently reverting or
navigating away as if it had worked. A standalone detail page
(`SimpleItemDetailPage`, `TaskDetailPage`, `OweItemDetailPage`,
`WishToPurchaseItemDetailPage`) follows the same shape by hand: `try`/
`await`/`catch` around its own `handleSave`, and an un-caught `async
handleDelete` that relies on `ConfirmDeleteButton` to catch the rethrow.
Writing a *new* mutation that should behave the same way just means
awaiting it and following one of these two patterns — the error message
itself needs no extra work.

**A rendering bug doesn't blank the whole app.** `App.jsx` wraps `<Routes>`
(not `<NavBar>`) in `ErrorBoundary`, keyed on the current path — a crash on
one page shows a fallback instead of a white screen, the nav bar stays
usable to get somewhere else, and navigating away remounts the boundary
fresh (React's own recommended reset trick, avoiding a `componentDidUpdate`
`setState` some linters flag).

**Every route is its own lazy chunk.** `App.jsx` wraps each page import in
`React.lazy` (with a `.then(m => ({ default: m.X }))` step, since every page
is a named export, not a default one) instead of importing all ~20 upfront.
A single `Suspense` around `<Routes>` — inside the `ErrorBoundary`, so a
chunk-load failure is caught the same way a rendering error is — shows a
centered spinner while a route's own JS is fetched the first time it's
visited. This is what actually shrinks the initial bundle the earlier
"~780 kB single chunk" note flagged; each page's own dependencies (MUI
pieces it alone uses, etc.) now ship only when that page is reached.

**Pure logic and the CRUD hook have automated tests; UI doesn't (yet).**
`npm test` runs Vitest against `recurrence.js` (reset-boundary math with
fixed dates — the highest-value, easiest-to-get-wrong logic in the app),
`caseConversion.js` (`toSnakeCase`/`toCamelCase` round-tripping), and
`useCollection.js` (mocking `storageAdapter` to verify loading/add/update/
remove state transitions, including that a failed mutation sets `error` and
leaves `items` untouched). `useRecurringReset.js` has one too, covering the
duplicate-update guard described below. These were picked because they're
pure-logic or hook-only — no component mounting needed, so no UI testing
library setup (beyond `@testing-library/react`'s `renderHook`) was required
to get real value. Component/page-level tests aren't set up; add
`@testing-library/react`'s `render`/`screen` alongside `renderHook` if that
becomes worth it later.

**`useRecurringReset` guards against sending the same reset twice.** Its
effect depends on `items`, which changes on *any* add/update/remove on the
page — not just recurrence-related ones — so a second run can start while
an earlier `updateItem` call for the same item is still in flight (its
result hasn't landed back in `items` yet, so the item still looks "due" to
the next run). A `Set` of in-progress ids (in a `ref`, so it survives
re-renders without itself triggering one) is populated before each batch of
`updateItem` calls and cleared as each settles, so a re-run skips anything
already being reset. This doesn't merge multiple due items into one network
call — Supabase has no single-request "update N rows with N different
values" primitive without a custom RPC — it only prevents the same item
from being submitted more than once concurrently.

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
`MenuListProps` → `slotProps={{ list: {...} }}` fix — and again with
`Autocomplete`'s `renderTags`, renamed to `renderValue` in this version
(different callback signature too: `getItemProps` instead of
`getTagProps`) — the old prop name silently falls through to the DOM
instead of erroring at build time, so this one only shows up as a browser
console warning (see `TodoForm.jsx`'s tag input).

## Testing

`npm test` runs the Vitest suite once (`npm run` doesn't watch by default —
add `-- --watch` if you want it to). Covered so far: `utils/recurrence.js`,
`utils/tags.js`, `services/storage/caseConversion.js`,
`hooks/useCollection.js`, `hooks/useRecurringReset.js`, and
`features/todos/useTodoFilters.js` — see the "Why it's built this way"
notes above for what each one asserts. No component/page tests yet.

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

**`<BrowserRouter>` needs the same base path told to it separately —
`vite.config.js`'s `base` doesn't do this automatically.** It only affects
asset URLs (scripts, the manifest, icons); React Router has no idea the
site lives under `/personal-tracker/` unless it's told via `basename`. This
was missing for a while and caused a real bug in production: every
in-app navigation (`<Navigate to="/overview" />`, nav links, `navigate(...)`)
wrote the URL *without* the prefix — the app kept working since it's all
client-side routing, but the address bar silently ended up at
`/overview` instead of `/personal-tracker/overview`. Refreshing at that
point sent a real request to `jyoung32.github.io/overview`, entirely
outside the project's path — which hit GitHub's account-level 404, not
even this repo's own `404.html`, since that's only wired up for paths
under `/personal-tracker/`. Fixed with
`<BrowserRouter basename={import.meta.env.BASE_URL}>` in `App.jsx` — same
env var already used for the password-reset redirect above, so it's `/`
locally and `/personal-tracker/` in production automatically.

## Next steps (suggested order)

1. The production bundle is ~780 kB (one chunk, no code-splitting yet) — if
   load time on mobile networks becomes noticeable, split routes with
   `React.lazy`/dynamic `import()`.
2. A true native wrapper (Capacitor) for an actual App Store/Play Store
   listing, if that's ever wanted over "installs like an app" via the PWA.

# Personal Tracker — Roadmap

Compiled from a 1.0 code review and roadmap discussion (Aug 2026). Organized
by category, each with a suggested priority so you can pick up work without
re-deriving context.

---

## Technical / Architecture Improvements

**Suggested priority: Next, before adding more surface area.** The codebase
is clean today — these keep it that way as it grows.

- **Revisit monthly/yearly interval math.** `FREQUENCY_INTERVAL_DAYS` uses
  fixed `30`/`365` day approximations, which will drift from true calendar
  months/years over time (e.g. a task anchored on the 31st walks backward
  through shorter months). Fine for now — flag for calendar-accurate logic
  if it ever starts to matter in practice.
- **Consider a native wrapper (Capacitor)** if you ever want actual App
  Store/Play Store presence beyond "installs like an app" via the PWA —
  per your own README's next-steps note.

---

## Feature Builds

**Suggested priority: After the above, and roughly in this order** — each
builds on stability work above rather than competing with it.

- **Dashboard/stats on Overview** — completion rate over time, streaks,
  most-active hobby, upcoming maintenance across Garage/Armory. The
  aggregation plumbing already exists (Overview reads the full cross-tab
  list); this is mostly a display layer on top.
- **Search across collections** — likely a client-side filter first, given
  data volume is personal-scale; revisit if it ever needs to be
  server-side.
- **File attachments on individual items** (photos, receipts, PDFs) —
  a bigger lift than the plain-text notes fields already shipped (see
  "Why it's built this way"): needs a Supabase Storage bucket, storage RLS
  policies scoping files to the owning account, upload UI, and an
  attachment list (thumbnail/filename, download, delete) per item.
- **Export/import (JSON/CSV)** as a personal backup/restore path,
  independent of Supabase's own backups.
- **Notifications/reminders** — a bigger lift, since it likely wants a
  Supabase Edge Function or scheduled job rather than pure client code;
  worth scoping separately once the rest of the roadmap settles.

---

## Notes

- This list reflects the state of the repo as of this review — re-generate
  or prune sections as items get done rather than letting it drift out of
  sync with the code.
- Nothing here is committed to — treat priority labels as a starting
  suggestion, not a fixed order.
- **Error Handling & Reliability is done** (see "Why it's built this way"
  above for how) — pruned from this list rather than left checked off.
- **Route code-splitting, the initial test suite, and the
  `useRecurringReset` duplicate-update guard are done** (see "Why it's
  built this way" above and [Testing](#testing)) — pruned from Technical /
  Architecture Improvements above; interval-math accuracy and a native
  wrapper are the only items still open there.
- **Free-form tags on to-dos are done** (see "Why it's built this way"
  above) — pruned from Feature Builds above.
- **Notes on individual items is partly done**: a `notes` field on Garage
  vehicles and Armory items (migration 005) — the only two entities that
  had no equivalent freeform field already (see "Why it's built this way").
  File attachments are still open, reworded above as its own item.
