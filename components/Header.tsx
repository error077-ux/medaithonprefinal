import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ICONS, HOSPITAL_NAME } from '../constants';
import { UserRole } from '../types';

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
    <header className="bg-white/80 backdrop-blur-sm border-b border-neutral-200 p-4 flex justify-between items-center sticky top-0 z-30">
      <h1 className="text-xl md:text-2xl font-bold text-neutral-900">{HOSPITAL_NAME}</h1>
      {user && (
        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <p className="font-semibold text-neutral-800">{user.name}</p>
            <p className="text-sm text-neutral-500">{roleDisplay[user.role]}</p>
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-full text-neutral-500 hover:bg-danger-light hover:text-danger-dark transition-colors duration-200"
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