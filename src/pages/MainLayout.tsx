import React from 'react';
import { Link } from 'react-router-dom';

interface MainLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, onLogout }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-gray-800 text-white p-4 flex justify-between">
        <h1 className="text-xl">My Inventory App</h1>
        <button onClick={onLogout} className="bg-red-500 px-4 py-2 rounded-md">
          Logout
        </button>
      </header>
      <main className="flex-grow p-6 bg-gray-100">{children}</main>
      <footer className="bg-gray-800 text-white p-4 text-center">
        © 2025 My Inventory App
      </footer>
    </div>
  );
};

export default MainLayout;
