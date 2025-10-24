
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
    <aside className="w-64 bg-brand-blue-dark text-white p-4 flex flex-col h-screen sticky top-0">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold">Portal Menu</h2>
      </div>
      <nav>
        <ul>
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end
                className={({ isActive }) =>
                  `flex items-center space-x-3 p-3 my-2 rounded-lg transition-colors hover:bg-brand-blue-dark/50 ${
                    isActive ? "bg-brand-blue text-white" : ""
                  }`
                }
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
