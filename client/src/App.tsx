import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import { RequireAuth } from './components/RequireAuth';
import { RequireRole } from './components/RequireRole';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import TripsPage from './pages/customer/TripsPage';
import MyTicketsPage from './pages/customer/MyTicketsPage';
import RoutesPage from './pages/operator/RoutesPage';
import EditTripsPage from './pages/operator/EditTripsPage';
import SalesReportPage from './pages/admin/SalesReportPage';
import UsersPage from './pages/admin/UsersPage';
import PageNotFound from './components/PageNotFound';
import TripDetailPage from './pages/TripDetailPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Private */}
        <Route
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
          {/* Customer */}
          <Route
            path="/trips"
            element={
              <RequireRole roles={['Customer']}>
                <TripsPage />
              </RequireRole>
            }
          />
          <Route
            path="/my-tickets"
            element={
              <RequireRole roles={['Customer']}>
                <MyTicketsPage />
              </RequireRole>
            }
          />

          {/* Operator */}
          <Route
            path="/manage/routes"
            element={
              <RequireRole roles={['Operator']}>
                <RoutesPage />
              </RequireRole>
            }
          />
          <Route
            path="/manage/edit-trips"
            element={
              <RequireRole roles={['Operator']}>
                <EditTripsPage />
              </RequireRole>
            }
          />
          {/* for Customer and Operator */}
          <Route
            path="/trips/:id"
            element={
              <RequireRole roles={['Customer', 'Operator']}>
                <TripDetailPage />
              </RequireRole>
            }
          />
          {/* Admin */}
          <Route
            path="/admin/sales-report"
            element={
              <RequireRole roles={['Admin']}>
                <SalesReportPage />
              </RequireRole>
            }
          />
          <Route
            path="/admin/users"
            element={
              <RequireRole roles={['Admin']}>
                <UsersPage />
              </RequireRole>
            }
          />
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/trips" replace />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </BrowserRouter>
  );
}