import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ICONS, HOSPITAL_NAME } from '../constants';
import { UserRole } from '../types';

const roleDisplay: Record<UserRole, string> = {
  [UserRole.PATIENT]: 'Patient',
  [UserRole.DOCTOR]: 'Doctor',
  [UserRole.NURSE]: 'Nurse',
  [UserRole.ADMIN]: 'Admin',
  [UserRole.LAB_TECHNICIAN]: 'Lab Technician',
  [UserRole.RADIOLOGIST]: 'Radiologist',
  [UserRole.MANAGER]: 'Manager',
  [UserRole.HR]: 'Human Resources',
  [UserRole.FINANCE]: 'Finance',
  [UserRole.PHARMACIST]: 'Pharmacist',
};

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-neutral-50/80 backdrop-blur-lg border-b border-neutral-200/80 p-4 flex justify-between items-center sticky top-0 z-30 animate-slide-down">
      <h1 className="text-xl md:text-2xl font-bold text-neutral-800">{HOSPITAL_NAME}</h1>
      {user && (
        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <p className="font-semibold text-neutral-700">{user.name}</p>
            <p className="text-sm text-neutral-500">{roleDisplay[user.role]}</p>
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-full text-neutral-500 hover:bg-danger-100 hover:text-danger-600 transition-colors duration-200"
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