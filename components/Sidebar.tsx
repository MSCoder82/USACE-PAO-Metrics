

import React, { useEffect, useState } from 'react';
import { NavItem, View } from '../types';
import { UsaceLogoIcon, XMarkIcon } from './Icons';

interface SidebarProps {
  navigationItems: NavItem[];
  activeView: View;
  setActiveView: (view: View) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ navigationItems, activeView, setActiveView, isOpen = true, onClose }) => {
  const [isHovered, setIsHovered] = useState(false);

  const isExpanded = isOpen || isHovered;

  useEffect(() => {
    if (!isOpen) {
      setIsHovered(false);
    }
  }, [isOpen]);

  const handleNavigate = (view: View) => {
    setActiveView(view);
    if (onClose) {
      onClose();
    }
  };

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group/sidebar fixed inset-y-0 left-0 z-40 flex w-72 transform flex-col bg-gradient-to-br from-navy-950/95 via-navy-900/95 to-usace-blue/90 text-white shadow-[0_24px_60px_-30px_rgba(15,23,42,0.75)] backdrop-blur-2xl transition-all duration-300 ease-in-out lg:static lg:z-auto lg:flex-shrink-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } ${isExpanded ? 'lg:w-72 lg:shadow-[0_24px_60px_-30px_rgba(15,23,42,0.75)]' : 'lg:w-20 lg:shadow-[0_18px_45px_-28px_rgba(15,23,42,0.7)]'}`}
    >
      <div className={`relative flex h-20 items-center justify-center border-b border-white/10 px-6 transition-all duration-200 ${
        isExpanded ? '' : 'lg:px-0'
      }`}>
        <div
          className={`flex items-center gap-3 transition-all duration-200 ${
            isExpanded ? '' : 'lg:flex-col lg:gap-1'
          }`}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-usace-red">
            <UsaceLogoIcon className="h-7 w-7" />
          </span>
          <div
            className={`origin-left transition-all duration-200 ${
              isExpanded ? 'scale-100 opacity-100' : 'scale-90 opacity-0 lg:hidden'
            }`}
            aria-hidden={!isExpanded}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/70">USACE</p>
            <span className="text-lg font-semibold tracking-tight">PAO Metrics</span>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-white/10 p-2 text-white/70 transition hover:-translate-y-0.5 hover:bg-white/20 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white lg:hidden"
            aria-label="Close navigation"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>
      <nav
        className={`flex-1 space-y-2 overflow-y-auto px-5 py-8 transition-[padding] duration-200 subtle-scrollbar ${
          isExpanded ? '' : 'lg:px-3 lg:py-6'
        }`}
      >
        {navigationItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              aria-label={item.label}
              className={`group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-white text-navy-900 shadow-lg shadow-black/20'
                  : 'bg-white/5 text-white/70 hover:-translate-y-0.5 hover:bg-white/10 hover:text-white'
              } ${
                isExpanded ? '' : 'lg:justify-center lg:px-2'
              }`}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-2xl border ${
                  isActive
                    ? 'border-transparent bg-gradient-to-br from-usace-red to-usace-blue text-white'
                    : 'border-white/10 bg-white/10 text-white/70 group-hover:text-white'
                }`}
              >
                <item.icon className="h-5 w-5" />
              </span>
              <span
                className={`whitespace-nowrap text-left transition-all duration-200 ${
                  isExpanded ? 'max-w-xs opacity-100' : 'max-w-0 opacity-0 lg:hidden'
                }`}
                aria-hidden={!isExpanded}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
      <div
        className={`border-t border-white/10 p-6 transition-[padding] duration-200 ${
          isExpanded ? '' : 'lg:px-0'
        }`}
      >
        <p
          className={`text-center text-[11px] uppercase tracking-[0.4em] text-white/60 transition-opacity duration-200 ${
            isExpanded ? 'opacity-100' : 'opacity-0 lg:hidden'
          }`}
          aria-hidden={!isExpanded}
        >
          &copy; 2024 USACE PAO
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;