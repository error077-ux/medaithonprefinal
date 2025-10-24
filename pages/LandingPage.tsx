
import React from 'react';
import { Link } from 'react-router-dom';
import { ICONS, HOSPITAL_NAME } from '../constants';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-blue-light flex flex-col justify-center items-center p-4">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-brand-blue-dark mb-2">Welcome to {HOSPITAL_NAME}</h1>
        <p className="text-xl text-gray-600">Your health, our priority.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <PortalCard
          title="Patient Portal"
          description="Access your health records, book appointments, and manage your profile."
          icon={ICONS.user}
          linkTo="/login/patient"
          colorClasses="from-blue-500 to-blue-600"
        />
        <PortalCard
          title="Hospital Portal"
          description="For doctors, nurses, and staff. Manage patients and hospital operations."
          icon={ICONS.patient}
          linkTo="/login/hospital"
          colorClasses="from-green-500 to-green-600"
        />
      </div>
    </div>
  );
};

interface PortalCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  linkTo: string;
  colorClasses: string;
}

const PortalCard: React.FC<PortalCardProps> = ({ title, description, icon, linkTo, colorClasses }) => {
  return (
    <Link to={linkTo} className="block group">
      <div className={`bg-gradient-to-br ${colorClasses} text-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300`}>
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16">{icon}</div>
          <h2 className="text-3xl font-bold">{title}</h2>
        </div>
        <p className="text-lg opacity-90">{description}</p>
        <div className="mt-6 text-right font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
          Go to Portal &rarr;
        </div>
      </div>
    </Link>
  );
};

export default LandingPage;
