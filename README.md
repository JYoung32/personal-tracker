# Personal Tracker

A personal tracker for daily to-dos, hobbies, and user-defined Trackers —
each with recurring maintenance tasks that also show up on the to-do list.
React + Vite + MUI, backed by Supabase (Postgres + real email/password Auth).

**Live at <https://jyoung32.github.io/personal-tracker/>**, deployed via
GitHub Actions on every push to `master` — see [Deployment](#deployment).

## Getting started

1. Create a Supabase project, then in its SQL Editor run
   [`supabase/migrations/001_initial_schema.sql`](supabase/migrations) —
   the whole schema (core tables + Trackers) in one file. Safe to re-run
   against an already-migrated database too (every statement is a no-op if
   it's already applied).
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
  Hobbies/Tracker tasks — collectively, using the same tabs/filter/list UI
  as To-Do. Read-only with respect to creating tasks; each tab still owns
  adding its own.
- **To-Do** — tasks created directly on this page (description, due date,
  priority, frequency — daily/weekly/monthly/quarterly/yearly). Recurring
  tasks auto-uncheck on a fixed schedule anchored to when the task was
  created (see `utils/recurrence.js`), optionally aligned to a day of the
  week for the first reset. Click a task to open a full edit view. Any task
  (plain or entity-linked — maintenance, hobby task, ...) can also carry
  free-form tags, filterable via a "Tags" dropdown next to the frequency
  filter, independent of the hobby/tracker-item linking described below.
- **Hobbies** — a hobby's page has a pencil-editable name/description, a
  "Hobby Tasks" section (real to-dos, generated right there, defaulting to
  One-Time frequency instead of Daily), and a "Lists" section where you
  create Maintenance / Modifications / Wishlist / Equipment lists that then
  show up as tabs — the same tab structure a Tracker item uses. Nothing
  here depends on any other sub-entity existing first.
- **Trackers** — user-defined domains, created at runtime with no code
  change: name a Tracker (e.g. "Guitars"), define its own core fields
  (whatever you want, each with its own required/type setting), then add
  items and give each one Maintenance/Modifications/Wishlist/Equipment
  lists, same as a Hobby. Every Tracker you create shows up as its own nav
  bar entry automatically.
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
- **Nav bar** — at `md` and up: hover over each of your Trackers for a
  dropdown of their items, hover the profile icon to reveal Log out.
  Below `md`: a hamburger opens a drawer with plain links instead (hover
  doesn't work on touch).
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
    friendlyError.js           getFriendlyErrorMessage — maps a thrown
                               error (network/RLS/constraint) to a short
                               user-facing message, used by useCollection
  features/
    overview/                 OverviewPage — the full, cross-tab task list
    todos/                    TodoPage (scoped to its own tasks), TodoBoard
                               (shared tabs/filter/list UI — also used by
                               OverviewPage), useTodoFilters (sort/filter
                               logic), TodoForm, TodoList, TodoItem,
                               TaskDetailPage
    hobbies/                  HobbiesPage, HobbyDetailPage (tasks + tabbed
                               lists), HobbyForm, HobbyListForm,
                               HobbyListEntryDetailPage
    purchases/                PurchasesPage ("Finances" tab: Owe + Wish to
                               Purchase, each its own Section/Form/
                               ItemDetailPage trio)
    trackers/                 TrackerTypesPage (list of your Trackers),
                               TrackerTypeForm, TrackerTypeDetailPage
                               (rename/delete the type, manage its Fields
                               and Items), TrackerItemForm (the dynamic
                               form — one input per current Field),
                               TrackerItemDetailPage (tabbed Lists),
                               TrackerItemListEntryDetailPage. Reuses
                               HobbyListForm and hobbyListTypes.js from
                               features/hobbies/ directly rather than
                               duplicating them — see "Why it's built this
                               way"
    profile/                  ProfilePage
    auth/
      LoginPage.jsx, SignupPage.jsx, ForgotPasswordPage.jsx,
      ResetPasswordPage.jsx
  components/
    layout/
      NavBar.jsx, ProtectedRoute.jsx, NavDropdownItem.jsx,
      TrackerNavItem.jsx, UserNavMenu.jsx
    common/
      Shared building blocks reused across features — see below.
supabase/
  migrations/                 001_initial_schema.sql — the whole schema in
                              one file: every table (including the
                              Trackers feature's 5 tables), owner-scoped
                              RLS from creation, the profiles table + its
                              trigger, todos.tags, the two notes columns.
                              Used to be several separate incremental
                              migrations (four for the original core
                              schema, then a separate one for Trackers);
                              folded back into one file now that they're
                              all long since applied to production (see
                              its own header, and "Why it's built this
                              way" below, for the history — including
                              Garage/Armory, which this schema used to also
                              have). Every statement is safe to re-run
                              (Supabase's GitHub integration replays it
                              against preview branches cloned from
                              production, which already has it applied)
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
  (delete) in the upper-right corner — used for a tracker item's core
  fields (pencil + delete) and a hobby's name/description (pencil only,
  since hobbies delete from the Hobbies list page instead). `formProps` is
  spread onto the form for the rare case where it needs more than
  `{initialValues, onSubmit, submitLabel, onCancel}` — used by
  `TrackerItemDetailPage` to pass `TrackerItemForm` its field schema.
  `SimpleItemDetailPage` (modification/wishlist item edit views) and
  `TaskDetailPage` follow the same red-X-in-header pattern for delete, with
  a grey Cancel X inline next to Save.
- **Related-list tabs**: `RelatedListTabs` renders a row of tabs where only
  the selected tab's content is mounted — used for a tracker item's
  Maintenance / Modifications / Wishlist lists, a hobby's user-created
  lists, and the Finances page's Owe / Wish to Purchase tabs, so each tab's
  add-to-list control only shows and works for the list currently selected.
- **`SimpleListSection`/`MaintenanceSection`**: the actual tab content (or,
  with `showHeading`, a standalone section with a visible title — used for
  a hobby's "Hobby Tasks"). `MaintenanceSection` accepts `defaultFrequency`
  to change what the add form starts on (Hobby Tasks default to One-Time
  instead of Daily), and `readOnlySchedule` to render frequency/day as
  plain secondary text instead of inline Select controls (used by Tracker
  item Maintenance lists).
- **Delete confirmation**: `ConfirmDeleteButton` wraps any delete trigger
  with a confirmation dialog — used everywhere something can be deleted.
- **List rendering**: `NavigableRowList` (click to drill in),
  `ChecklistRowList` (checkbox, no navigation), `MaintenanceTaskList`
  (checkbox + inline frequency/day controls, or read-only secondary text —
  see `readOnlySchedule` above) — all three delete through
  `ConfirmDeleteButton`.
- **Reusable forms**: `SingleFieldForm` (one text field), `SimpleItemForm`
  + `SimpleItemDetailPage` (name + detail, used for modifications/wishlist
  items), `MaintenanceTaskForm`.
- **Navigation/error chrome**: `BackLink` is the "‹ Back to X" link every
  detail page opens with. `ErrorBoundary` wraps `<Routes>` in `App.jsx` (see
  "Why it's built this way") — not itself part of a page's own UI, but the
  fallback every page falls back to if it crashes.
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
collection key is camelCase (`trackerItems`, `oweItems`, ...); every
Postgres table/column is snake_case (`tracker_items`, `owe_items`,
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

**`001_initial_schema.sql` never creates a permissive policy — it only
ever `DROP`s one, defensively.** An earlier version of this schema (back
when it was split across several migrations) created a temporary "allow
all" policy per table for the pre-Auth era, which caused a real incident:
Postgres OR's multiple *permissive* policies on the same table together,
so when the "allow all"-creating migration was re-run against a database
that already had the later owner-only-policy migration applied, "allow
all" got silently reinstated alongside it and undid the isolation
guarantee above — with no error, since both migrations were individually
valid, idempotent SQL. The lesson: "safe to re-run" isn't the same as
"safe regardless of what already ran after it" — a migration that
(re-)creates a policy/grant needs to consider what a *later* migration may
have already tightened, not just what an *earlier* one left behind. Now
that everything is one file, table creation and its owner-only policy
happen together, so this specific failure mode can't recur — but each
table below still has a `drop policy if exists "allow all - X"` line
(a no-op today) as cheap, permanent insurance against the same policy name
ever being reintroduced by something else.

**Lists share one hook.** Todos, hobbies/hobby lists/list entries, tracker
types/fields/items/lists/entries, and Finances' owe/wish-to-purchase items
are all just "collections" with different item shapes. `useCollection(key)`
gives any feature loading state + add/update/remove for free.

**To-Do and Overview share one board.** Both pages fetch the full `todos`
collection and render `TodoBoard` (tabs, frequency filter, sorted list).
TodoPage filters to tasks with no `hobbyId`/`trackerItemId` before handing
them to the board and passes `onAddTodo`; OverviewPage passes the
unfiltered list and omits `onAddTodo`, which hides `TodoBoard`'s add
form — so creating a task always happens on the tab that owns it, while
Overview stays a pure read-through.

**A hobby's "maintenance-type list" tasks and its own "Hobby Tasks" are
both just `todos`, distinguished by which id fields are set.** A task
belongs to a hobby directly if it has `hobbyId` but no `hobbyListId`; it
belongs to one of the hobby's Maintenance-type lists if it has both. A
Tracker item's Maintenance-type lists follow the same idea with
`trackerItemId`/`trackerItemListId` — see the Trackers section below.

**Free-form tags are a separate, simpler mechanism layered on top of that
entity-linking scheme, not a replacement for it.** `todos.tags` is a plain
Postgres `text[]` — no join table, no per-tag row, since
tags are arbitrary user text with no fixed set at this scale. `TodoForm`
collects them with an `Autocomplete` in `freeSolo`+`multiple` mode (chips,
no suggestion list — see its own comment for why suggestions were skipped)
and normalizes them through `utils/tags.js`'s `normalizeTags` before
`onSubmit` (trim, drop empties, case-insensitive dedupe) so casing/typo
variants don't each become their own filter option.
`useTodoFilters.availableTags` derives the filter dropdown's options
straight from whatever tags are actually present in the current `todos`
list — no separate "list all tags" query. Because `tags` lives on the same
`todos` row as `hobbyId`/`trackerItemId`/etc., an entity-linked task (a
maintenance item, a hobby task) can carry free-form tags too, exactly like
a plain to-do — `TaskDetailPage` reuses `TodoForm` for every task
regardless of origin, so this needed no extra wiring.

**Trackers replaced Garage and Armory, which used to be built-in, fixed
domains (make/model/trim/color for vehicles, make/model/caliber for
firearms).** Trackers were built specifically to be able to reproduce that
shape at runtime with no code deploy, and once that was proven out, Garage
and Armory were removed in favor of it — their tables (and the `todos`
columns that referenced them) were dropped from production, and
`001_initial_schema.sql` no longer creates or references them at all (see
its header). A Tracker's fields are data, not hardcoded JSX:
`tracker_fields` rows edited as a single set of pills in
`TrackerTypeForm`'s Fields input (same
Autocomplete-chip pattern as `TodoForm`'s Tags field), both when first
naming the tracker and again any time via the pencil icon on
`TrackerTypeDetailPage` (there's no standalone Fields list on that page —
editing the type and editing its fields are the same action) —
`TrackerItemForm.jsx` renders whichever fields the type currently has, one
`TextField` per field, instead of hardcoded inputs.

A tracker type also has its own optional `item_name_label`
(`TrackerTypeForm`'s "Name for Tracker Item" pill — click it to reveal a
text input, blur/Enter to collapse back to a pill) — purely a display
relabel of `TrackerItemForm`'s Title field (e.g. "Guitar Name" instead of
"Title") for that type's items. It's just a caption swap: the value still
lives in `tracker_items.title` either way, so there's nothing to migrate
if it's changed or left blank later. Unlike the Fields pills, it has no
required/type dialog — the item's title is already always required and
always text, so that editor wouldn't mean anything here.

**A tracker field's `key` is the field's own `id`, never a label-derived
slug.** `tracker_items.field_values` is a jsonb object; each field's
column-equivalent is looked up by `tracker_fields.id` (a uuid), not by its
`label` text. Each field pill also carries `required` (checkbox),
`fieldType` (string/number/date/boolean/select), `selectOptions` (only
shown when `fieldType` is select — same tag-pill input as the Fields
field itself), and `sortOrder` (a plain number) — click a pill (not its
delete X) to open a small dialog and edit these; `TrackerItemForm` reads
them to drop the "(optional)" suffix and block submit on an empty
required field (except `boolean`, which always has a definite true/false
value so "required" doesn't apply to it), and to pick which input
renders — text/number/date TextField, a Checkbox, or a Select populated
from `selectOptions`. None of this changes how the value is stored —
`field_values` is jsonb either way (a real boolean for boolean fields,
text for everything else) — it's pure form-behavior metadata read at
render/submit time. `formatFieldValue` (`features/trackers/
formatFieldValue.js`) is the one place that turns a stored value back
into display text — mainly for `boolean`, whose raw `true`/`false`/absent
isn't already display-ready ("Yes"/"No"/nothing) — shared by
`TrackerItemDetailPage`'s read-only summary and `TrackerTypeDetailPage`'s
item-list secondary line so both agree on how a field renders.

`sortOrder` controls the order fields appear in on the dynamic item form
and in the pills themselves — lower sorts first, ties fall back to array
order (creation order for existing fields, typed order for fresh ones in
the same edit session), so a field left at the default `0` just stays
wherever it naturally falls unless deliberately reordered. Every place
that reads a type's fields (`TrackerTypeDetailPage`,
`TrackerItemDetailPage`) sorts by it after filtering — `TrackerItemForm`
itself just renders `fields` in whatever order it's handed, trusting the
caller to have sorted (documented in its own docstring).

The pill editor hands the whole set back as `fieldDefs`
(`{label, required, fieldType, selectOptions, sortOrder}` per pill), so
`TrackerTypeDetailPage.handleSaveType` diffs it against the type's current
fields *by label* (case-insensitive, same as `normalizeTags`): a label
left untouched keeps its existing row — and so its id, and so any item
data already keyed by it — while a label that disappears is deleted and a
new one is inserted fresh; a label present in both gets its metadata
written back onto its existing row if any of it changed (that's what a
pill click's dialog actually persists). In other words a pure rename
(delete `"Color"` pill, add `"Colour"` pill) is *not* id-preserving from
the UI's perspective, even though the underlying id-as-key scheme is what
makes that safe to do at all: it just looks like
delete-old-field-add-new-field, same as it would with a plain tag list.
That's also why deleting a field can't accidentally resurrect old data: a
field's `id` is never reused, so a re-added field with the same label
gets a fresh id and starts with nothing. The dynamic form and the
read-only summary both only ever render keys present in the *current*
`tracker_fields` list, so a deleted field's leftover value in the jsonb
blob just becomes permanently invisible rather than cleaned up — cheap,
and correct given the id-as-key design above.

**Every tracker type's items share one `tracker_items` table, filtered
client-side by `trackerTypeId`** — the same idiom `todos` already uses to
serve more than one owner (`hobbyId`/`hobbyListId`), extended to a third
and fourth (`trackerItemId`/`trackerItemListId`) rather than inventing a
new pattern. `TodoPage.jsx`'s "tasks that belong to nothing else" filter
had to learn about the new column for the same reason it already knows
about the other two — a maintenance task under a Tracker item would
otherwise leak onto the plain To-Do page.

**A tracker item's Lists reuse Hobbies' Lists mechanism directly —
`HobbyListForm.jsx` and `constants/hobbyListTypes.js` are imported as-is
from `features/hobbies/`, not duplicated** — both were already fully
generic (`onSubmit({name, type})`, no hobby-specific coupling), so there
was nothing to change to reuse them. The backing tables
(`tracker_item_lists`/`tracker_item_list_entries`) are new, parallel
tables that mirror `hobby_lists`/`hobby_list_entries` exactly, rather than
generalizing those existing tables to accept a second kind of owner — a
deliberate call to keep zero risk to stable, working Hobby data, accepting
some schema duplication as the cost of that isolation.

**Routes are by id, not a derived slug** (`/trackers/:typeId`,
`/trackers/:typeId/:itemId`) — renaming a Tracker or an item never breaks
a link, and `App.jsx` only needs *one* generic route pair total for every
Tracker a user creates, because `TrackerTypeDetailPage`/
`TrackerItemDetailPage` look up their field/list config from the database
at render time rather than having it baked into a per-type component (the
old, one-hardcoded-component-per-domain approach Garage/Armory used). The
nav bar works the same way: `NavDropdownItem.jsx` has an optional
`filterItem` prop (applied to its fetched items before rendering, since
`trackerItems` is a table shared by every tracker type) so one
`TrackerNavItem` component, rendered once per row in `trackerTypes`, can
serve any number of user-created domains instead of needing one hardcoded
nav component per domain.

**Auth is real Supabase Auth (email/password).** `AuthContext.jsx` restores
whatever session Supabase already persisted on load, then stays in sync via
`onAuthStateChange` (covers sign-in/out, token refresh, and the recovery
session created when a "Forgot password?" link is clicked).
`ProtectedRoute` just checks `isAuthenticated`, unchanged from before the
swap. New accounts get a blank `profiles` row automatically via a Postgres
trigger (`handle_new_user`, see `supabase/migrations/001_initial_schema.sql`)
— the app never has to create it.

**Username is optional and separate from the login identity.** Supabase
Auth's identity is always the email; `profiles.username` is just a display
name the nav bar prefers when set (`profile.username || user?.email`), with
a unique constraint at the database level so two accounts can't collide.

**Every migration must be safe to re-run.** Supabase's GitHub integration
replays every file in `supabase/migrations/` against preview branches
cloned from production — which already has it applied — so a plain
`CREATE TABLE`/`ALTER TABLE ... ADD COLUMN`/`CREATE POLICY` errors there
even though it's a no-op. `001_initial_schema.sql` guards with `IF NOT
EXISTS`/`IF EXISTS`/`OR REPLACE` throughout (the `profiles` backfill at
the bottom is idempotent by construction instead — it only inserts rows
for users that still lack one). Write new migrations the same way.

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
is a named export, not a default one) instead of importing all of them
upfront. A single `Suspense` around `<Routes>` — inside the
`ErrorBoundary`, so a chunk-load failure is caught the same way a
rendering error is — shows a centered spinner while a route's own JS is
fetched the first time it's visited. Before this, every page was eagerly
bundled into one large chunk; each page's own dependencies (MUI pieces it
alone uses, etc.) now ship only when that page is actually reached.

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
mouse left and immediately re-triggers enter/leave. `NavDropdownItem` /
`UserNavMenu` instead reveal a plain `Paper` that lives in the same DOM
subtree as the trigger — no portal, no flicker.

**The mobile nav is a second, parallel implementation, not a responsive
version of the desktop one.** `NavDropdownItem`'s hover dropdowns
fundamentally don't work on touch (no hover event), so `NavBar.jsx`
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
notes above for what each one asserts. No component/page tests yet, so
lint/test/build passing is proof the code compiles and existing logic
isn't broken — it isn't proof a new feature's UI actually works.

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

# Personal Tracker — Roadmap

Compiled from a 1.0 code review and roadmap discussion (Aug 2026). Organized
by category, each with a suggested priority so you can pick up work without
re-deriving context.

---

## Error Handling & Reliability

**Suggested priority: Low — mostly closed out.** What's left is refinement,
not gaps.

- **Batch `useRecurringReset` updates.** The dedup guard (`resettingIds`)
  correctly stops the same item being submitted twice concurrently, but it
  still sends one `updateItem` call per due item rather than one batched
  call when several reset at once. Fine at personal scale; revisit only if
  the number of recurring items grows enough to matter.
- **Schema-level validation for Tracker fields.** `required`/`field_type`
  on `tracker_fields` are currently UI-only metadata — `TrackerItemForm`
  enforces them, but nothing stops an empty required field or a
  non-numeric value in a "number" field from being written via a direct
  API call. Low risk for a single-user app; worth a Postgres check
  constraint or a jsonb validation trigger if that guarantee ever needs to
  be real rather than UI-level.

---

## Technical / Architecture Improvements

**Suggested priority: Low-to-medium.** The two big structural pushes
(splitting, testing) are done; what's left is smaller and can be picked up
opportunistically.

- **Revisit monthly/yearly interval math.** `FREQUENCY_INTERVAL_DAYS`
  still uses fixed `30`/`365`-day approximations in `recurrence.js`, so a
  "monthly" task anchored near month-end will drift over time. Unchanged
  from the original note — still low priority, but flagging again since
  it's the one piece of the recurrence work that wasn't part of this
  round.
- **Consider a native wrapper (Capacitor)** if you ever want App
  Store/Play Store presence beyond the current installable PWA.

---

## Feature Builds

**Suggested priority: Now unblocked** — the stability work above cleared
the way for these; roughly in priority order.

- **Dashboard/stats on Overview** — completion rate over time, streaks,
  most-active hobby/tracker, upcoming maintenance across all tracker
  types. The aggregation plumbing already exists on Overview; this is
  mostly a display layer.
- **Extend tags beyond to-dos.** Tags landed on to-dos only — consider
  whether Hobbies, Tracker items, or Finances items would benefit from the
  same free-form tagging, or whether that's to-do-specific by design.
- **Search across collections** — client-side filter first, given
  personal-scale data volume.
- **Notes/attachments on individual items** — fits the existing
  `EditableDetails` pattern used elsewhere.
- **Export/import (JSON/CSV)** as a personal backup/restore path,
  independent of Supabase's own backups.
- **Notifications/reminders** — bigger lift, likely a Supabase Edge
  Function or scheduled job rather than pure client code; scope separately
  when picked up.

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
- **User-defined Trackers are done**, replacing the old fixed Garage/Armory
  domains entirely (see "Why it's built this way" above) — pruned from
  Feature Builds above.
- **The migrations folder was folded back down to a single
  `001_initial_schema.sql`** (see its own header and "Why it's built this
  way" above) — it had grown to five files (four incremental on top of the
  original), all long since applied to production, so it's back to one
  file reflecting current state, same as the original schema.sql fold.
- **Tracker field types are expanded beyond string/number**, and fields
  can now be manually ordered — date, boolean, and select (with
  user-defined options) joined string/number, plus a per-field `sortOrder`
  that controls where each one lands on the dynamic item form (see "Why
  it's built this way" above) — pruned from Technical / Architecture
  Improvements above.
