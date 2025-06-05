import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Upload, Tags, BarChart2, BrainCircuit, Menu, X, ChevronRight } from 'lucide-react';

interface SidebarProps {
  className?: string;
  isExpanded: boolean;
  onExpandChange: (expanded: boolean) => void;
}

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ className, isExpanded, onExpandChange }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile && !isExpanded) {
        onExpandChange(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isExpanded, onExpandChange]);

  const navItems: NavItem[] = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/data-upload', label: 'Data Upload', icon: <Upload size={20} /> },
    { path: '/sku-mapping', label: 'SKU Mapping', icon: <Tags size={20} /> },
    { path: '/analytics', label: 'Analytics', icon: <BarChart2 size={20} /> },
    { path: '/ai-query', label: 'AI Query', icon: <BrainCircuit size={20} /> },
  ];

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleMouseEnter = () => {
    if (!isMobile) {
      setIsHovered(true);
      onExpandChange(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setIsHovered(false);
      if (!isExpanded) {
        onExpandChange(false);
      }
    }
  };

  const sidebarWidth = isExpanded || isHovered ? 'w-64' : 'w-16';
  const transition = 'transition-all duration-300 ease-in-out';

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="lg:hidden fixed z-50 top-4 left-4 p-2 rounded-md bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-colors"
        onClick={toggleSidebar}
        aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed top-0 left-0 h-full z-40 bg-gray-900 ${sidebarWidth} ${transition} ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex flex-col h-full">
          <div className="p-4">
            <div className={`flex items-center ${isExpanded || isHovered ? 'justify-between' : 'justify-center'} mb-8`}>
              <div className="flex items-center space-x-3">
                <BarChart2 size={28} className="text-blue-400" />
                <span className={`text-white font-bold text-xl ${!isExpanded && !isHovered ? 'hidden' : 'block'} ${transition}`}>
                  WarehouseOS
                </span>
              </div>
              {!isMobile && (isExpanded || isHovered) && (
                <button
                  onClick={() => onExpandChange(!isExpanded)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <ChevronRight size={20} className={`transform ${isExpanded ? 'rotate-180' : ''} ${transition}`} />
                </button>
              )}
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    } ${isExpanded || isHovered ? 'justify-start' : 'justify-center'}`
                  }
                  onClick={() => isMobile && setIsOpen(false)}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  <span
                    className={`ml-3 whitespace-nowrap ${
                      !isExpanded && !isHovered ? 'hidden' : 'block'
                    } ${transition}`}
                  >
                    {item.label}
                  </span>
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="mt-auto p-4 border-t border-gray-800">
            <div className={`flex items-center ${isExpanded || isHovered ? 'justify-start space-x-3' : 'justify-center'}`}>
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                WH
              </div>
              <div className={`${!isExpanded && !isHovered ? 'hidden' : 'block'} ${transition}`}>
                <p className="text-sm font-medium text-white">Warehouse Admin</p>
                <p className="text-xs text-gray-400">admin@warehouse.com</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;