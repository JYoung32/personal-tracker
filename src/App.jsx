import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { theme } from './theme';
import { AuthProvider } from './context/AuthContext';
import { NavBar } from './components/layout/NavBar';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Every page below is lazy-loaded so the initial bundle only ships the
// shell (nav bar, auth, routing) — each route's own code (and whatever it
// pulls in) becomes its own chunk, fetched the first time that route is
// visited. `.then(m => ({ default: m.X }))` is needed because every page
// component here is a named export, not a default one.
const LoginPage = lazy(() => import('./features/auth/LoginPage').then((m) => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import('./features/auth/SignupPage').then((m) => ({ default: m.SignupPage })));
const ForgotPasswordPage = lazy(() =>
  import('./features/auth/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage }))
);
const ResetPasswordPage = lazy(() =>
  import('./features/auth/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage }))
);
const OverviewPage = lazy(() => import('./features/overview/OverviewPage').then((m) => ({ default: m.OverviewPage })));
const TodoPage = lazy(() => import('./features/todos/TodoPage').then((m) => ({ default: m.TodoPage })));
const TaskDetailPage = lazy(() => import('./features/todos/TaskDetailPage').then((m) => ({ default: m.TaskDetailPage })));
const HobbiesPage = lazy(() => import('./features/hobbies/HobbiesPage').then((m) => ({ default: m.HobbiesPage })));
const HobbyDetailPage = lazy(() =>
  import('./features/hobbies/HobbyDetailPage').then((m) => ({ default: m.HobbyDetailPage }))
);
const HobbyListEntryDetailPage = lazy(() =>
  import('./features/hobbies/HobbyListEntryDetailPage').then((m) => ({ default: m.HobbyListEntryDetailPage }))
);
const PurchasesPage = lazy(() =>
  import('./features/purchases/PurchasesPage').then((m) => ({ default: m.PurchasesPage }))
);
const OweItemDetailPage = lazy(() =>
  import('./features/purchases/OweItemDetailPage').then((m) => ({ default: m.OweItemDetailPage }))
);
const WishToPurchaseItemDetailPage = lazy(() =>
  import('./features/purchases/WishToPurchaseItemDetailPage').then((m) => ({
    default: m.WishToPurchaseItemDetailPage,
  }))
);
const ProfilePage = lazy(() => import('./features/profile/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const TrackerTypesPage = lazy(() =>
  import('./features/trackers/TrackerTypesPage').then((m) => ({ default: m.TrackerTypesPage }))
);
const TrackerTypeDetailPage = lazy(() =>
  import('./features/trackers/TrackerTypeDetailPage').then((m) => ({ default: m.TrackerTypeDetailPage }))
);
const TrackerItemDetailPage = lazy(() =>
  import('./features/trackers/TrackerItemDetailPage').then((m) => ({ default: m.TrackerItemDetailPage }))
);
const TrackerItemListEntryDetailPage = lazy(() =>
  import('./features/trackers/TrackerItemListEntryDetailPage').then((m) => ({
    default: m.TrackerItemListEntryDetailPage,
  }))
);

function RouteFallback() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', pt: 10 }}>
      <CircularProgress />
    </Box>
  );
}

// A rendering bug on one page shouldn't blank the whole app, so the routes
// (not NavBar) are wrapped in an ErrorBoundary — see its own docstring.
// resetKey is the current path, so navigating away from a crashed page
// gives the next one a clean try instead of staying stuck on the fallback.
// Suspense sits inside the boundary so a lazy-chunk load failure (e.g. a
// network drop fetching a route's JS) is caught by it too, not just a
// rendering error once the chunk arrives.
function AppRoutes() {
  const location = useLocation();

  return (
    <ErrorBoundary key={location.pathname}>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route
            path="/overview"
            element={
              <ProtectedRoute>
                <OverviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/todos"
            element={
              <ProtectedRoute>
                <TodoPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/todos/:todoId"
            element={
              <ProtectedRoute>
                <TaskDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hobbies"
            element={
              <ProtectedRoute>
                <HobbiesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hobbies/:hobbyId"
            element={
              <ProtectedRoute>
                <HobbyDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hobbies/:hobbyId/lists/:listId/entries/:entryId"
            element={
              <ProtectedRoute>
                <HobbyListEntryDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/purchases"
            element={
              <ProtectedRoute>
                <PurchasesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/purchases/owe/:oweId"
            element={
              <ProtectedRoute>
                <OweItemDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/purchases/wish-to-purchase/:wishId"
            element={
              <ProtectedRoute>
                <WishToPurchaseItemDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trackers"
            element={
              <ProtectedRoute>
                <TrackerTypesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trackers/:typeId"
            element={
              <ProtectedRoute>
                <TrackerTypeDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trackers/:typeId/:itemId"
            element={
              <ProtectedRoute>
                <TrackerItemDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trackers/:typeId/:itemId/lists/:listId/entries/:entryId"
            element={
              <ProtectedRoute>
                <TrackerItemListEntryDetailPage />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/overview" replace />} />
          <Route path="*" element={<Navigate to="/overview" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <AuthProvider>
          <NavBar />
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
