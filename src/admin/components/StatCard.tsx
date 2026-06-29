import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: string | number;
    direction: 'up' | 'down' | 'neutral';
    label?: string;
  };
  iconBgColor?: string;
  iconColor?: string;
  loading?: boolean;
}

export default function StatCard({
  title,
  value,
  icon,
  trend,
  iconBgColor = 'var(--admin-accent-light)',
  iconColor = 'var(--admin-accent)',
  loading = false,
}: StatCardProps) {
  if (loading) {
    return (
      <div className="admin-stat-card">
        <div className="admin-stat-card-header">
          <div style={{ width: '80px', height: '16px', background: '#e5e7eb', borderRadius: '4px' }} className="animate-pulse" />
          <div style={{ width: '40px', height: '40px', background: '#e5e7eb', borderRadius: '8px' }} className="animate-pulse" />
        </div>
        <div style={{ width: '120px', height: '32px', background: '#e5e7eb', borderRadius: '4px', marginBottom: '8px' }} className="animate-pulse" />
        <div style={{ width: '150px', height: '14px', background: '#e5e7eb', borderRadius: '4px' }} className="animate-pulse" />
      </div>
    );
  }

  return (
    <div className="admin-stat-card">
      <div className="admin-stat-card-header">
        <span className="admin-stat-label">{title}</span>
        <div
          className="admin-stat-icon"
          style={{ backgroundColor: iconBgColor, color: iconColor }}
        >
          {icon}
        </div>
      </div>
      <div className="admin-stat-value">{value}</div>
      {trend && (
        <div className={`admin-stat-trend ${trend.direction}`}>
          {trend.direction === 'up' && <ArrowUpRight size={14} />}
          {trend.direction === 'down' && <ArrowDownRight size={14} />}
          {trend.direction === 'neutral' && <Minus size={14} />}
          <span>{trend.value}</span>
          {trend.label && (
            <span style={{ color: 'var(--admin-text-secondary)', fontWeight: 400, marginLeft: '2px' }}>
              {trend.label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
