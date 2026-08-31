import React, { useState, useEffect } from 'react';
import AdminHeader from '../components/AdminHeader';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { adminGetAnalyticsSummary, adminGetInquiries } from '../../services/adminService';
import { Package, MessageSquare, Calendar, AlertCircle } from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (hash: string) => void;
}

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  const [stats, setStats] = useState<any>(null);
  const [recentInquiries, setRecentInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const statsRes = await adminGetAnalyticsSummary();
      setStats(statsRes);

      const inquiriesRes = await adminGetInquiries(undefined, 1, 5);
      setRecentInquiries(inquiriesRes.inquiries || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Refresh dashboard overview when local inquiries/bookings change
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'tts-local-inquiries' || e.key === 'tts-local-bookings') {
        fetchDashboardData();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <AdminHeader
        title="Dashboard Overview"
        subtitle="Luxury Commerce Operations Center"
        breadcrumb={['Dashboard']}
        onRefresh={fetchDashboardData}
      />

      <main className="admin-content">
        {error && (
          <div className="admin-alert danger">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Stats Section */}
        <section className="admin-stat-grid">
          <StatCard
            title="Total Products"
            value={stats?.totalProducts ?? 0}
            icon={<Package size={20} />}
            loading={loading}
          />
          <StatCard
            title="Inquiries"
            value={stats?.totalInquiries ?? 0}
            icon={<MessageSquare size={20} />}
            iconBgColor="var(--admin-warning-bg)"
            iconColor="var(--admin-warning)"
            trend={{ value: `${stats?.pendingInquiries ?? 0} Pending`, direction: 'neutral' }}
            loading={loading}
          />
          <StatCard
            title="Consultations"
            value={stats?.totalBookings ?? 0}
            icon={<Calendar size={20} />}
            iconBgColor="var(--admin-success-bg)"
            iconColor="var(--admin-success)"
            trend={{ value: `${stats?.pendingBookings ?? 0} Unscheduled`, direction: 'neutral' }}
            loading={loading}
          />
        </section>

        <div style={{ marginTop: '24px' }}>
          {/* Recent Inquiries Panel */}
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <div className="admin-card-title">Recent Inquiries</div>
                <div className="admin-card-subtitle font-sans">Latest customer inquiries</div>
              </div>
              <button
                className="admin-btn admin-btn-ghost admin-btn-sm"
                onClick={() => onNavigate('#/admin/inquiries')}
              >
                View all
              </button>
            </div>
            <div className="admin-card-body" style={{ padding: 0 }}>
              <DataTable<any>
                loading={loading}
                columns={[
                  {
                    key: 'name',
                    header: 'Customer',
                    render: (item: any) => (
                      <div>
                        <div style={{ fontWeight: 600 }}>{item.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--admin-text-secondary)' }}>{item.email}</div>
                      </div>
                    ),
                  },
                  {
                    key: 'status',
                    header: 'Status',
                    render: (item: any) => <StatusBadge status={item.status} />,
                  },
                  {
                    key: 'created_at',
                    header: 'Received',
                    render: (item: any) => new Date(item.created_at).toLocaleDateString(),
                  },
                ]}
                data={recentInquiries}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
