import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme';
import { AuthProvider } from './context/AuthContext';
import { NavBar } from './components/layout/NavBar';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { LoginPage } from './features/auth/LoginPage';
import { OverviewPage } from './features/overview/OverviewPage';
import { TodoPage } from './features/todos/TodoPage';
import { TaskDetailPage } from './features/todos/TaskDetailPage';
import { HobbiesPage } from './features/hobbies/HobbiesPage';
import { HobbyDetailPage } from './features/hobbies/HobbyDetailPage';
import { HobbyListEntryDetailPage } from './features/hobbies/HobbyListEntryDetailPage';
import { PurchasesPage } from './features/purchases/PurchasesPage';
import { GaragePage } from './features/garage/GaragePage';
import { VehicleDetailPage } from './features/garage/VehicleDetailPage';
import { GarageModificationDetailPage } from './features/garage/GarageModificationDetailPage';
import { GarageWishlistDetailPage } from './features/garage/GarageWishlistDetailPage';
import { GarageWishlistItemDetailPage } from './features/garage/GarageWishlistItemDetailPage';
import { ArmoryPage } from './features/armory/ArmoryPage';
import { ArmoryItemDetailPage } from './features/armory/ArmoryItemDetailPage';
import { ArmoryModificationDetailPage } from './features/armory/ArmoryModificationDetailPage';
import { ArmoryWishlistDetailPage } from './features/armory/ArmoryWishlistDetailPage';
import { ArmoryWishlistItemDetailPage } from './features/armory/ArmoryWishlistItemDetailPage';
import { ProfilePage } from './features/profile/ProfilePage';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <NavBar />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
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
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
