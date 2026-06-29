import React, { useState } from 'react';
import AdminHeader from '../components/AdminHeader';
import AdminFormField from '../components/AdminFormField';
import { Save, CheckCircle, AlertCircle } from 'lucide-react';

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form states
  const [shopName, setShopName] = useState('The Tile Store Atelier');
  const [contactEmail, setContactEmail] = useState('concierge@thetilestore.com');
  const [contactPhone, setContactPhone] = useState('+91 98765 43210');
  const [address, setAddress] = useState('Atelier Mansion, MG Road, Bangalore, India');
  const [whatsappPhone, setWhatsappPhone] = useState('919876543210');
  const [whatsappText, setWhatsappText] = useState('Hello, I would like to inquire about premium surfaces for my architecture project.');

  const [instagram, setInstagram] = useState('https://instagram.com/thetilestore');
  const [linkedin, setLinkedin] = useState('https://linkedin.com/company/thetilestore');
  const [pinterest, setPinterest] = useState('https://pinterest.com/thetilestore');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    // Save configurations locally (since settings are usually stored in a app_config table, or simulated offline here)
    setTimeout(() => {
      setSaving(false);
      setSuccess(true);
    }, 800);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <AdminHeader title="Platform Global Settings" breadcrumb={['Settings', 'Configuration']}>
        <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
          <Save size={16} />
          {saving ? 'Saving changes...' : 'Save Settings'}
        </button>
      </AdminHeader>

      <main className="admin-content">
        {success && (
          <div className="admin-alert success">
            <CheckCircle size={16} />
            <span>Global configurations updated successfully.</span>
          </div>
        )}

        <div className="admin-grid-2">
          {/* Business identity configurations */}
          <div className="admin-card">
            <div className="admin-card-header">
              <div className="admin-card-title">Business Profile & Identity</div>
            </div>
            <div className="admin-card-body">
              <AdminFormField label="Store / Platform Title" required>
                <input
                  type="text"
                  className="admin-input"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  required
                />
              </AdminFormField>

              <div className="admin-grid-2">
                <AdminFormField label="Contact Email" required>
                  <input
                    type="email"
                    className="admin-input"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    required
                  />
                </AdminFormField>

                <AdminFormField label="Contact Support Hotline" required>
                  <input
                    type="text"
                    className="admin-input"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    required
                  />
                </AdminFormField>
              </div>

              <AdminFormField label="Main Showroom Address">
                <textarea
                  className="admin-textarea"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  style={{ minHeight: '80px' }}
                />
              </AdminFormField>
            </div>
          </div>

          {/* Social Channels and Integrations */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* WhatsApp CTA configurations */}
            <div className="admin-card">
              <div className="admin-card-header">
                <div className="admin-card-title">WhatsApp Chat Gateway</div>
              </div>
              <div className="admin-card-body">
                <AdminFormField label="WhatsApp Phone Number (with country code)" required>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="e.g. 919876543210"
                    value={whatsappPhone}
                    onChange={(e) => setWhatsappPhone(e.target.value)}
                    required
                  />
                </AdminFormField>

                <AdminFormField label="Default Pre-filled Callback message">
                  <textarea
                    className="admin-textarea"
                    value={whatsappText}
                    onChange={(e) => setWhatsappText(e.target.value)}
                    style={{ minHeight: '60px' }}
                  />
                </AdminFormField>
              </div>
            </div>

            {/* Social channels */}
            <div className="admin-card">
              <div className="admin-card-header">
                <div className="admin-card-title">Social Platform Handles</div>
              </div>
              <div className="admin-card-body">
                <AdminFormField label="Instagram Brand Feed URL">
                  <input
                    type="url"
                    className="admin-input"
                    placeholder="https://instagram.com/..."
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                  />
                </AdminFormField>

                <div className="admin-grid-2">
                  <AdminFormField label="Pinterest Profile">
                    <input
                      type="url"
                      className="admin-input"
                      placeholder="https://pinterest.com/..."
                      value={pinterest}
                      onChange={(e) => setPinterest(e.target.value)}
                    />
                  </AdminFormField>
                  <AdminFormField label="LinkedIn Page">
                    <input
                      type="url"
                      className="admin-input"
                      placeholder="https://linkedin.com/..."
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                    />
                  </AdminFormField>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </form>
  );
}
