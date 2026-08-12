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
const GaragePage = lazy(() => import('./features/garage/GaragePage').then((m) => ({ default: m.GaragePage })));
const VehicleDetailPage = lazy(() =>
  import('./features/garage/VehicleDetailPage').then((m) => ({ default: m.VehicleDetailPage }))
);
const GarageModificationDetailPage = lazy(() =>
  import('./features/garage/GarageModificationDetailPage').then((m) => ({
    default: m.GarageModificationDetailPage,
  }))
);
const GarageWishlistDetailPage = lazy(() =>
  import('./features/garage/GarageWishlistDetailPage').then((m) => ({ default: m.GarageWishlistDetailPage }))
);
const GarageWishlistItemDetailPage = lazy(() =>
  import('./features/garage/GarageWishlistItemDetailPage').then((m) => ({
    default: m.GarageWishlistItemDetailPage,
  }))
);
const ArmoryPage = lazy(() => import('./features/armory/ArmoryPage').then((m) => ({ default: m.ArmoryPage })));
const ArmoryItemDetailPage = lazy(() =>
  import('./features/armory/ArmoryItemDetailPage').then((m) => ({ default: m.ArmoryItemDetailPage }))
);
const ArmoryModificationDetailPage = lazy(() =>
  import('./features/armory/ArmoryModificationDetailPage').then((m) => ({
    default: m.ArmoryModificationDetailPage,
  }))
);
const ArmoryWishlistDetailPage = lazy(() =>
  import('./features/armory/ArmoryWishlistDetailPage').then((m) => ({ default: m.ArmoryWishlistDetailPage }))
);
const ArmoryWishlistItemDetailPage = lazy(() =>
  import('./features/armory/ArmoryWishlistItemDetailPage').then((m) => ({
    default: m.ArmoryWishlistItemDetailPage,
  }))
);
const ProfilePage = lazy(() => import('./features/profile/ProfilePage').then((m) => ({ default: m.ProfilePage })));

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
            path="/garage"
            element={
              <ProtectedRoute>
                <GaragePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/garage/wishlist/:wishId"
            element={
              <ProtectedRoute>
                <GarageWishlistItemDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/garage/:vehicleId"
            element={
              <ProtectedRoute>
                <VehicleDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/garage/:vehicleId/modifications/:modId"
            element={
              <ProtectedRoute>
                <GarageModificationDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/garage/:vehicleId/wishlist/:wishId"
            element={
              <ProtectedRoute>
                <GarageWishlistDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/armory"
            element={
              <ProtectedRoute>
                <ArmoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/armory/wishlist/:wishId"
            element={
              <ProtectedRoute>
                <ArmoryWishlistItemDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/armory/:itemId"
            element={
              <ProtectedRoute>
                <ArmoryItemDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/armory/:itemId/modifications/:modId"
            element={
              <ProtectedRoute>
                <ArmoryModificationDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/armory/:itemId/wishlist/:wishId"
            element={
              <ProtectedRoute>
                <ArmoryWishlistDetailPage />
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
