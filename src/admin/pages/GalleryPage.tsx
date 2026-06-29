import React, { useState, useEffect } from 'react';
import AdminHeader from '../components/AdminHeader';
import DataTable from '../components/DataTable';
import ConfirmModal from '../components/ConfirmModal';
import AdminFormField from '../components/AdminFormField';
import { getGalleries, getLocalGalleries, saveLocalGalleries } from '../../services/blogService';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Plus, X, Upload, Save, AlertCircle, Link as LinkIcon, Trash2 } from 'lucide-react';
import { queryClient } from '../../lib/queryClient';

export default function GalleryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState('living room');
  const [imageUrl, setImageUrl] = useState('');
  const [location, setLocation] = useState('');
  const [size, setSize] = useState('');
  const [year, setYear] = useState('');
  const [description, setDescription] = useState('');
  const [productIds, setProductIds] = useState<string[]>([]);
  const [productIdInput, setProductIdInput] = useState('');

  // Upload progress
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Delete modal
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchGalleryItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getGalleries();
      setItems(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load project gallery archive');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadProgress(20);

    try {
      const file = files[0];
      const storagePath = `gallery/${Date.now()}-${file.name}`;
      
      const { data, error: uploadError } = await supabase.storage
        .from('room-uploads')
        .upload(storagePath, file, { contentType: file.type });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('room-uploads').getPublicUrl(data.path);
      setImageUrl(urlData.publicUrl);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleAddProductId = () => {
    if (productIdInput.trim() && !productIds.includes(productIdInput.trim())) {
      setProductIds([...productIds, productIdInput.trim()]);
      setProductIdInput('');
    }
  };

  const handleRemoveProductId = (idx: number) => {
    setProductIds(productIds.filter((_, i) => i !== idx));
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload = {
      title,
      subtitle: subtitle || null,
      category,
      image_url: imageUrl,
      location: location || null,
      size: size || null,
      year: year || null,
      description: description || null,
      product_ids: productIds,
    };

    if (!isSupabaseConfigured) {
      try {
        const stored = await getLocalGalleries();
        if (editId) {
          const updated = stored.map(g => g.id === editId ? { ...g, ...payload, imageUrl: payload.image_url, roomType: payload.category } : g);
          saveLocalGalleries(updated);
        } else {
          const newItem = { id: `sim-gal-${Date.now()}`, ...payload, imageUrl: payload.image_url, roomType: payload.category };
          saveLocalGalleries([...stored, newItem]);
        }
        setIsModalOpen(false);
        fetchGalleryItems();
        queryClient.invalidateQueries({ queryKey: ['galleries'] });
      } catch (err: any) {
        setError(err.message || 'Failed to save gallery item.');
      }
      return;
    }

    try {
      if (editId) {
        await (supabase.from('galleries') as any).update(payload).eq('id', editId);
      } else {
        await (supabase.from('galleries') as any).insert(payload);
      }
      setIsModalOpen(false);
      fetchGalleryItems();
      queryClient.invalidateQueries({ queryKey: ['galleries'] });
    } catch (err: any) {
      setError(err.message || 'Failed to save gallery item.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);

    if (!isSupabaseConfigured) {
      try {
        const stored = await getLocalGalleries();
        saveLocalGalleries(stored.filter(g => g.id !== deleteId));
        setItems(items.filter((i) => i.id !== deleteId));
        setDeleteId(null);
        queryClient.invalidateQueries({ queryKey: ['galleries'] });
      } catch (err: any) {
        setError(err.message || 'Failed to delete gallery item.');
      } finally {
        setDeleteLoading(false);
      }
      return;
    }

    try {
      await supabase.from('galleries').delete().eq('id', deleteId);
      setItems(items.filter((i) => i.id !== deleteId));
      setDeleteId(null);
      queryClient.invalidateQueries({ queryKey: ['galleries'] });
    } catch (err: any) {
      setError(err.message || 'Failed to delete gallery item.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <AdminHeader title="Gallery & Inspirations" breadcrumb={['Content', 'Project Gallery']}>
        <button
          className="admin-btn admin-btn-primary"
          onClick={() => {
            setEditId(null);
            setTitle('');
            setSubtitle('');
            setCategory('living room');
            setImageUrl('');
            setLocation('');
            setSize('');
            setYear('');
            setDescription('');
            setProductIds([]);
            setIsModalOpen(true);
          }}
        >
          <Plus size={16} /> New Inspiration
        </button>
      </AdminHeader>

      <main className="admin-content">
        {error && (
          <div className="admin-alert danger">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <DataTable<any>
          loading={loading}
          data={items}
          getRowId={(i) => i.id}
          columns={[
            {
              key: 'imageUrl',
              header: 'Preview',
              width: '60px',
              render: (i) => (
                <div
                  style={{
                    width: '50px',
                    height: '40px',
                    borderRadius: 'var(--admin-radius-sm)',
                    overflow: 'hidden',
                    background: '#f3f4f6',
                    border: '1px solid var(--admin-border-light)',
                  }}
                >
                  <img src={i.imageUrl} alt={i.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ),
            },
            {
              key: 'title',
              header: 'Project Details',
              render: (i) => (
                <div>
                  <div style={{ fontWeight: 600 }}>{i.title}</div>
                  <div style={{ fontSize: '11px', color: 'var(--admin-text-secondary)' }}>
                    Category: {i.category} | Location: {i.location || 'N/A'}
                  </div>
                </div>
              ),
            },
            {
              key: 'year',
              header: 'Year',
            },
            {
              key: 'linked_products',
              header: 'Linked Products',
              render: (i) => <span>{i.product_ids?.length || 0} Products</span>,
            },
            {
              key: 'actions',
              header: '',
              render: (i) => (
                <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                  <button
                    className="admin-btn admin-btn-ghost admin-btn-icon"
                    onClick={() => {
                      setEditId(i.id);
                      setTitle(i.title);
                      setSubtitle(i.subtitle || '');
                      setCategory(i.category);
                      setImageUrl(i.imageUrl);
                      setLocation(i.location || '');
                      setSize(i.size || '');
                      setYear(i.year || '');
                      setDescription(i.description || '');
                      setProductIds(i.productIds || i.product_ids || []);
                      setIsModalOpen(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="admin-btn admin-btn-ghost admin-btn-icon"
                    style={{ color: 'var(--admin-danger-text)' }}
                    onClick={() => setDeleteId(i.id)}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ),
            },
          ]}
        />
      </main>

      {/* Editor Modal Overlay */}
      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal admin-modal-lg">
            <form onSubmit={handleSaveItem}>
              <div className="admin-modal-header">
                <span className="admin-modal-title">{editId ? 'Edit Inspiration' : 'Add Inspiration Design'}</span>
                <button type="button" className="admin-modal-close" onClick={() => setIsModalOpen(false)}>
                  <X size={15} />
                </button>
              </div>
              <div className="admin-modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <div className="admin-grid-2">
                  <AdminFormField label="Project / Room Title" required>
                    <input type="text" className="admin-input" value={title} onChange={(e) => setTitle(e.target.value)} required />
                  </AdminFormField>

                  <AdminFormField label="Subtitle (or description helper)">
                    <input type="text" className="admin-input" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
                  </AdminFormField>
                </div>

                <div className="admin-grid-2">
                  <AdminFormField label="Inspiration Category" required>
                    <select className="admin-select" value={category} onChange={(e) => setCategory(e.target.value)} required>
                      <option value="kitchen">Kitchen</option>
                      <option value="bathroom">Bathroom</option>
                      <option value="outdoor">Outdoor</option>
                      <option value="living room">Living Room</option>
                      <option value="luxury villas">Luxury Villas</option>
                      <option value="commercial">Commercial Space</option>
                    </select>
                  </AdminFormField>

                  <AdminFormField label="Location / City">
                    <input type="text" className="admin-input" value={location} onChange={(e) => setLocation(e.target.value)} />
                  </AdminFormField>
                </div>

                <div className="admin-grid-2">
                  <AdminFormField label="Area size (e.g. 500 sqft)">
                    <input type="text" className="admin-input" value={size} onChange={(e) => setSize(e.target.value)} />
                  </AdminFormField>

                  <AdminFormField label="Year Built">
                    <input type="text" className="admin-input" placeholder="e.g. 2026" value={year} onChange={(e) => setYear(e.target.value)} />
                  </AdminFormField>
                </div>

                <AdminFormField label="Overview / Description">
                  <textarea className="admin-textarea" value={description} onChange={(e) => setDescription(e.target.value)} style={{ minHeight: '60px' }} />
                </AdminFormField>

                <div className="admin-grid-2">
                  <AdminFormField label="Photo URL" required>
                    <input type="text" className="admin-input" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} required />
                  </AdminFormField>

                  <AdminFormField label="Or Upload Image">
                    <input type="file" className="admin-input" onChange={handleFileUpload} />
                    {uploading && (
                      <div className="admin-progress" style={{ marginTop: '8px' }}>
                        <div className="admin-progress-bar" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    )}
                  </AdminFormField>
                </div>

                {/* Linked product UUIDs list */}
                <AdminFormField label="Linked Catalog Products">
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="Add Product UUID..."
                      value={productIdInput}
                      onChange={(e) => setProductIdInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddProductId())}
                    />
                    <button type="button" className="admin-btn admin-btn-secondary" onClick={handleAddProductId}>
                      Link
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {productIds.map((pid, idx) => (
                      <span key={idx} className="admin-tag">
                        <LinkIcon size={10} style={{ marginRight: '4px' }} />
                        {pid}
                        <button type="button" className="admin-tag-remove" onClick={() => handleRemoveProductId(idx)}>
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                </AdminFormField>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  <Save size={16} /> Save Inspiration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Design"
        message="Are you sure you want to remove this inspiration gallery image? This will clear it from the live portfolio gallery."
        loading={deleteLoading}
      />
    </div>
  );
}
