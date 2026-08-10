import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// User Pages
import CatalogPage from './pages/user/CatalogPage';
import UnitDetailPage from './pages/user/UnitDetailPage';
import MyBorrowingsPage from './pages/user/MyBorrowingsPage';
import ProfilePage from './pages/user/ProfilePage';

// Admin Pages
import DashboardPage from './pages/admin/DashboardPage';
import ManageUsersPage from './pages/admin/ManageUsersPage';
import ManageUnitsPage from './pages/admin/ManageUnitsPage';
import ManageEventsPage from './pages/admin/ManageEventsPage';
import BorrowingsPage from './pages/admin/BorrowingsPage';
import ReportsPage from './pages/admin/ReportsPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected User Routes */}
          <Route element={<ProtectedRoute allowedRoles={['user', 'admin']} />}>
            <Route element={<Layout title="Katalog Unit Kostum" />}>
              <Route path="/catalog" element={<CatalogPage />} />
              <Route path="/catalog/:id" element={<UnitDetailPage />} />
              <Route path="/my-borrowings" element={<MyBorrowingsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route element={<Layout title="Admin Portal" />}>
              <Route path="/admin" element={<DashboardPage />} />
              <Route path="/admin/users" element={<ManageUsersPage />} />
              <Route path="/admin/units" element={<ManageUnitsPage />} />
              <Route path="/admin/events" element={<ManageEventsPage />} />
              <Route path="/admin/borrowings" element={<BorrowingsPage />} />
              <Route path="/admin/reports" element={<ReportsPage />} />
            </Route>
          </Route>

          {/* Default Redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
