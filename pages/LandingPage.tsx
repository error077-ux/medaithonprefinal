import React from 'react';
import { Link } from 'react-router-dom';
import { ICONS, HOSPITAL_NAME } from '../constants';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col justify-center items-center p-4">
      <div className="text-center mb-12 animate-fade-in-up">
        <h1 className="text-5xl font-extrabold text-neutral-800 mb-2">Welcome to {HOSPITAL_NAME}</h1>
        <p className="text-xl text-neutral-500">Your Health, Our Priority.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <PortalCard
            title="Patient Portal"
            description="Access your health records, book appointments, and manage your profile."
            icon={ICONS.user}
            linkTo="/login/patient"
            colorClasses="bg-primary-100 text-primary-600"
          />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <PortalCard
            title="Hospital Portal"
            description="For doctors, nurses, and staff. Manage patients and hospital operations."
            icon={ICONS.patient}
            linkTo="/login/hospital"
            colorClasses="bg-accent-100 text-accent-600"
          />
        </div>
      </div>
       <footer className="absolute bottom-8 text-neutral-400 animate-fade-in" style={{ animationDelay: '600ms' }}>
            <p>A Modern Hospital Management System</p>
        </footer>
    </div>
  );
};

interface PortalCardProps {
  title: string;
  description: string;
  icon: React.ReactElement;
  linkTo: string;
  colorClasses: string;
}

const PortalCard: React.FC<PortalCardProps> = ({ title, description, icon, linkTo, colorClasses }) => {
  return (
    <Link to={linkTo} className="block group h-full">
      <div className="bg-white p-8 rounded-2xl shadow-soft hover:shadow-lifted border border-neutral-200/80 transform hover:-translate-y-2 transition-all duration-300 flex flex-col h-full hover:border-primary-300">
        <div className="flex items-center space-x-6 mb-4">
          <div className={`w-16 h-16 p-3 rounded-full flex items-center justify-center ${colorClasses} transition-all duration-300 group-hover:bg-primary group-hover:text-white`}>
            {/* FIX: Cast icon to a ReactElement that accepts className to resolve TypeScript error. */}
            {React.cloneElement(icon as React.ReactElement<{ className: string }>, { className: "w-full h-full" })}
          </div>
          <h2 className="text-3xl font-bold text-neutral-800">{title}</h2>
        </div>
        <p className="text-lg text-neutral-500 flex-grow">{description}</p>
        <div className="mt-6 font-semibold text-primary-500 group-hover:text-primary-600 transition-colors flex items-center">
          Go to Portal <span className="ml-2 transition-transform group-hover:translate-x-1.5">&rarr;</span>
        </div>
      </div>
    </Link>
  );
};

export default LandingPage;
