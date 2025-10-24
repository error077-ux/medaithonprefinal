import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HOSPITAL_NAME } from '../constants';
import { RegisterUserData } from '../services/api';

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
        setFormData(prev => ({ ...prev, address: { ...prev.address, [field]: value } as any }));
    } else if (name.startsWith('emergencyContact.')) {
        const field = name.split('.')[1];
        setFormData(prev => ({ ...prev, emergencyContact: { ...prev.emergencyContact, [field]: value } as any }));
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
  
  const inputClass = "w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-shadow";
  const selectClass = inputClass;

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lifted border border-neutral-200/50 p-8 space-y-6">
        <div className="text-center">
            <h2 className="text-3xl font-bold text-neutral-900">Patient Registration</h2>
            <p className="mt-2 text-sm text-neutral-500">Create your account for {HOSPITAL_NAME}</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
            <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-md">
                <legend className="px-2 font-semibold text-neutral-700">Basic Details</legend>
                <input name="name" type="text" placeholder="Full Name" required onChange={handleChange} className={`${inputClass} md:col-span-2`}/>
                <select name="gender" required onChange={handleChange} className={selectClass}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                </select>
                <input name="dob" type="date" required onChange={handleChange} className={inputClass} />
                <input name="bloodGroup" type="text" placeholder="Blood Group (e.g. O+)" required onChange={handleChange} className={inputClass}/>
                <select name="maritalStatus" required onChange={handleChange} className={selectClass}>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                </select>
            </fieldset>

            <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-md">
                <legend className="px-2 font-semibold text-neutral-700">Contact & Identification</legend>
                <input name="contactNumber" type="tel" placeholder="Contact Number" required onChange={handleChange} className={inputClass}/>
                <input name="email" type="email" placeholder="Email Address" required onChange={handleChange} className={inputClass}/>
                <input name="abhaId" type="text" placeholder="ABHA ID" required onChange={handleChange} className={inputClass}/>
                <input name="aadhaar" type="text" placeholder="Aadhaar Number" required onChange={handleChange} className={inputClass}/>
            </fieldset>

             <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-md">
                <legend className="px-2 font-semibold text-neutral-700">Address</legend>
                <input name="address.line1" type="text" placeholder="Address Line 1" required onChange={handleChange} className={`${inputClass} md:col-span-2`}/>
                <input name="address.city" type="text" placeholder="City / District" required onChange={handleChange} className={inputClass}/>
                <input name="address.state" type="text" placeholder="State" required onChange={handleChange} className={inputClass}/>
                 <input name="address.pincode" type="text" placeholder="Pincode" required onChange={handleChange} className={`${inputClass} md:col-span-2`}/>
            </fieldset>

             <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-md">
                <legend className="px-2 font-semibold text-neutral-700">Emergency Contact</legend>
                <input name="emergencyContact.name" type="text" placeholder="Contact Name" required onChange={handleChange} className={inputClass}/>
                <input name="emergencyContact.phone" type="tel" placeholder="Contact Phone" required onChange={handleChange} className={inputClass}/>
            </fieldset>

             <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-md">
                <legend className="px-2 font-semibold text-neutral-700">Set Password</legend>
                <input name="password" type="password" placeholder="Password (min 6 characters)" required onChange={handleChange} className={inputClass}/>
                <input name="confirmPassword" type="password" placeholder="Confirm Password" required onChange={(e) => setConfirmPassword(e.target.value)} className={inputClass}/>
            </fieldset>
            
            {error && <p className="text-sm text-danger-dark bg-danger-light p-3 rounded-lg">{error}</p>}
            {success && <p className="text-sm text-success-dark bg-success-light p-3 rounded-lg">{success}</p>}

            <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-secondary hover:bg-secondary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary disabled:bg-neutral-400 transition-colors"
            >
                {isLoading ? 'Registering...' : 'Register'}
            </button>
        </form>
        <p className="text-center text-sm text-neutral-600">
            Already have an account?{' '}
            <Link to="/login/patient" className="font-medium text-primary hover:underline">
                Login
            </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;