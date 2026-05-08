import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { AlertProvider } from './context/AlertContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import RoleRoute from './components/common/RoleRoute';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Woman pages
import WomanHome from './pages/woman/WomanHome';
import WomanAlertActive from './pages/woman/WomanAlertActive';
import WomanHistory from './pages/woman/WomanHistory';
import WomanProfile from './pages/woman/WomanProfile';
import ReviewPage from './pages/woman/ReviewPage';

// Volunteer pages
import VolunteerHome from './pages/volunteer/VolunteerHome';
import VolunteerHistory from './pages/volunteer/VolunteerHistory';
import VolunteerProfile from './pages/volunteer/VolunteerProfile';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <AlertProvider>
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 4000,
                style: { borderRadius: '12px', fontFamily: 'Inter, sans-serif', fontSize: '14px' },
                success: { iconTheme: { primary: '#1D9E75', secondary: '#fff' } },
                error: { iconTheme: { primary: '#D85A30', secondary: '#fff' } },
              }}
            />
            <Routes>
              {/* Public */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Woman routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<RoleRoute role="woman" />}>
                  <Route path="/home" element={<WomanHome />} />
                  <Route path="/alert/:id" element={<WomanAlertActive />} />
                  <Route path="/history" element={<WomanHistory />} />
                  <Route path="/profile" element={<WomanProfile />} />
                  <Route path="/review/:alertId" element={<ReviewPage />} />
                </Route>

                {/* Volunteer routes */}
                <Route element={<RoleRoute role="volunteer" />}>
                  <Route path="/volunteer/home" element={<VolunteerHome />} />
                  <Route path="/volunteer/history" element={<VolunteerHistory />} />
                  <Route path="/volunteer/profile" element={<VolunteerProfile />} />
                </Route>
              </Route>

              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </AlertProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}