import React, { useState, useEffect } from 'react';
import AdminHeader from '../components/AdminHeader';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import AdminFormField from '../components/AdminFormField';
import { adminGetInquiries, adminUpdateInquiryStatus, adminDeleteInquiry } from '../../services/adminService';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { X, Eye, Phone, Mail, Building, AlertCircle, Trash2 } from 'lucide-react';
import { queryClient } from '../../lib/queryClient';

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const fetchInquiries = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminGetInquiries(undefined, page, 15);
      setInquiries(res.inquiries || []);
      setTotalCount(res.total);
    } catch (err: any) {
      setError(err.message || 'Failed to load inquiries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'tts-local-inquiries') fetchInquiries();
    };
    window.addEventListener('storage', handleStorageChange);

    let channel: RealtimeChannel | null = null;
    if (isSupabaseConfigured) {
      channel = supabase
        .channel('admin-inquiries-rt')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'inquiries' }, () => {
          fetchInquiries();
        })
        .subscribe();
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (channel) supabase.removeChannel(channel);
    };
  }, [page]);

  const handleUpdateStatus = async (inquiryId: string, status: any) => {
    setStatusLoading(true);
    try {
      await adminUpdateInquiryStatus(inquiryId, status);
      setInquiries(inquiries.map((inq) => (inq.id === inquiryId ? { ...inq, status } : inq)));
      if (selectedInquiry && selectedInquiry.id === inquiryId) {
        setSelectedInquiry({ ...selectedInquiry, status });
      }
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
    } catch (e: any) {
      setError('Failed to update status.');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleDeleteInquiry = async (inquiryId: string) => {
    if (!window.confirm('Delete this inquiry? This cannot be undone.')) return;
    setDeleteLoading(inquiryId);
    try {
      await adminDeleteInquiry(inquiryId);
      setInquiries((prev) => prev.filter((inq) => inq.id !== inquiryId));
      setTotalCount((prev) => Math.max(0, prev - 1));
      if (selectedInquiry?.id === inquiryId) setSelectedInquiry(null);
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
    } catch (e: any) {
      setError('Failed to delete inquiry.');
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <AdminHeader title="Customer Inquiries" breadcrumb={['Operations', 'Inquiries']} onRefresh={fetchInquiries} />

      <main className="admin-content">
        {error && (
          <div className="admin-alert danger">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <DataTable<any>
          loading={loading}
          data={inquiries}
          getRowId={(inq) => inq.id}
          currentPage={page}
          totalPages={Math.ceil(totalCount / 15)}
          onPageChange={setPage}
          pageSize={15}
          totalCount={totalCount}
          columns={[
            {
              key: 'reference_number',
              header: 'Reference',
              render: (inq) => <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{inq.reference_number}</span>,
            },
            {
              key: 'name',
              header: 'Contact Info',
              render: (inq) => (
                <div>
                  <div style={{ fontWeight: 600 }}>{inq.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--admin-text-secondary)' }}>{inq.email} | {inq.phone}</div>
                </div>
              ),
            },
            {
              key: 'project_type',
              header: 'Project Type',
            },
            {
              key: 'status',
              header: 'Status',
              render: (inq) => <StatusBadge status={inq.status} />,
            },
            {
              key: 'created_at',
              header: 'Date Received',
              render: (inq) => new Date(inq.created_at).toLocaleString(),
            },
            {
              key: 'actions',
              header: '',
              render: (inq) => (
                <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                  <button
                    className="admin-btn admin-btn-ghost admin-btn-icon"
                    onClick={() => setSelectedInquiry(inq)}
                    title="View details"
                  >
                    <Eye size={13} />
                  </button>
                  <button
                    className="admin-btn admin-btn-ghost admin-btn-icon"
                    onClick={() => handleDeleteInquiry(inq.id)}
                    disabled={deleteLoading === inq.id}
                    title="Delete inquiry"
                    style={{ color: '#dc2626', opacity: deleteLoading === inq.id ? 0.5 : 1 }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ),
            },
          ]}
        />
      </main>

      {/* Inquiry Detail Drawer Overlay */}
      {selectedInquiry && (
        <div className="admin-modal-overlay" onClick={() => setSelectedInquiry(null)}>
          <div className="admin-modal admin-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <span className="admin-modal-title">Inquiry: {selectedInquiry.reference_number}</span>
              <button className="admin-modal-close" onClick={() => setSelectedInquiry(null)}>
                <X size={15} />
              </button>
            </div>

            <div className="admin-modal-body">
              <div className="admin-grid-2">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={14} /> <span>{selectedInquiry.phone}</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={14} /> <span>{selectedInquiry.email}</span></div>
                  {selectedInquiry.company && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Building size={14} /> <span>{selectedInquiry.company}</span></div>
                  )}
                </div>

                <AdminFormField label="Update Status">
                  <select
                    className="admin-select"
                    value={selectedInquiry.status}
                    onChange={(e) => handleUpdateStatus(selectedInquiry.id, e.target.value)}
                    disabled={statusLoading}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </AdminFormField>
              </div>

              {selectedInquiry.message && (
                <div style={{ marginTop: '16px', padding: '12px', background: 'var(--admin-bg)', borderRadius: 'var(--admin-radius)' }}>
                  <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>Client Message:</div>
                  <p style={{ fontSize: '13px', color: 'var(--admin-text-secondary)', margin: 0 }}>{selectedInquiry.message}</p>
                </div>
              )}

              {/* Inquiry Items List */}
              <div style={{ marginTop: '20px' }}>
                <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '10px' }}>Inquired Surfaces</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedInquiry.inquiry_items?.map((item: any, i: number) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        border: '1px solid var(--admin-border)',
                        borderRadius: 'var(--admin-radius)',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '13.5px' }}>{item.products?.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--admin-text-secondary)' }}>Code: {item.products?.code}</div>
                        {item.notes && <div style={{ fontSize: '11px', color: 'var(--admin-orange-text)', marginTop: '2px' }}>Note: {item.notes}</div>}
                      </div>
                      <div style={{ fontWeight: 700 }}>
                        {item.quantity} Qty
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
