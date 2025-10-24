import React from 'react';
import { NavLink } from 'react-router-dom';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  navItems: NavItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ navItems }) => {
  return (
    <aside className="w-64 bg-slate-900 text-slate-200 p-4 flex flex-col h-screen sticky top-0">
      <div className="mb-8 text-center p-4 border-b border-slate-700/50">
        <h2 className="text-2xl font-bold text-white tracking-wide">Portal Menu</h2>
      </div>
      <nav>
        <ul>
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end
                className={({ isActive }) =>
                  `flex items-center space-x-4 p-3 my-1 rounded-lg transition-all duration-200 font-semibold ${
                    isActive 
                      ? "bg-primary-500 text-white shadow-lg shadow-primary-500/20" 
                      : "text-slate-400 hover:bg-slate-700/50 hover:text-white"
                  }`
                }
              >
                {/* FIX: Cast icon to a ReactElement that accepts className to resolve TypeScript error. */}
                {React.cloneElement(item.icon as React.ReactElement<{ className: string }>, { className: "w-6 h-6" })}
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
