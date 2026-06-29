// ============================================================
// Admin Header — Top bar with breadcrumb and actions
// ============================================================
import { ReactNode } from 'react';
import { Bell, RefreshCw } from 'lucide-react';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: string[];
  children?: ReactNode;
  onRefresh?: () => void;
}

export default function AdminHeader({ title, subtitle, breadcrumb, children, onRefresh }: AdminHeaderProps) {
  return (
    <header className="admin-header">
      <div style={{ flex: 1 }}>
        {breadcrumb && breadcrumb.length > 0 && (
          <div className="admin-header-breadcrumb" style={{ marginBottom: '2px' }}>
            <span>Admin</span>
            {breadcrumb.map((crumb, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="admin-header-breadcrumb-sep">/</span>
                <span style={{ color: i === breadcrumb.length - 1 ? '#374151' : undefined }}>{crumb}</span>
              </span>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="admin-header-title">{title}</div>
          {subtitle && (
            <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 400 }}>{subtitle}</span>
          )}
        </div>
      </div>

      <div className="admin-header-actions">
        {onRefresh && (
          <button className="admin-btn admin-btn-ghost admin-btn-icon" onClick={onRefresh} title="Refresh">
            <RefreshCw size={15} />
          </button>
        )}
        {children}
      </div>
    </header>
  );
}
