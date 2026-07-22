import React, { useState, useEffect } from 'react';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import AdminLogin from './AdminLogin';
import AdminLayout from './AdminLayout';
import { adminGetInquiries, adminGetBookings } from '../services/adminService';

// Subpage imports
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import ProductFormPage from './pages/ProductFormPage';
import CategoriesPage from './pages/CategoriesPage';
import InventoryPage from './pages/InventoryPage';
import InquiriesPage from './pages/InquiriesPage';
import BookingsPage from './pages/BookingsPage';
import GalleryPage from './pages/GalleryPage';
import AIPage from './pages/AIPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SEOPage from './pages/SEOPage';
import SettingsPage from './pages/SettingsPage';

export default function AdminApp() {
  const { user, isLoading: authLoading, isAuthenticated } = useSupabaseAuth();

  // Router hash parsing
  const [adminRoute, setAdminRoute] = useState('dashboard');
  const [productIdParam, setProductIdParam] = useState<string | null>(null);

  // Stats badge states
  const [pendingInquiries, setPendingInquiries] = useState(0);
  const [pendingBookings, setPendingBookings] = useState(0);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '#/admin/dashboard';
      if (hash.startsWith('#/admin/products/new')) {
        setAdminRoute('product-new');
        setProductIdParam(null);
      } else if (hash.startsWith('#/admin/products/') && hash.endsWith('/edit')) {
        const parts = hash.split('/');
        const id = parts[parts.length - 2];
        setAdminRoute('product-edit');
        setProductIdParam(id);
      } else if (hash.startsWith('#/admin/')) {
        const sub = hash.replace('#/admin/', '');
        setAdminRoute(sub);
        setProductIdParam(null);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Poll notifications + listen for immediate storage-event updates
  useEffect(() => {
    const fetchCounters = async () => {
      try {
        const { inquiries } = await adminGetInquiries('pending', 1, 100);
        const { bookings } = await adminGetBookings('pending', 1, 100);
        setPendingInquiries(inquiries?.length || 0);
        setPendingBookings(bookings?.length || 0);
      } catch (e) {
        // Safe fail
      }
    };
    fetchCounters();
    const interval = setInterval(fetchCounters, 15000); // 15s polling

    // Immediate update when inquiry/booking saved in mock mode
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'tts-local-inquiries' || e.key === 'tts-local-bookings') {
        fetchCounters();
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorage);
    };
  }, [isAuthenticated]);

  const handleNavigate = (hash: string) => {
    window.location.hash = hash;
  };

  const handleLoginSuccess = () => {
    window.location.hash = '#/admin/dashboard';
  };

  if (authLoading) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>
        <div className="admin-spinner admin-spinner-lg" />
      </div>
    );
  }

  // Gate controls access
  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  const userEmail = user?.email || 'admin@thetilestore.com';

  const renderContent = () => {
    switch (adminRoute) {
      case 'dashboard':
        return <DashboardPage onNavigate={handleNavigate} />;
      case 'products':
        return <ProductsPage onNavigate={handleNavigate} />;
      case 'product-new':
        return <ProductFormPage onNavigate={handleNavigate} />;
      case 'product-edit':
        return <ProductFormPage onNavigate={handleNavigate} productId={productIdParam || undefined} />;
      case 'categories':
        return <CategoriesPage />;
      case 'inventory':
        return <InventoryPage />;
      case 'inquiries':
        return <InquiriesPage />;
      case 'bookings':
        return <BookingsPage />;
      case 'gallery':
        return <GalleryPage />;
      case 'ai':
        return <AIPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'seo':
        return <SEOPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage onNavigate={handleNavigate} />;
    }
  };

  // Maps top level route name to highlights
  const layoutRoute = adminRoute.startsWith('product-') ? 'products' : adminRoute;

  return (
    <AdminLayout
      activeRoute={layoutRoute}
      onNavigate={handleNavigate}
      userEmail={userEmail}
      pendingInquiries={pendingInquiries}
      pendingBookings={pendingBookings}
    >
      {renderContent()}
    </AdminLayout>
  );
}
