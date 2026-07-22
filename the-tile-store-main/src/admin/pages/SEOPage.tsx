import { useState, useEffect } from 'react';
import AdminHeader from '../components/AdminHeader';
import AdminFormField from '../components/AdminFormField';
import { Save, CheckCircle, AlertCircle, Search } from 'lucide-react';
import { getAllSEOSettings, adminUpdateSEOSettings, SEOPageKey } from '../../services/seoService';

interface PageFormState {
  title: string;
  description: string;
  ogImageUrl: string;
}

const PAGE_SECTIONS: { key: SEOPageKey; label: string; hint: string }[] = [
  { key: 'global', label: 'Site-Wide Defaults', hint: 'Used as the fallback for any page without its own title/description below, and as the default social-share image.' },
  { key: 'home', label: 'Home Page', hint: 'Shown in search results and social shares for thetilestore.in/#/' },
  { key: 'collections', label: 'Collections Page', hint: 'Shown for thetilestore.in/#/collections' },
  { key: 'calculator', label: 'Calculator Page', hint: 'Shown for thetilestore.in/#/calculator' },
  { key: 'partners', label: 'Partners / Trade Portal Page', hint: 'Shown for thetilestore.in/#/partners' },
];

const emptyForm: PageFormState = { title: '', description: '', ogImageUrl: '' };

export default function SEOPage() {
  const [forms, setForms] = useState<Record<SEOPageKey, PageFormState>>({
    global: emptyForm, home: emptyForm, collections: emptyForm, calculator: emptyForm, partners: emptyForm,
  });
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<SEOPageKey | null>(null);
  const [successKey, setSuccessKey] = useState<SEOPageKey | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const settings = await getAllSEOSettings();
      setForms((prev) => {
        const next = { ...prev };
        for (const { key } of PAGE_SECTIONS) {
          const s = settings[key];
          next[key] = s
            ? { title: s.title || '', description: s.description || '', ogImageUrl: s.ogImageUrl || '' }
            : emptyForm;
        }
        return next;
      });
    } catch (err: any) {
      setError(err.message || 'Could not load SEO settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateField = (key: SEOPageKey, field: keyof PageFormState, value: string) => {
    setForms((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  };

  const handleSave = async (key: SEOPageKey) => {
    setSavingKey(key);
    setSuccessKey(null);
    setError(null);
    try {
      await adminUpdateSEOSettings(key, {
        title: forms[key].title,
        description: forms[key].description,
        ogImageUrl: forms[key].ogImageUrl || null,
      });
      setSuccessKey(key);
      setTimeout(() => setSuccessKey((k) => (k === key ? null : k)), 3000);
    } catch (err: any) {
      setError(err.message || 'Could not save SEO settings.');
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <AdminHeader title="SEO Settings" breadcrumb={['Insights', 'SEO']} onRefresh={load} />

      <main className="admin-content">
        {error && (
          <div className="admin-alert danger">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{ height: '160px', background: '#e5e7eb', borderRadius: '8px' }} className="animate-pulse" />
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {PAGE_SECTIONS.map(({ key, label, hint }) => (
              <div className="admin-card" key={key}>
                <div className="admin-card-header">
                  <div>
                    <div className="admin-card-title">{label}</div>
                    <div className="admin-card-subtitle">{hint}</div>
                  </div>
                  <button
                    type="button"
                    className="admin-btn admin-btn-primary admin-btn-sm"
                    disabled={savingKey === key}
                    onClick={() => handleSave(key)}
                  >
                    <Save size={14} />
                    {savingKey === key ? 'Saving...' : 'Save'}
                  </button>
                </div>
                <div className="admin-card-body">
                  {successKey === key && (
                    <div className="admin-alert success" style={{ marginBottom: '16px' }}>
                      <CheckCircle size={14} />
                      <span>Saved — live on the site immediately.</span>
                    </div>
                  )}

                  <AdminFormField label="Meta Title" required hint="Shown as the browser tab title and search result headline.">
                    <input
                      type="text"
                      className="admin-input"
                      value={forms[key].title}
                      onChange={(e) => updateField(key, 'title', e.target.value)}
                      required
                    />
                  </AdminFormField>

                  <AdminFormField label="Meta Description" required hint="Shown as the search result snippet. Keep it under ~160 characters.">
                    <textarea
                      className="admin-textarea"
                      style={{ minHeight: '70px' }}
                      value={forms[key].description}
                      onChange={(e) => updateField(key, 'description', e.target.value)}
                      required
                    />
                  </AdminFormField>

                  {key === 'global' && (
                    <AdminFormField label="Default Social Share Image (URL)" hint="Used when a page doesn't specify its own image (e.g. products use their own photo).">
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="https://..."
                        value={forms[key].ogImageUrl}
                        onChange={(e) => updateField(key, 'ogImageUrl', e.target.value)}
                      />
                    </AdminFormField>
                  )}
                </div>
              </div>
            ))}

            <div className="admin-alert info">
              <Search size={14} />
              <span>Changes here take effect on the next page load of the live site — no redeploy needed.</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
