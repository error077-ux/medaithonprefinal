import React from 'react';
import { Link } from 'react-router-dom';
import { ICONS, HOSPITAL_NAME } from '../constants';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-center items-center p-4">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-neutral-900 mb-2">Welcome to {HOSPITAL_NAME}</h1>
        <p className="text-xl text-neutral-500">Your health, our priority.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <PortalCard
          title="Patient Portal"
          description="Access your health records, book appointments, and manage your profile."
          icon={ICONS.user}
          linkTo="/login/patient"
          colorClasses="bg-primary-light text-primary-dark"
        />
        <PortalCard
          title="Hospital Portal"
          description="For doctors, nurses, and staff. Manage patients and hospital operations."
          icon={ICONS.patient}
          linkTo="/login/hospital"
          colorClasses="bg-secondary/20 text-secondary-dark"
        />
      </div>
       <footer className="absolute bottom-8 text-neutral-400">
            <p>A Modern Hospital Management System</p>
        </footer>
    </div>
  );
};

interface PortalCardProps {
  title: string;
  description: string;
  // FIX: Changed icon prop type to React.ReactElement for better type safety with cloneElement.
  icon: React.ReactElement;
  linkTo: string;
  colorClasses: string;
}

const PortalCard: React.FC<PortalCardProps> = ({ title, description, icon, linkTo, colorClasses }) => {
  return (
    <Link to={linkTo} className="block group h-full">
      <div className="bg-white p-8 rounded-2xl shadow-soft hover:shadow-lifted border border-neutral-200/50 transform hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
        <div className="flex items-center space-x-6 mb-4">
          <div className={`w-16 h-16 p-3 rounded-full flex items-center justify-center ${colorClasses}`}>
            {React.cloneElement(icon, { className: "w-full h-full" })}
          </div>
          <h2 className="text-3xl font-bold text-neutral-900">{title}</h2>
        </div>
        <p className="text-lg text-neutral-500 flex-grow">{description}</p>
        <div className="mt-6 font-semibold text-primary group-hover:text-primary-dark transition-colors flex items-center">
          Go to Portal <span className="ml-2 transition-transform group-hover:translate-x-1">&rarr;</span>
        </div>
      </div>
    </Link>
  );
};

export default LandingPage;