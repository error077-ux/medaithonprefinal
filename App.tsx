
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PatientPortal from './pages/PatientPortal';
import HospitalPortal from './pages/HospitalPortal';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <Main />
      </HashRouter>
    </AuthProvider>
  );
};

const Main: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login/:portal" element={<LoginPage />} />
      <Route path="/register/patient" element={<RegisterPage />} />

      <Route 
        path="/patient/*" 
        element={user && user.role === 'PATIENT' ? <PatientPortal /> : <Navigate to="/login/patient" />} 
      />
      <Route 
        path="/hospital/*" 
        element={user && user.role !== 'PATIENT' ? <HospitalPortal /> : <Navigate to="/login/hospital" />} 
      />
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
