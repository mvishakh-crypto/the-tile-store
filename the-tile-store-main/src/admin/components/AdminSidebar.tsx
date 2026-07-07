// ============================================================
// Admin Sidebar — Navigation component
// ============================================================
import { useState, ReactNode } from 'react';
import {
  LayoutDashboard, Package, Grid3X3, Boxes, MessageSquare, CalendarDays,
  Image, Brain, BarChart3, Settings, LogOut, ChevronRight,
  Layers, Store, ExternalLink
} from 'lucide-react';
import { signOut } from '../../hooks/useSupabaseAuth';

export interface AdminRoute {
  id: string;
  label: string;
  hash: string;
  icon: ReactNode;
  badge?: number;
}

const NAV_SECTIONS: { label: string; items: AdminRoute[] }[] = [
  {
    label: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', hash: '#/admin/dashboard', icon: <LayoutDashboard size={15} /> },
      { id: 'analytics', label: 'Analytics', hash: '#/admin/analytics', icon: <BarChart3 size={15} /> },
    ],
  },
  {
    label: 'Catalog',
    items: [
      { id: 'products', label: 'Products', hash: '#/admin/products', icon: <Package size={15} /> },
      { id: 'categories', label: 'Categories & Brands', hash: '#/admin/categories', icon: <Grid3X3 size={15} /> },
      { id: 'inventory', label: 'Inventory', hash: '#/admin/inventory', icon: <Boxes size={15} /> },
    ],
  },
  {
    label: 'Operations',
    items: [
      { id: 'inquiries', label: 'Inquiries', hash: '#/admin/inquiries', icon: <MessageSquare size={15} /> },
      { id: 'bookings', label: 'Bookings', hash: '#/admin/bookings', icon: <CalendarDays size={15} /> },
    ],
  },
  {
    label: 'Content',
    items: [
      { id: 'gallery', label: 'Gallery & Inspirations', hash: '#/admin/gallery', icon: <Image size={15} /> },
    ],
  },
  {
    label: 'AI & System',
    items: [
      { id: 'ai', label: 'AI Systems', hash: '#/admin/ai', icon: <Brain size={15} /> },
      { id: 'settings', label: 'Settings', hash: '#/admin/settings', icon: <Settings size={15} /> },
    ],
  },
];

interface AdminSidebarProps {
  activeRoute: string;
  onNavigate: (hash: string) => void;
  userEmail?: string;
  pendingInquiries?: number;
  pendingBookings?: number;
  isOpen?: boolean;
}

export default function AdminSidebar({ activeRoute, onNavigate, userEmail, pendingInquiries, pendingBookings, isOpen }: AdminSidebarProps) {
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    window.location.hash = '#/';
  };

  const getInitials = (email: string) => email.slice(0, 2).toUpperCase();

  const getBadge = (id: string): number | undefined => {
    if (id === 'inquiries' && pendingInquiries) return pendingInquiries;
    if (id === 'bookings' && pendingBookings) return pendingBookings;
    return undefined;
  };

  return (
    <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
      {/* Logo */}
      <div className="admin-sidebar-logo" style={{ cursor: 'pointer' }} onClick={() => onNavigate('#/admin/dashboard')}>
        <div className="admin-sidebar-logo-icon">
          <Layers size={16} color="white" />
        </div>
        <div className="admin-sidebar-logo-text">
          <span className="admin-sidebar-logo-title">The Tile Store</span>
          <span className="admin-sidebar-logo-sub">Admin Panel</span>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, paddingBottom: '12px' }}>
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="admin-nav-section">
            <div className="admin-nav-section-label">{section.label}</div>
            {section.items.map((item) => {
              const badge = getBadge(item.id);
              return (
                <button
                  key={item.id}
                  id={`admin-nav-${item.id}`}
                  className={`admin-nav-item ${activeRoute === item.id ? 'active' : ''}`}
                  onClick={() => onNavigate(item.hash)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {item.label}
                  {badge ? <span className="admin-nav-badge">{badge}</span> : null}
                </button>
              );
            })}
          </div>
        ))}

        <div className="admin-nav-section">
          <div className="admin-nav-section-label">Quick Links</div>
          <button
            className="admin-nav-item"
            onClick={() => { window.open('#/', '_blank'); }}
          >
            <span className="nav-icon"><Store size={15} /></span>
            View Live Site
            <ExternalLink size={11} style={{ marginLeft: 'auto', opacity: 0.5 }} />
          </button>
        </div>
      </nav>

      {/* Footer — User info + logout */}
      <div className="admin-sidebar-footer">
        <div className="admin-sidebar-user">
          <div className="admin-sidebar-avatar">
            {userEmail ? getInitials(userEmail) : 'AD'}
          </div>
          <div className="admin-sidebar-user-info">
            <div className="admin-sidebar-user-name">{userEmail || 'Admin'}</div>
            <div className="admin-sidebar-user-role">Administrator</div>
          </div>
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            title="Sign out"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#6b7280', padding: '4px', borderRadius: '4px',
              display: 'flex', alignItems: 'center', transition: 'color 0.15s'
            }}
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
