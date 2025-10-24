
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HOSPITAL_NAME } from '../constants';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    abhaId: '',
    aadhaar: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }
    
    if (formData.password.length < 6) {
        setError("Password must be at least 6 characters long.");
        setIsLoading(false);
        return;
    }

    const wasSuccessful = await register({
      name: formData.name,
      abhaId: formData.abhaId,
      aadhaar: formData.aadhaar,
      password: formData.password,
    });
    
    setIsLoading(false);
    if (wasSuccessful) {
        setSuccess('Registration successful! Redirecting to login...');
        setTimeout(() => navigate('/login/patient'), 2000);
    } else {
      setError('Registration failed. The ABHA ID or Aadhaar may already be in use.');
    }
  };

  return (
    <div className="min-h-screen bg-brand-gray-light flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Patient Registration</h2>
            <p className="mt-2 text-sm text-gray-600">Create your account for {HOSPITAL_NAME}</p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
            <input name="name" type="text" placeholder="Full Name" required onChange={handleChange} className="w-full p-2 border rounded"/>
            <input name="abhaId" type="text" placeholder="ABHA ID" required onChange={handleChange} className="w-full p-2 border rounded"/>
            <input name="aadhaar" type="text" placeholder="Aadhaar Number" required onChange={handleChange} className="w-full p-2 border rounded"/>
            <input name="password" type="password" placeholder="Password" required onChange={handleChange} className="w-full p-2 border rounded"/>
            <input name="confirmPassword" type="password" placeholder="Confirm Password" required onChange={handleChange} className="w-full p-2 border rounded"/>
            
            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}

            <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand-green hover:bg-brand-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green disabled:bg-gray-400"
            >
                {isLoading ? 'Registering...' : 'Register'}
            </button>
        </form>
        <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login/patient" className="font-medium text-brand-blue hover:underline">
                Login
            </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
