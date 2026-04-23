import { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Analytics from './pages/Analytics';
import Dashboard from './pages/Dashboard'; 
import Register from './pages/Register';
import Planner from './pages/Planner';
import Habitos from './pages/Habitos';
import Admin from './pages/Admin';

// Componente para proteger rotas
function PrivateRoute({ children }) {
  const { signed } = useContext(AuthContext);
  return signed ? children : <Navigate to="/" />;
}

function AdminRoute({ children }) {
  const { signed, isAdmin } = useContext(AuthContext);
  return signed && isAdmin ? children : <Navigate to="/dashboard" />;
}

import Layout from './components/Layout';

import { NotificationProvider } from './contexts/NotificationContext';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Layout>
                  <Dashboard /> 
                </Layout>
              </PrivateRoute>
            } 
          />

          <Route 
            path="/analytics" 
            element={
              <PrivateRoute>
                <Layout>
                  <Analytics />
                </Layout>
              </PrivateRoute>
            } 
          />
          
          {/* Rotas de negócio */}
          <Route path="/planner" element={<PrivateRoute><Layout><Planner /></Layout></PrivateRoute>} />
          <Route path="/habitos" element={<PrivateRoute><Layout><Habitos /></Layout></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
          <Route path="/admin" element={<AdminRoute><Layout><Admin /></Layout></AdminRoute>} />
        </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;