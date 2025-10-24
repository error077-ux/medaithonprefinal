import React from 'react';

interface CardProps {
  title: string;
  value: string | number;
  // FIX: Changed icon prop type to React.ReactElement for better type safety with cloneElement.
  icon: React.ReactElement;
  color: string;
}

const Card: React.FC<CardProps> = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-soft border border-neutral-200/50 flex items-center space-x-6 transition-all duration-300 hover:shadow-lifted hover:-translate-y-1">
      <div className={`p-4 rounded-full flex items-center justify-center ${color}`}>
        {React.cloneElement(icon, { className: "w-8 h-8" })}
      </div>
      <div>
        <p className="text-neutral-500 font-medium">{title}</p>
        <p className="text-3xl font-bold text-neutral-900">{value}</p>
      </div>
    </div>
  );
};

export default Card;