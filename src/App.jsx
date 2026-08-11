import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme';
import { AuthProvider } from './context/AuthContext';
import { NavBar } from './components/layout/NavBar';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { LoginPage } from './features/auth/LoginPage';
import { TodoPage } from './features/todos/TodoPage';
import { HobbiesPage } from './features/hobbies/HobbiesPage';
import { PurchasesPage } from './features/purchases/PurchasesPage';

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
              path="/todos"
              element={
                <ProtectedRoute>
                  <TodoPage />
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
              path="/purchases"
              element={
                <ProtectedRoute>
                  <PurchasesPage />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/todos" replace />} />
            <Route path="*" element={<Navigate to="/todos" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
