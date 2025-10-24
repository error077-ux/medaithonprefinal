import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HOSPITAL_NAME } from '../constants';
import { RegisterUserData, User } from '../services/api';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState<Partial<RegisterUserData>>({
    name: '',
    abhaId: '',
    aadhaar: '',
    password: '',
    gender: 'Male',
    dob: '',
    bloodGroup: '',
    maritalStatus: 'Single',
    contactNumber: '',
    email: '',
    address: { line1: '', city: '', state: '', pincode: '' },
    emergencyContact: { name: '', phone: '' }
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
        const field = name.split('.')[1];
        setFormData(prev => ({ ...prev, address: { ...prev.address, [field]: value } }));
    } else if (name.startsWith('emergencyContact.')) {
        const field = name.split('.')[1];
        setFormData(prev => ({ ...prev, emergencyContact: { ...prev.emergencyContact, [field]: value } }));
    } else {
        setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (formData.password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }
    
    if (formData.password && formData.password.length < 6) {
        setError("Password must be at least 6 characters long.");
        setIsLoading(false);
        return;
    }

    try {
        const wasSuccessful = await register(formData as RegisterUserData);
        setIsLoading(false);
        if (wasSuccessful) {
            setSuccess('Registration successful! Redirecting to login...');
            setTimeout(() => navigate('/login/patient'), 2000);
        } else {
          setError('Registration failed. The ABHA ID or Aadhaar may already be in use.');
        }
    } catch (err: any) {
        setIsLoading(false);
        setError(err.message || 'An unexpected error occurred.');
    }
  };

  return (
    <div className="min-h-screen bg-brand-gray-light flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Patient Registration</h2>
            <p className="mt-2 text-sm text-gray-600">Create your account for {HOSPITAL_NAME}</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
            <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-md">
                <legend className="px-2 font-semibold">Basic Details</legend>
                <input name="name" type="text" placeholder="Full Name" required onChange={handleChange} className="w-full p-2 border rounded md:col-span-2"/>
                <select name="gender" required onChange={handleChange} className="w-full p-2 border rounded">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                </select>
                <input name="dob" type="date" placeholder="Date of Birth" required onChange={handleChange} className="w-full p-2 border rounded"/>
                <input name="bloodGroup" type="text" placeholder="Blood Group (e.g. O+)" required onChange={handleChange} className="w-full p-2 border rounded"/>
                <select name="maritalStatus" required onChange={handleChange} className="w-full p-2 border rounded">
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                </select>
            </fieldset>

            <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-md">
                <legend className="px-2 font-semibold">Contact & Identification</legend>
                <input name="contactNumber" type="tel" placeholder="Contact Number" required onChange={handleChange} className="w-full p-2 border rounded"/>
                <input name="email" type="email" placeholder="Email Address" required onChange={handleChange} className="w-full p-2 border rounded"/>
                <input name="abhaId" type="text" placeholder="ABHA ID" required onChange={handleChange} className="w-full p-2 border rounded"/>
                <input name="aadhaar" type="text" placeholder="Aadhaar Number" required onChange={handleChange} className="w-full p-2 border rounded"/>
            </fieldset>

             <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-md">
                <legend className="px-2 font-semibold">Address</legend>
                <input name="address.line1" type="text" placeholder="Address Line 1" required onChange={handleChange} className="w-full p-2 border rounded md:col-span-2"/>
                <input name="address.city" type="text" placeholder="City / District" required onChange={handleChange} className="w-full p-2 border rounded"/>
                <input name="address.state" type="text" placeholder="State" required onChange={handleChange} className="w-full p-2 border rounded"/>
                 <input name="address.pincode" type="text" placeholder="Pincode" required onChange={handleChange} className="w-full p-2 border rounded md:col-span-2"/>
            </fieldset>

             <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-md">
                <legend className="px-2 font-semibold">Emergency Contact</legend>
                <input name="emergencyContact.name" type="text" placeholder="Contact Name" required onChange={handleChange} className="w-full p-2 border rounded"/>
                <input name="emergencyContact.phone" type="tel" placeholder="Contact Phone" required onChange={handleChange} className="w-full p-2 border rounded"/>
            </fieldset>

             <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-md">
                <legend className="px-2 font-semibold">Set Password</legend>
                <input name="password" type="password" placeholder="Password" required onChange={handleChange} className="w-full p-2 border rounded"/>
                <input name="confirmPassword" type="password" placeholder="Confirm Password" required onChange={(e) => setConfirmPassword(e.target.value)} className="w-full p-2 border rounded"/>
            </fieldset>
            
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