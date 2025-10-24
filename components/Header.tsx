
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ICONS, HOSPITAL_NAME } from '../constants';
import { UserRole } from '../types';

// FIX: Added missing UserRole entries to satisfy the Record type.
const roleDisplay: Record<UserRole, string> = {
  [UserRole.PATIENT]: 'Patient',
  [UserRole.DOCTOR]: 'Doctor',
  [UserRole.NURSE]: 'Nurse',
  [UserRole.ADMIN]: 'Administrator',
  [UserRole.LAB_TECHNICIAN]: 'Lab Technician',
  [UserRole.RADIOLOGIST]: 'Radiologist',
  [UserRole.MANAGER]: 'Manager',
  [UserRole.HR]: 'HR',
  [UserRole.FINANCE]: 'Finance',
  [UserRole.PHARMACIST]: 'Pharmacist',
};

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-10">
      <h1 className="text-xl md:text-2xl font-bold text-brand-blue-dark">{HOSPITAL_NAME}</h1>
      {user && (
        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <p className="font-semibold text-gray-800">{user.name}</p>
            <p className="text-sm text-gray-500">{roleDisplay[user.role]}</p>
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-full text-gray-600 hover:bg-red-100 hover:text-red-600 transition-colors"
            title="Logout"
          >
            {ICONS.logout}
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
