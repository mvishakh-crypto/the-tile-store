import React, { useState } from 'react';
import AdminSidebar from './components/AdminSidebar';
import AdminHeader from './components/AdminHeader';
import { Menu, X } from 'lucide-react';

interface AdminLayoutProps {
  activeRoute: string;
  onNavigate: (hash: string) => void;
  userEmail?: string;
  pendingInquiries?: number;
  pendingBookings?: number;
  children: React.ReactNode;
}

export default function AdminLayout({
  activeRoute,
  onNavigate,
  userEmail,
  pendingInquiries = 0,
  pendingBookings = 0,
  children,
}: AdminLayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="admin-root">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 45,
          }}
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <AdminSidebar
        activeRoute={activeRoute}
        onNavigate={(hash) => {
          setMobileSidebarOpen(false);
          onNavigate(hash);
        }}
        userEmail={userEmail}
        pendingInquiries={pendingInquiries}
        pendingBookings={pendingBookings}
        isOpen={mobileSidebarOpen}
      />

      {/* Main content viewport */}
      <div className="admin-main">
        {/* Mobile Header bar toggler */}
        <div
          className="md:hidden"
          style={{
            height: '50px',
            background: 'var(--admin-sidebar-bg)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--admin-sidebar-border)',
            position: 'sticky',
            top: 0,
            zIndex: 42,
          }}
        >
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            {mobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <span style={{ color: 'white', fontWeight: 700, fontSize: '13px', letterSpacing: '1px' }}>
            ADMIN
          </span>
          <div style={{ width: '20px' }} />
        </div>

        {/* Content body */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
