// App.tsx
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { StoreProvider } from './context/StoreContext';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import AddProduct from './pages/AddProduct';
import Billing from './pages/Billing';
import Invoices from './pages/Invoices';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import EditProduct from './pages/EditProduct';
import SingleUserAuthUI from './pages/SingleUserAuthUI';
import Logout from './pages/Logout';
import CategoryMaster from './pages/Masterform/CategoryMaster';
import SupplierMaster from './pages/Masterform/SupplierMaster';
import CustomerMaster from './pages/Masterform/CustomerMaster';
import WarehouseMaster from './pages/Masterform/WarehouseMaster';
import UnitMaster from './pages/Masterform/UnitMaster';
import './i18n';

import SessionGuard from './components/common/SessionGuard';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <StoreProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<SingleUserAuthUI />} />
              <Route path="/logout" element={<Logout />} />

              <Route path="/" element={
                <SessionGuard>
                  <MainLayout><Dashboard /></MainLayout>
                </SessionGuard>
              } />
              <Route path="/inventory" element={
                <SessionGuard>
                  <MainLayout><Inventory /></MainLayout>
                </SessionGuard>
              } />
              <Route path="/add-product" element={
                <SessionGuard>
                  <MainLayout><AddProduct /></MainLayout>
                </SessionGuard>
              } />
              <Route path="/edit-product" element={
                <SessionGuard>
                  <MainLayout><EditProduct /></MainLayout>
                </SessionGuard>
              } />
              <Route path="/billing" element={
                <SessionGuard>
                  <MainLayout><Billing /></MainLayout>
                </SessionGuard>
              } />
              <Route path="/invoices" element={
                <SessionGuard>
                  <MainLayout><Invoices /></MainLayout>
                </SessionGuard>
              } />
              {/* <Route path="/reports" element={
                <SessionGuard>
                  <MainLayout><Reports /></MainLayout>
                </SessionGuard>
              } /> */}
              <Route path="/settings" element={
                <SessionGuard>
                  <MainLayout><Settings /></MainLayout>
                </SessionGuard>
              } />
              <Route path="/Masterform/CategoryMaster" element={
                <SessionGuard>
                  <MainLayout><CategoryMaster /></MainLayout>
                </SessionGuard>
              } />
              <Route path="/Masterform/SupplierMaster" element={
                <SessionGuard>
                  <MainLayout><SupplierMaster /></MainLayout>
                </SessionGuard>
              } />
              <Route path="/Masterform/CustomerMaster" element={
                <SessionGuard>
                  <MainLayout><CustomerMaster /></MainLayout>
                </SessionGuard>
              } />
              <Route path="/Masterform/WarehouseMaster" element={
                <SessionGuard>
                  <MainLayout><WarehouseMaster /></MainLayout>
                </SessionGuard>
              } />
              <Route path="/Masterform/UnitMaster" element={
                <SessionGuard>
                  <MainLayout><UnitMaster /></MainLayout>
                </SessionGuard>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </StoreProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
