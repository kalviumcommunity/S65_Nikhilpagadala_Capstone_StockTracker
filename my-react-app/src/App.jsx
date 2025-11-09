import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import SignIn from './components/SignIn';
import LogIn from './components/LogIn';
import Homepage from './components/Homepage';
import AuthLoading from './components/AuthLoading.jsx';

// Utility functions
const isTokenValid = (token) => {
  if (!token) return false;
  try {
    const { exp } = jwtDecode(token);
    return Date.now() < exp * 1000;
  } catch (error) {
    console.error('Token validation error:', error);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return false;
  }
};

const attemptRefresh = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken || !isTokenValid(refreshToken)) {
    localStorage.removeItem('refreshToken');
    return null;
  }

  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${refreshToken}`
      }
    });

    if (!response.ok) throw new Error('Refresh failed');

    const { accessToken, refreshToken: newRefreshToken } = await response.json();
    localStorage.setItem('accessToken', accessToken);
    if (newRefreshToken) {
      localStorage.setItem('refreshToken', newRefreshToken);
    }
    return accessToken;
  } catch (error) {
    console.error('Refresh token error:', error);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return null;
  }
};

// Components
const AuthStatusChecker = ({ children }) => {
  const [authState, setAuthState] = useState({
    status: 'checking',
    token: null
  });
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = localStorage.getItem('accessToken');
      
      // Case 1: Valid access token exists
      if (accessToken && isTokenValid(accessToken)) {
        setAuthState({ status: 'authenticated', token: accessToken });
        return;
      }

      // Case 2: Try to refresh token
      const newToken = await attemptRefresh();
      if (newToken) {
        setAuthState({ status: 'authenticated', token: newToken });
      } else {
        // Case 3: No valid tokens
        setAuthState({ status: 'unauthenticated', token: null });
      }
    };

    checkAuth();
  }, [location]);

  if (authState.status === 'checking') return <AuthLoading />;
  if (authState.status === 'authenticated') return children;
  return <Navigate to="/login" state={{ from: location }} replace />;
};

const InitialRedirect = () => {
  const [redirectPath, setRedirectPath] = useState(null);

  useEffect(() => {
    const determineRedirect = async () => {
      const accessToken = localStorage.getItem('accessToken');
      
      if (accessToken && isTokenValid(accessToken)) {
        setRedirectPath('/homepage');
        return;
      }

      const newToken = await attemptRefresh();
      setRedirectPath(newToken ? '/homepage' : '/login');
    };

    determineRedirect();
  }, []);

  if (!redirectPath) return <AuthLoading />;
  return <Navigate to={redirectPath} replace />;
};

// Main App Component
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<InitialRedirect />} />
        <Route path="/login" element={<LogIn />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/homepage" element={
          <AuthStatusChecker>
            <Homepage />
          </AuthStatusChecker>
        } />
        {/* Add a catch-all route for 404s */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;