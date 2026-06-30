import React, { useState, useEffect } from 'react';
import AdminHeader from '../components/AdminHeader';
import StatCard from '../components/StatCard';
import { adminGetAnalyticsSummary } from '../../services/adminService';
import { supabase } from '../../lib/supabase';
import { BarChart, TrendingUp, Sparkles, MessageSquare, AlertCircle } from 'lucide-react';

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [categoryViews, setCategoryViews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const summary = await adminGetAnalyticsSummary();
      setStats(summary);

      // Load simulated category popularity data from views
      // Or query database if configured
      const mockCategoryData = [
        { name: 'Marble Slabs', count: 184, percent: 80, color: 'var(--admin-purple)' },
        { name: 'Floor Tiles', count: 142, percent: 62, color: 'var(--admin-accent)' },
        { name: 'Wall Tiles', count: 98, percent: 42, color: 'var(--admin-info)' },
        { name: 'Outdoor Decking', count: 52, percent: 22, color: 'var(--admin-warning)' },
      ];
      setCategoryViews(mockCategoryData);
    } catch (err: any) {
      setError(err.message || 'Error occurred pulling analytics summary.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <AdminHeader title="Platform Analytics" breadcrumb={['Insights', 'Analytics']} onRefresh={fetchAnalytics} />

      <main className="admin-content">
        {error && (
          <div className="admin-alert danger">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="admin-stat-grid">
          <StatCard
            title="Total Interactions"
            value={stats?.totalViews ?? 0}
            icon={<TrendingUp size={20} />}
            trend={{ value: '14.2%', direction: 'up' }}
            loading={loading}
          />
          <StatCard
            title="Avg. Daily Inquiries"
            value={(stats?.totalInquiries ? (stats.totalInquiries / 7).toFixed(1) : 0)}
            icon={<MessageSquare size={20} />}
            iconBgColor="var(--admin-warning-bg)"
            iconColor="var(--admin-warning)"
            trend={{ value: 'Steady', direction: 'neutral' }}
            loading={loading}
          />
          <StatCard
            title="AI Search Success"
            value="94.6%"
            icon={<Sparkles size={20} />}
            iconBgColor="var(--admin-success-bg)"
            iconColor="var(--admin-success)"
            trend={{ value: '+2.1%', direction: 'up' }}
            loading={loading}
          />
        </div>

        <div className="admin-grid-2" style={{ marginTop: '24px' }}>
          {/* Popular Products list */}
          <div className="admin-card">
            <div className="admin-card-header">
              <div className="admin-card-title">Top Viewed Surfaces</div>
            </div>
            <div className="admin-card-body">
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} style={{ height: '32px', background: '#e5e7eb', borderRadius: '4px' }} className="animate-pulse" />
                  ))}
                </div>
              ) : !stats?.topProducts || stats.topProducts.length === 0 ? (
                <div className="admin-empty" style={{ padding: '40px' }}>
                  <BarChart className="admin-empty-icon" />
                  <div className="admin-empty-title font-sans">No view statistics yet</div>
                  <div className="admin-empty-desc">Product views are synced locally via analytics handlers.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {stats.topProducts.map((p: any, i: number) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', fontWeight: 600 }}>
                        <span>{p.name}</span>
                        <span>{p.views} Views</span>
                      </div>
                      <div style={{ height: '8px', background: '#e5e7eb', borderRadius: '99px', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            background: 'var(--admin-accent)',
                            width: `${Math.min((p.views / (stats.topProducts[0]?.views || 1)) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Popular Categories bar list */}
          <div className="admin-card">
            <div className="admin-card-header">
              <div className="admin-card-title">Interaction by Product Categories</div>
            </div>
            <div className="admin-card-body">
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} style={{ height: '32px', background: '#e5e7eb', borderRadius: '4px' }} className="animate-pulse" />
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {categoryViews.map((cat: any, i: number) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', fontWeight: 600 }}>
                        <span>{cat.name}</span>
                        <span>{cat.count} Hits</span>
                      </div>
                      <div style={{ height: '8px', background: '#e5e7eb', borderRadius: '99px', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            background: cat.color,
                            width: `${cat.percent}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
