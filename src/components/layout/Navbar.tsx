import React, { useEffect, useState } from 'react';
import { Menu, User, Bell, Search, LogOut } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslationWrapper';
import LanguageSwitcher from '../common/LanguageSwitcher';
import { useStore } from '@/context/StoreContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  toggleSidebar: () => void;
  sidebarOpen: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar, sidebarOpen }) => {
  const { t } = useTranslation();
  const { currentUser } = useStore();
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState<{ username?: string; expiring?: string }>({});

//   useEffect(() => {
//     const fetchUserInfo = async () => {
//       debugger;
//       try {
//         debugger;
//         const response = await fetch(
//           '/api/macros/s/AKfycbwnlAY2MKqe32I3-Uzjig-ZE5EFi3QHHbeYDSuGxNUDzjBdVD-nF2jA4LymT90O8fQe/exec',
//           {
//             method: 'POST',
//             headers: { 'Content-Type': 'acpplication/json' },
//             body: JSON.stringify({ action: 'getUserInfo' })
//           }
//         );

//         const data = await response.json();
// console.log('User Info:', data);
//         const formatDate = (isoDate: string) => {
//           const date = new Date(isoDate);
//           const day = String(date.getDate()).padStart(2, '0');
//           const month = String(date.getMonth() + 1).padStart(2, '0');
//           const year = date.getFullYear();
//           return `${day}-${month}-${year}`;
//         };

//         setUserInfo({
//           username: data.username,
//           expiring: data.expiring ? formatDate(data.expiring) : undefined,
//         });
//       } catch (error) {
//         console.error('Failed to fetch user info', error);
//       }
//     };

//     fetchUserInfo();
//   }, []);

useEffect(() => {
  const fetchUserInfo = async () => {
    try {
      const deviceId = localStorage.getItem("deviceId");

      if (!deviceId) {
        console.warn("Device ID not found");
        return;
      }

      const response = await fetch(
        `https://script.google.com/macros/s/AKfycbywEosCCMqxvbNns3yfyihObb7FucnS-Qnd2rsHeBhdoXX-nK63kjeK086593glYyVO/exec?device=${deviceId}`,
        {
          method: 'GET',
          // ❌ Do NOT include unnecessary headers unless required
          // headers: { 'Content-Type': 'application/json' },
        }
      );

      const data = await response.json();
      console.log('User Info:', data);

      const formatDate = (isoDate: string) => {
        const date = new Date(isoDate);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      };

      setUserInfo({
        username: data.username,
        expiring: data.expiring ? formatDate(data.expiring) : undefined,
      });
    } catch (error) {
      console.error('Failed to fetch user info', error);
    }
  };

  fetchUserInfo();
}, []);


  const handleLogout = () => {
    const keysToRemove = [
      'invoices', 'language', 'loglevel', 'products', 'suppliers',
      'units', 'users', 'warehouses'
    ];
    keysToRemove.forEach(key => localStorage.removeItem(key));
    navigate('/login');
  };


  return (
    <header
      className="fixed top-0 right-0 left-0 bg-white border-b border-gray-200 z-30 transition-all duration-300 ease-in-out"
      style={{ left: sidebarOpen ? '16rem' : '4rem' }}
    >
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-4 md:hidden">
            <Menu className="h-6 w-6" />
          </Button>

        

          <div className="relative hidden md:flex w-96">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder={t('common.search')}
              className="pl-8 bg-gray-50 border-gray-200"
            />
          </div>
        </div>
<div className="text-sm font-medium mr-6 hidden sm:block text-gray-700 ml-auto">
            ⏳ {userInfo.expiring || '...'}
          </div>
        <div className="flex items-center space-x-4">
          <LanguageSwitcher />

          {/* <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </Button> */}

          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-inventory-primary text-white flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
            <span className="hidden md:inline-block font-medium">
          {userInfo.username?.split('@')[0].trim() || "User"}

            </span>
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
