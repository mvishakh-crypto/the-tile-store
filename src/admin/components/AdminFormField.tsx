import React from 'react';
import { AlertCircle } from 'lucide-react';

interface AdminFormFieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}

export default function AdminFormField({
  label,
  error,
  hint,
  required = false,
  children,
}: AdminFormFieldProps) {
  return (
    <div className="admin-form-group">
      <label className={`admin-form-label ${required ? 'required' : ''}`}>
        {label}
      </label>
      <div>{children}</div>
      {hint && <p className="admin-form-hint">{hint}</p>}
      {error && (
        <p className="admin-form-error">
          <AlertCircle size={12} />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
