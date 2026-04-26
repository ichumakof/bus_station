import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { RootRedirect } from './app/RootRedirect';
import AppLayout from './components/AppLayout';
import PageNotFound from './components/PageNotFound';
import { RequireAuth } from './components/RequireAuth';
import { RequireRole } from './components/RequireRole';
import { SalesReportPage } from './pages/admin/SalesReportPage';
import UsersPage from './pages/admin/UsersPage';
import MyTicketsPage from './pages/customer/MyTicketsPage';
import TripsPage from './pages/customer/TripsPage';
import ForbiddenPage from './pages/ForbiddenPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TripDetailPage from './pages/TripDetailPage';
import EditTripsPage from './pages/operator/EditTripsPage';
import RoutesPage from './pages/operator/RoutesPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
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
          <Route
            path="/trips/:id"
            element={
              <RequireRole roles={['Customer', 'Operator']}>
                <TripDetailPage />
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
          <Route
            path="/admin/sales-report"
            element={
              <RequireRole roles={['Admin']}>
                <SalesReportPage />
              </RequireRole>
            }
          />
          <Route path="/forbidden" element={<ForbiddenPage />} />
        </Route>

        <Route path="/" element={<RootRedirect />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
