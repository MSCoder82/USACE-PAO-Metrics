

import React from 'react';
import { NavItem, View } from '../types';
import { UsaceLogoIcon } from './Icons';

interface SidebarProps {
  navigationItems: NavItem[];
  activeView: View;
  setActiveView: (view: View) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ navigationItems, activeView, setActiveView }) => {
  return (
    <aside className="w-64 flex-shrink-0 bg-usace-blue text-white flex flex-col">
      <div className="h-16 flex items-center justify-center p-4 border-b border-navy-600">
        <div className="flex items-center space-x-3">
          <UsaceLogoIcon className="h-8 w-8 text-usace-red" />
          <span className="font-bold text-lg tracking-wider">USACE</span>
        </div>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors duration-200 ${
              activeView === item.id
                ? 'bg-usace-red text-white'
                : 'text-navy-100 hover:bg-navy-700 hover:text-white'
            }`}
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.label}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-navy-600">
         <p className="text-xs text-center text-navy-300">&copy; 2024 USACE PAO</p>
      </div>
    </aside>
  );
};

export default Sidebar;