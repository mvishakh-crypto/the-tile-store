import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  loading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal" style={{ maxWidth: '400px' }}>
        <div className="admin-modal-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--admin-danger-text)' }}>
            <AlertTriangle size={18} />
            <span className="admin-modal-title" style={{ fontSize: '15px' }}>{title}</span>
          </div>
          <button className="admin-modal-close" onClick={onClose} disabled={loading}>
            <X size={15} />
          </button>
        </div>
        
        <div className="admin-modal-body" style={{ fontSize: '13.5px', color: 'var(--admin-text-secondary)', paddingBottom: '8px' }}>
          {message}
        </div>

        <div className="admin-modal-footer" style={{ borderTop: 'none', paddingTop: 0 }}>
          <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={onClose} disabled={loading}>
            {cancelText}
          </button>
          <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={onConfirm} disabled={loading}>
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
