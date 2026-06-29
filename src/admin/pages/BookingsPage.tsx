import React, { useState, useEffect } from 'react';
import AdminHeader from '../components/AdminHeader';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import AdminFormField from '../components/AdminFormField';
import { adminGetBookings, adminUpdateBookingStatus } from '../../services/adminService';
import { Mail, Phone, Calendar, Clock, Landmark, AlertCircle, X } from 'lucide-react';
import { queryClient } from '../../lib/queryClient';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminGetBookings(undefined, page, 15);
      setBookings(res.bookings || []);
      setTotalCount(res.total);
    } catch (err: any) {
      setError(err.message || 'Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'tts-local-bookings') {
        fetchBookings();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [page]);

  const handleUpdateStatus = async (bookingId: string, status: any) => {
    setStatusLoading(true);
    try {
      await adminUpdateBookingStatus(bookingId, status);
      setBookings(
        bookings.map((b) => (b.id === bookingId ? { ...b, status } : b))
      );
      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking({ ...selectedBooking, status });
      }
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    } catch (e: any) {
      setError('Failed to update status.');
    } finally {
      setStatusLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <AdminHeader title="Consultation Bookings" breadcrumb={['Operations', 'Bookings']} onRefresh={fetchBookings} />

      <main className="admin-content">
        {error && (
          <div className="admin-alert danger">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <DataTable<any>
          loading={loading}
          data={bookings}
          getRowId={(b) => b.id}
          currentPage={page}
          totalPages={Math.ceil(totalCount / 15)}
          onPageChange={setPage}
          pageSize={15}
          totalCount={totalCount}
          columns={[
            {
              key: 'name',
              header: 'Client Details',
              render: (b) => (
                <div>
                  <div style={{ fontWeight: 600 }}>{b.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--admin-text-secondary)' }}>{b.email} | {b.phone}</div>
                </div>
              ),
            },
            {
              key: 'booking_date',
              header: 'Schedule Time',
              render: (b) => (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                    <Calendar size={12} />
                    <span>{b.booking_date}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--admin-text-secondary)' }}>
                    <Clock size={12} />
                    <span>{b.booking_time}</span>
                  </div>
                </div>
              ),
            },
            {
              key: 'project_type',
              header: 'Project Scope',
            },
            {
              key: 'budget_range',
              header: 'Budget Bracket',
            },
            {
              key: 'status',
              header: 'Status',
              render: (b) => <StatusBadge status={b.status} />,
            },
            {
              key: 'actions',
              header: '',
              render: (b) => (
                <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                  <button
                    className="admin-btn admin-btn-ghost admin-btn-icon"
                    onClick={() => setSelectedBooking(b)}
                  >
                    View Info
                  </button>
                </div>
              ),
            },
          ]}
        />
      </main>

      {/* Booking Drawer overlay */}
      {selectedBooking && (
        <div className="admin-modal-overlay" onClick={() => setSelectedBooking(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <span className="admin-modal-title">Consultation Schedule Details</span>
              <button className="admin-modal-close" onClick={() => setSelectedBooking(null)}>
                <X size={15} />
              </button>
            </div>
            
            <div className="admin-modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label className="admin-form-label">Client Name</label>
                  <div style={{ fontWeight: 600, fontSize: '15px' }}>{selectedBooking.name}</div>
                </div>

                <div className="admin-grid-2">
                  <div>
                    <label className="admin-form-label">Phone</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}><Phone size={13} /> {selectedBooking.phone}</div>
                  </div>
                  <div>
                    <label className="admin-form-label">Email</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}><Mail size={13} /> {selectedBooking.email}</div>
                  </div>
                </div>

                <div className="admin-grid-2">
                  <div>
                    <label className="admin-form-label">Scheduled Date</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}><Calendar size={13} /> {selectedBooking.booking_date}</div>
                  </div>
                  <div>
                    <label className="admin-form-label">Time Window</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}><Clock size={13} /> {selectedBooking.booking_time}</div>
                  </div>
                </div>

                <div className="admin-grid-2">
                  <div>
                    <label className="admin-form-label">Project Type</label>
                    <div style={{ fontSize: '13px' }}>{selectedBooking.project_type || 'Residential'}</div>
                  </div>
                  <div>
                    <label className="admin-form-label">Budget range</label>
                    <div style={{ fontSize: '13px' }}>{selectedBooking.budget_range || 'Not specified'}</div>
                  </div>
                </div>

                {selectedBooking.location && (
                  <div>
                    <label className="admin-form-label">Location / Site Address</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}><Landmark size={13} /> {selectedBooking.location}</div>
                  </div>
                )}

                {selectedBooking.notes && (
                  <div>
                    <label className="admin-form-label">Consultation Objectives</label>
                    <div style={{ padding: '10px', background: 'var(--admin-bg)', borderRadius: 'var(--admin-radius)', fontSize: '13px' }}>
                      {selectedBooking.notes}
                    </div>
                  </div>
                )}

                <AdminFormField label="Booking status flag">
                  <select
                    className="admin-select"
                    value={selectedBooking.status}
                    onChange={(e) => handleUpdateStatus(selectedBooking.id, e.target.value)}
                    disabled={statusLoading}
                  >
                    <option value="pending">Pending Review</option>
                    <option value="confirmed">Confirmed / Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </AdminFormField>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
