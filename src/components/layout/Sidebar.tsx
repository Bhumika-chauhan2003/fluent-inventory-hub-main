import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslationWrapper';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  FileText,
  Receipt,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Menu,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { Button } from '@/components/ui/button';
import logo from '../../assets/images/logo.png';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { logout } = useStore();

  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const navItems = [
    { path: '/', icon: <LayoutDashboard size={20} />, label: t('nav.dashboard') },
    {
      icon: <Package size={20} />,
      label: t('nav.masterForm'),
      key: 'master-form',
      children: [
        { path: '/Masterform/CustomerMaster', label: t('nav.customer') },
        { path: '/Masterform/CategoryMaster', label: t('nav.categories') },
        { path: '/Masterform/SupplierMaster', label: t('nav.supplier') },
        { path: '/Masterform/WarehouseMaster', label: t('nav.Warehouse') },
        { path: '/Masterform/UnitMaster', label: t('nav.unitMaster') },
      ],
    },
    { path: '/inventory', icon: <Package size={20} />, label: t('nav.inventory') },
  { path: '/add-product', icon: <PlusCircle size={20} />, label: t('nav.addProduct') },
  { path: '/billing', icon: <Receipt size={20} />, label: t('nav.billing') },
  { path: '/invoices', icon: <FileText size={20} />, label: t('nav.invoices') },
  { path: '/reports', icon: <BarChart3 size={20} />, label: t('nav.reports') },
  { path: '/settings', icon: <Settings size={20} />, label: t('nav.settings') },
  ];

  const toggleSubmenu = (key: string) => {
    setOpenSubmenu((prev) => (prev === key ? null : key));
  };

  return (
    <>
      {isOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-40 bg-black bg-opacity-30 md:hidden"
        />
      )}

      <Button
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-50 bg-white shadow-md"
        size="icon"
        variant="outline"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out',
          isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64',
          'md:translate-x-0',
          isOpen ? 'md:w-64' : 'md:w-16'
        )}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            {isOpen ? (
              <>
                <img src={logo} alt="Logo" className="h-[82px] w-[52%] ml-[8px]" />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  className="hidden md:flex"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <div className="w-full flex justify-center items-center relative">
                <span className="font-bold text-2xl text-inventory-primary">SA</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  className="absolute top-1 right-1 hidden md:flex"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4 px-2 overflow-y-auto">
            <ul className="space-y-1">
              {navItems.map((item, index) => {
                if ('children' in item) {
                  const isOpenSub = openSubmenu === item.key;
                  return (
                    <li key={item.key}>
                      <button
                        onClick={() => toggleSubmenu(item.key!)}
                        className={cn(
                          'w-full flex items-center p-2 rounded-lg transition-colors duration-200',
                          isOpenSub
                            ? 'bg-inventory-primary text-white'
                            : 'text-gray-700 hover:bg-inventory-light',
                          !isOpen && 'justify-center'
                        )}
                      >
                        <span className={cn('flex-shrink-0', !isOpen && 'mx-auto')}>
                          {item.icon}
                        </span>
                        {isOpen && (
                          <>
                            <span className="ml-3  text-sm">{item.label}</span>
                            {isOpenSub ? (
                              <ChevronUp className="w-4 h-4 flex-[10] ml-[85px]" />
                            ) : (
                              <ChevronDown className="w-4 h-4 flex-[10] ml-[85px]" />
                            )}
                          </>
                        )}
                      </button>

                      {/* Submenu Items */}
                      {isOpenSub && isOpen && (
                        <ul className="pl-10 mt-1 space-y-1">
                          {item.children.map((sub) => (
                            <li key={sub.path}>
                              <Link
                                to={sub.path}
                                className={cn(
                                  'block p-2 text-sm rounded-lg',
                                  location.pathname === sub.path
                                    ? 'bg-inventory-primary text-white'
                                    : 'text-gray-700 hover:bg-inventory-light'
                                )}
                              >
                                {sub.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                }

                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={cn(
                        'flex items-center p-2 rounded-lg transition-colors duration-200 group',
                        location.pathname === item.path
                          ? 'bg-inventory-primary text-white'
                          : 'text-gray-700 hover:bg-inventory-light',
                        !isOpen && 'justify-center'
                      )}
                    >
                      <span className={cn('flex-shrink-0', !isOpen && 'mx-auto')}>
                        {item.icon}
                      </span>
                      {isOpen && (
                        <span className="ml-3 text-sm whitespace-nowrap">
                          {item.label}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
