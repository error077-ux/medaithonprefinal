
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HOSPITAL_NAME } from '../constants';

const LoginPage: React.FC = () => {
  const { portal } = useParams<{ portal: 'patient' | 'hospital' }>();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const portalTitle = portal === 'patient' ? 'Patient Portal' : 'Hospital Staff Portal';

  useEffect(() => {
    setError('');
    setId('');
    setPassword('');
  }, [portal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    if (!portal) return;

    const credentials = portal === 'patient' 
      ? { abhaId: id, password } 
      : { staffId: id, password }; // Assuming staff also use password

    const success = await login(credentials, portal);
    setIsLoading(false);
    if (success) {
      navigate(portal === 'patient' ? '/patient' : '/hospital');
    } else {
      setError('Invalid credentials. Please check your details and try again.');
    }
  };

  return (
    <div className="min-h-screen bg-brand-gray-light flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
            <Link to="/" className="text-brand-blue hover:underline mb-4 inline-block">&larr; Back to Home</Link>
            <h2 className="text-3xl font-bold text-gray-900">{portalTitle} Login</h2>
            <p className="mt-2 text-sm text-gray-600">Welcome to {HOSPITAL_NAME}</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
                <label htmlFor="userId" className="text-sm font-medium text-gray-700 block mb-2">
                    {portal === 'patient' ? 'ABHA ID' : 'Staff ID'}
                </label>
                <input
                    id="userId"
                    name="userId"
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue"
                    placeholder="Enter your ID"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                />
            </div>
            <div>
                <label htmlFor="password" className="text-sm font-medium text-gray-700 block mb-2">
                    Password
                </label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
             {error && <p className="text-sm text-red-600">{error}</p>}
            <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand-blue hover:bg-brand-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue disabled:bg-gray-400"
            >
                {isLoading ? 'Logging in...' : 'Login'}
            </button>
        </form>
        {portal === 'patient' && (
            <p className="text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/register/patient" className="font-medium text-brand-blue hover:underline">
                    Sign Up
                </Link>
            </p>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
