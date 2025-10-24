import React from 'react';

interface CardProps {
  title: string;
  value: string | number;
  icon: React.ReactElement;
  color: string;
}

const Card: React.FC<CardProps> = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-soft border border-neutral-200 flex items-center space-x-6 transition-all duration-300 hover:shadow-lifted hover:-translate-y-1.5 hover:border-primary-300 hover:shadow-glow-primary">
      <div className={`p-4 rounded-full flex items-center justify-center ${color}`}>
        {/* FIX: Cast icon to a ReactElement that accepts className to resolve TypeScript error. */}
        {React.cloneElement(icon as React.ReactElement<{ className: string }>, { className: "w-8 h-8" })}
      </div>
      <div>
        <p className="text-neutral-500 font-medium">{title}</p>
        <p className="text-3xl font-bold text-neutral-800">{value}</p>
      </div>
    </div>
  );
};

export default Card;
