import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Sidebar from './components/Sidebar';
import LoginPage      from './pages/LoginPage';
import DashboardPage  from './pages/DashboardPage';
import OrdersPage     from './pages/OrdersPage';
import NewOrderPage   from './pages/NewOrderPage';
import OrderDetailPage from './pages/OrderDetailPage';
import './styles/globals.css';

function RequireAuth() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <span className="spinner spinner-dark" style={{ width: 36, height: 36 }} />
      </div>
    );
  }
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

function AppLayout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<RequireAuth />}>
            <Route element={<AppLayout />}>
              <Route path="/"            element={<DashboardPage />} />
              <Route path="/orders"      element={<OrdersPage />} />
              <Route path="/orders/:id"  element={<OrderDetailPage />} />
              <Route path="/new-order"   element={<NewOrderPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            fontFamily: 'Inter, sans-serif',
            fontSize: '13.5px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,.12)',
          },
          success: { iconTheme: { primary: '#00B98E', secondary: '#fff' } },
        }}
      />
    </AuthProvider>
  );
}
