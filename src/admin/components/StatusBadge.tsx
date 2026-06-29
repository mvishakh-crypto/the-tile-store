import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  let badgeClass = 'neutral';
  let label = status;

  switch (status.toLowerCase().replace('_', '')) {
    case 'pending':
    case 'new':
      badgeClass = 'warning';
      label = 'Pending';
      break;
    case 'contacted':
    case 'inprogress':
    case 'pendingquote':
    case 'quoted':
      badgeClass = 'info';
      label = status === 'in_progress' ? 'In Progress' : 'Contacted';
      break;
    case 'completed':
    case 'confirmed':
    case 'approved':
    case 'converted':
      badgeClass = 'success';
      label = status.charAt(0).toUpperCase() + status.slice(1);
      break;
    case 'cancelled':
    case 'rejected':
    case 'lost':
    case 'closed':
      badgeClass = 'danger';
      label = status.charAt(0).toUpperCase() + status.slice(1);
      break;
  }

  return (
    <span className={`admin-badge ${badgeClass}`}>
      <span className="admin-badge-dot" />
      {label}
    </span>
  );
}
