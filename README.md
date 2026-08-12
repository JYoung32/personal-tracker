# Personal Tracker

A personal tracker for daily to-dos, hobbies, a garage, and an armory —
each with recurring maintenance tasks that also show up on the to-do list.
React + Vite + MUI, localStorage-backed for now.

## Getting started

```bash
npm install
npm run dev
```

Open the printed localhost URL. Log in with **any** username/password — auth
is currently a mock placeholder (see below).

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
- **Finances** — placeholder page (formerly "Purchase Orders"), not yet
  built out.
- **Profile** — username, first name, last name, reached by clicking the
  nav-bar username/icon.
- **Nav bar** — hover over Garage/Armory for a dropdown of their items;
  hover the profile icon to reveal Log out.

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
    useRecurringReset.js     Auto-uncheck recurring todos/maintenance tasks
                              on their scheduled reset date
    useProfile.js             Synchronous localStorage read/write for the
                              singleton profile record
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
    purchases/                PurchasesPage — placeholder ("Finances" tab)
    profile/                  ProfilePage
    auth/
      LoginPage.jsx
  components/
    layout/
      NavBar.jsx, ProtectedRoute.jsx, NavDropdownItem.jsx,
      GarageNavItem.jsx, ArmoryNavItem.jsx, UserNavMenu.jsx
    common/
      Shared building blocks reused across features — see below.
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
  Maintenance / Modifications / Wishlist lists and a hobby's user-created
  lists, so each tab's add-to-list control only shows and works for the
  list currently selected.
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
`localStorage` directly — it all goes through `services/storage/index.js`,
which currently points at `localStorageAdapter.js`. When you're ready to add
Supabase:

1. Create `services/storage/supabaseAdapter.js` implementing the same four
   methods: `getAll(key)`, `create(key, item)`, `update(key, id, updates)`,
   `remove(key, id)`.
2. Change the one-line export in `services/storage/index.js`.
3. Nothing else changes.

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

**Auth is a clearly-marked placeholder.** `AuthContext.jsx` accepts any
non-empty username/password and just gates routes via `ProtectedRoute`. It's
commented with the exact swap-out plan for Supabase Auth when you get there.

**Nav-bar hover dropdowns use plain CSS `:hover`, not MUI `Menu`.** An
earlier attempt with `Menu` flickered because its modal overlay renders on
top of the trigger button once open, which makes the browser think the
mouse left and immediately re-triggers enter/leave. `GarageNavItem` /
`ArmoryNavItem` / `UserNavMenu` instead reveal a plain `Paper` that lives in
the same DOM subtree as the trigger — no portal, no flicker.

## Next steps (suggested order)

1. Build out `PurchasesPage` ("Finances") — fields like vendor, price,
   status, reusing `useCollection('purchases')`.
2. Swap in Supabase for storage once the data shapes feel settled.
3. Swap in Supabase Auth (or Clerk) for real login.
4. Consider a PWA wrapper for a more native-feeling iPhone experience.
