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
    <aside className="w-64 bg-neutral-900 text-neutral-200 p-4 flex flex-col h-screen sticky top-0">
      <div className="mb-8 text-center p-4">
        <h2 className="text-2xl font-bold text-white">Portal Menu</h2>
      </div>
      <nav>
        <ul>
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end
                className={({ isActive }) =>
                  `flex items-center space-x-3 p-3 my-1 rounded-lg transition-all duration-200 font-semibold ${
                    isActive ? "bg-primary text-white shadow-lg" : "text-neutral-400 hover:bg-neutral-700/50 hover:text-white"
                  }`
                }
              >
                {item.icon}
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