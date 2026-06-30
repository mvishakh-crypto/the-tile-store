import React, { useState, useEffect } from 'react';
import AdminHeader from '../components/AdminHeader';
import DataTable from '../components/DataTable';
import AdminFormField from '../components/AdminFormField';
import {
  getCategories,
  getBrands,
  getLocalCategories,
  saveLocalCategories,
  getLocalBrands,
  saveLocalBrands,
} from '../../services/productService';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Plus, X, Globe, MapPin, Eye, Edit2, Trash2 } from 'lucide-react';
import { queryClient } from '../../lib/queryClient';

export default function CategoriesPage() {
  const [activeTab, setActiveTab] = useState<'categories' | 'brands'>('categories');
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [brandName, setBrandName] = useState('');
  const [brandSlug, setBrandSlug] = useState('');
  const [brandCountry, setBrandCountry] = useState('');
  const [brandWeb, setBrandWeb] = useState('');
  const [brandDesc, setBrandDesc] = useState('');
  
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, brandRes] = await Promise.all([getCategories(), getBrands()]);
      setCategories(catRes || []);
      setBrands(brandRes || []);
    } catch (e) {
      // Safe fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: catName,
      slug: catSlug || catName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: catDesc || null,
      sort_order: categories.length + 1,
    };

    if (!isSupabaseConfigured) {
      const stored = getLocalCategories();
      if (editId) {
        const updated = stored.map(c => c.id === editId ? { ...c, ...payload } : c);
        saveLocalCategories(updated);
      } else {
        const newCat = { id: `sim-cat-${Date.now()}`, ...payload };
        saveLocalCategories([...stored, newCat]);
      }
      setIsCatModalOpen(false);
      clearForm();
      fetchData();
      queryClient.invalidateQueries({ queryKey: ['products'] });
      return;
    }

    try {
      if (editId) {
        await (supabase.from('product_categories') as any).update(payload).eq('id', editId);
      } else {
        await (supabase.from('product_categories') as any).insert(payload);
      }
      setIsCatModalOpen(false);
      clearForm();
      fetchData();
      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (err) {
      alert('Error saving category');
    }
  };

  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: brandName,
      slug: brandSlug || brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      country: brandCountry || null,
      website: brandWeb || null,
      description: brandDesc || null,
      highlights: [],
    };

    if (!isSupabaseConfigured) {
      const stored = getLocalBrands();
      if (editId) {
        const updated = stored.map(b => b.id === editId ? { ...b, ...payload } : b);
        saveLocalBrands(updated);
      } else {
        const newBrand = { id: `sim-brand-${Date.now()}`, ...payload, image: '', highlights: [] };
        saveLocalBrands([...stored, newBrand]);
      }
      setIsBrandModalOpen(false);
      clearForm();
      fetchData();
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      return;
    }

    try {
      if (editId) {
        await (supabase.from('brands') as any).update(payload).eq('id', editId);
      } else {
        await (supabase.from('brands') as any).insert(payload);
      }
      setIsBrandModalOpen(false);
      clearForm();
      fetchData();
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (err) {
      alert('Error saving brand');
    }
  };

  const handleEditCategory = (cat: any) => {
    setEditId(cat.id);
    setCatName(cat.name);
    setCatSlug(cat.slug);
    setCatDesc(cat.description || '');
    setIsCatModalOpen(true);
  };

  const handleEditBrand = (b: any) => {
    setEditId(b.id);
    setBrandName(b.name);
    setBrandSlug(b.slug);
    setBrandCountry(b.country || '');
    setBrandWeb(b.website || '');
    setBrandDesc(b.description || '');
    setIsBrandModalOpen(true);
  };

  const handleDelete = async (table: string, id: string) => {
    if (!confirm('Are you sure you want to delete this metadata configuration? It may affect products linked to it.')) return;

    if (!isSupabaseConfigured) {
      if (table === 'product_categories') {
        const stored = getLocalCategories();
        saveLocalCategories(stored.filter(c => c.id !== id));
      } else if (table === 'brands') {
        const stored = getLocalBrands();
        saveLocalBrands(stored.filter(b => b.id !== id));
      }
      fetchData();
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      return;
    }

    try {
      await supabase.from(table).delete().eq('id', id);
      fetchData();
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (err) {
      alert('Failed to delete item');
    }
  };

  const clearForm = () => {
    setEditId(null);
    setCatName('');
    setCatSlug('');
    setCatDesc('');
    setBrandName('');
    setBrandSlug('');
    setBrandCountry('');
    setBrandWeb('');
    setBrandDesc('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <AdminHeader title="Metadata Settings" breadcrumb={['Catalog', 'Structure']}>
        {activeTab === 'categories' ? (
          <button className="admin-btn admin-btn-primary" onClick={() => { clearForm(); setIsCatModalOpen(true); }}>
            <Plus size={16} /> New Category
          </button>
        ) : (
          <button className="admin-btn admin-btn-primary" onClick={() => { clearForm(); setIsBrandModalOpen(true); }}>
            <Plus size={16} /> New Brand
          </button>
        )}
      </AdminHeader>

      <main className="admin-content">
        {/* Tab Selection */}
        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            Product Categories <span className="admin-tab-count">{categories.length}</span>
          </button>
          <button
            className={`admin-tab ${activeTab === 'brands' ? 'active' : ''}`}
            onClick={() => setActiveTab('brands')}
          >
            Brand Manufacturers <span className="admin-tab-count">{brands.length}</span>
          </button>
        </div>

        {/* Content list */}
        {activeTab === 'categories' ? (
          <DataTable<any>
            loading={loading}
            data={categories}
            columns={[
              {
                key: 'name',
                header: 'Category Name',
                render: (cat) => <span style={{ fontWeight: 600 }}>{cat.name}</span>,
              },
              { key: 'slug', header: 'URL Slug' },
              {
                key: 'description',
                header: 'Description',
                render: (cat) => cat.description || <span style={{ color: 'var(--admin-text-tertiary)' }}>No description</span>,
              },
              {
                key: 'actions',
                header: '',
                render: (cat) => (
                  <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                    <button className="admin-btn admin-btn-ghost admin-btn-icon" onClick={() => handleEditCategory(cat)}>
                      <Edit2 size={13} />
                    </button>
                    <button className="admin-btn admin-btn-ghost admin-btn-icon" style={{ color: 'var(--admin-danger-text)' }} onClick={() => handleDelete('product_categories', cat.id)}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                ),
              },
            ]}
          />
        ) : (
          <DataTable<any>
            loading={loading}
            data={brands}
            columns={[
              {
                key: 'name',
                header: 'Brand Name',
                render: (b) => <span style={{ fontWeight: 600 }}>{b.name}</span>,
              },
              {
                key: 'country',
                header: 'Country',
                render: (b) => (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={12} style={{ color: 'var(--admin-text-secondary)' }} />
                    <span>{b.country || 'N/A'}</span>
                  </div>
                ),
              },
              {
                key: 'website',
                header: 'Website',
                render: (b) =>
                  b.website ? (
                    <a href={b.website} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--admin-accent)' }}>
                      <Globe size={12} /> Link
                    </a>
                  ) : (
                    'N/A'
                  ),
              },
              {
                key: 'actions',
                header: '',
                render: (b) => (
                  <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                    <button className="admin-btn admin-btn-ghost admin-btn-icon" onClick={() => handleEditBrand(b)}>
                      <Edit2 size={13} />
                    </button>
                    <button className="admin-btn admin-btn-ghost admin-btn-icon" style={{ color: 'var(--admin-danger-text)' }} onClick={() => handleDelete('brands', b.id)}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                ),
              },
            ]}
          />
        )}
      </main>

      {/* Category Modal Dialog */}
      {isCatModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <form onSubmit={handleSaveCategory}>
              <div className="admin-modal-header">
                <span className="admin-modal-title">{editId ? 'Edit Category' : 'Create New Category'}</span>
                <button type="button" className="admin-modal-close" onClick={() => setIsCatModalOpen(false)}>
                  <X size={15} />
                </button>
              </div>
              <div className="admin-modal-body">
                <AdminFormField label="Category Name" required>
                  <input type="text" className="admin-input" value={catName} onChange={(e) => setCatName(e.target.value)} required />
                </AdminFormField>
                <AdminFormField label="Slug">
                  <input type="text" className="admin-input" placeholder="leave-blank-to-auto-slug" value={catSlug} onChange={(e) => setCatSlug(e.target.value)} />
                </AdminFormField>
                <AdminFormField label="Description">
                  <textarea className="admin-textarea" value={catDesc} onChange={(e) => setCatDesc(e.target.value)} />
                </AdminFormField>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setIsCatModalOpen(false)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary">Save Category</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Brand Modal Dialog */}
      {isBrandModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <form onSubmit={handleSaveBrand}>
              <div className="admin-modal-header">
                <span className="admin-modal-title">{editId ? 'Edit Brand' : 'Create Brand Profile'}</span>
                <button type="button" className="admin-modal-close" onClick={() => setIsBrandModalOpen(false)}>
                  <X size={15} />
                </button>
              </div>
              <div className="admin-modal-body">
                <AdminFormField label="Brand Name" required>
                  <input type="text" className="admin-input" value={brandName} onChange={(e) => setBrandName(e.target.value)} required />
                </AdminFormField>
                <AdminFormField label="Slug">
                  <input type="text" className="admin-input" placeholder="leave-blank-to-auto-slug" value={brandSlug} onChange={(e) => setBrandSlug(e.target.value)} />
                </AdminFormField>
                <AdminFormField label="Country of Origin">
                  <input type="text" className="admin-input" placeholder="Italy, India" value={brandCountry} onChange={(e) => setBrandCountry(e.target.value)} />
                </AdminFormField>
                <AdminFormField label="Official Website URL">
                  <input type="url" className="admin-input" placeholder="https://example.com" value={brandWeb} onChange={(e) => setBrandWeb(e.target.value)} />
                </AdminFormField>
                <AdminFormField label="Description">
                  <textarea className="admin-textarea" value={brandDesc} onChange={(e) => setBrandDesc(e.target.value)} />
                </AdminFormField>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setIsBrandModalOpen(false)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary">Save Brand</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
