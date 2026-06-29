import React, { useState, useEffect } from 'react';
import AdminHeader from '../components/AdminHeader';
import AdminFormField from '../components/AdminFormField';
import ImageUploader from '../components/ImageUploader';
import { getProductById, getCategories, getBrands } from '../../services/productService';
import { adminCreateProduct, adminUpdateProduct } from '../../services/adminService';
import { getProductImages } from '../../services/imageUploadService';
import { ChevronLeft, Save, AlertCircle, Plus, X } from 'lucide-react';

interface ProductFormPageProps {
  productId?: string;
  onNavigate: (hash: string) => void;
}

import { queryClient } from '../../lib/queryClient';

// Form Fields State
// ... (rest of imports)

export default function ProductFormPage({ productId, onNavigate }: ProductFormPageProps) {
  const isEdit = !!productId;
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Lists
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);

  // Form Fields State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [material, setMaterial] = useState('');
  const [finish, setFinish] = useState('Polished');
  const [size, setSize] = useState('');
  const [origin, setOrigin] = useState('');
  const [priceCategory, setPriceCategory] = useState<'Signature' | 'Premium' | 'Reserve'>('Premium');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('');
  const [texture, setTexture] = useState('');
  const [thickness, setThickness] = useState('');
  const [waterAbsorption, setWaterAbsorption] = useState('');
  const [style, setStyle] = useState('');
  const [indoorOutdoor, setIndoorOutdoor] = useState<'indoor' | 'outdoor' | 'both'>('indoor');
  const [antiSkid, setAntiSkid] = useState(false);
  const [latest, setLatest] = useState(false);
  const [inStock, setInStock] = useState(true);

  // Lists & arrays state
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState('');
  const [usageAreas, setUsageAreas] = useState<string[]>([]);
  const [newUsageArea, setNewUsageArea] = useState('');

  const fetchFormMetadata = async () => {
    try {
      const [catRes, brandRes] = await Promise.all([getCategories(), getBrands()]);
      setCategories(catRes || []);
      setBrands(brandRes || []);
    } catch (e) {
      // Safe fail
    }
  };

  const fetchProductData = async () => {
    if (!productId) return;
    setLoading(true);
    setError(null);
    try {
      const product = await getProductById(productId);
      if (product) {
        setName(product.name);
        setCode(product.code);
        setSlug(product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
        setMaterial(product.material);
        setFinish(product.finish);
        setSize(product.size);
        setOrigin(product.origin);
        setPriceCategory(product.priceCategory);
        setDescription(product.description);
        setColor(product.color || '');
        setTexture(product.texture || '');
        setThickness(product.thickness || '');
        setWaterAbsorption(product.waterAbsorption || '');
        setStyle(product.style || '');
        setIndoorOutdoor((product.indoorOutdoor as any) || 'indoor');
        setAntiSkid(product.antiSkid);
        setLatest(product.latest);
        setInStock(product.inStock !== false);
        setFeatures(product.features || []);
        setUsageAreas(product.usageArea || []);
      }
      
      const imgs = await getProductImages(productId);
      setImages(imgs || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchFormMetadata();
      if (isEdit) {
        await fetchProductData();
      }
    };
    init();
  }, [productId]);

  // Synchronise category ID mapping once lists are resolved
  useEffect(() => {
    if (isEdit && categories.length > 0) {
      getProductById(productId!).then((p) => {
        if (p) {
          const matchCat = categories.find((c) => c.slug === p.category);
          if (matchCat) setCategoryId(matchCat.id);
          const matchBrand = brands.find((b) => b.name === p.brand);
          if (matchBrand) setBrandId(matchBrand.id);
        }
      });
    }
  }, [categories, brands]);

  const handleAddFeature = () => {
    if (newFeature.trim() && !features.includes(newFeature.trim())) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleAddUsageArea = () => {
    if (newUsageArea.trim() && !usageAreas.includes(newUsageArea.trim())) {
      setUsageAreas([...usageAreas, newUsageArea.trim()]);
      setNewUsageArea('');
    }
  };

  const handleRemoveUsageArea = (index: number) => {
    setUsageAreas(usageAreas.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const inputData = {
      name,
      code,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      categoryId: categoryId || undefined,
      brandId: brandId || undefined,
      material,
      finish,
      size,
      origin,
      priceCategory,
      description,
      features,
      color: color || undefined,
      texture: texture || undefined,
      antiSkid,
      usageAreas,
      thickness: thickness || undefined,
      waterAbsorption: waterAbsorption || undefined,
      style: style || undefined,
      indoorOutdoor,
      latest,
      inStock,
    };

    try {
      if (isEdit) {
        await adminUpdateProduct(productId!, inputData as any);
        setSuccess(true);
      } else {
        const res = await adminCreateProduct(inputData as any);
        if (res && res.id) {
          onNavigate(`#/admin/products/${res.id}/edit`);
        }
      }
      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (err: any) {
      setError(err.message || 'Error occurred while saving product info.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', padding: '60px' }}>
        <div className="admin-spinner admin-spinner-lg" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <AdminHeader
        title={isEdit ? `Edit Product: ${name}` : 'New Catalog Product'}
        breadcrumb={['Catalog', 'Products', isEdit ? 'Edit' : 'Create']}
      >
        <button
          type="button"
          className="admin-btn admin-btn-secondary"
          onClick={() => onNavigate('#/admin/products')}
        >
          <ChevronLeft size={16} />
          Back
        </button>
        <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Product'}
        </button>
      </AdminHeader>

      <main className="admin-content">
        {error && (
          <div className="admin-alert danger">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="admin-alert success">
            <span>Product specifications saved successfully.</span>
          </div>
        )}

        <div className="admin-grid-3">
          {/* Main Attributes Panel */}
          <div className="admin-card" style={{ gridColumn: 'span 2' }}>
            <div className="admin-card-header">
              <div className="admin-card-title">General Specifications</div>
            </div>
            <div className="admin-card-body">
              <div className="admin-grid-2">
                <AdminFormField label="Product Name" required>
                  <input
                    type="text"
                    className="admin-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </AdminFormField>

                <AdminFormField label="Product Code" required>
                  <input
                    type="text"
                    className="admin-input"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                  />
                </AdminFormField>
              </div>

              <div className="admin-grid-2">
                <AdminFormField label="URL Slug">
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="automatic-slug-name"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                  />
                </AdminFormField>

                <AdminFormField label="Price Tier Category" required>
                  <select
                    className="admin-select"
                    value={priceCategory}
                    onChange={(e: any) => setPriceCategory(e.target.value)}
                    required
                  >
                    <option value="Premium">Premium</option>
                    <option value="Signature">Signature</option>
                    <option value="Reserve">Reserve</option>
                  </select>
                </AdminFormField>
              </div>

              <AdminFormField label="Product Description">
                <textarea
                  className="admin-textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ minHeight: '120px' }}
                />
              </AdminFormField>

              <hr className="admin-divider" />

              <div className="admin-card-title" style={{ marginBottom: '16px' }}>Detailed Properties</div>

              <div className="admin-grid-3">
                <AdminFormField label="Material">
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="e.g. Vitrified, Marble"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                  />
                </AdminFormField>

                <AdminFormField label="Surface Finish">
                  <select
                    className="admin-select"
                    value={finish}
                    onChange={(e) => setFinish(e.target.value)}
                  >
                    <option value="Polished">Polished</option>
                    <option value="Matte">Matte</option>
                    <option value="Satin">Satin</option>
                    <option value="High-Gloss">High-Gloss</option>
                    <option value="Structured">Structured</option>
                    <option value="Lappato">Lappato</option>
                  </select>
                </AdminFormField>

                <AdminFormField label="Dimensions (Size)">
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="e.g. 600x1200 mm"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                  />
                </AdminFormField>
              </div>

              <div className="admin-grid-3">
                <AdminFormField label="Origin / Source">
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="e.g. Italy, India"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                  />
                </AdminFormField>

                <AdminFormField label="Color shade">
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="e.g. Beige, Calacatta"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                  />
                </AdminFormField>

                <AdminFormField label="Thickness">
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="e.g. 9 mm, 15 mm"
                    value={thickness}
                    onChange={(e) => setThickness(e.target.value)}
                  />
                </AdminFormField>
              </div>

              <div className="admin-grid-3">
                <AdminFormField label="Water Absorption">
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="e.g. <0.05%"
                    value={waterAbsorption}
                    onChange={(e) => setWaterAbsorption(e.target.value)}
                  />
                </AdminFormField>

                <AdminFormField label="Style theme">
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="e.g. Modern, Minimalist"
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                  />
                </AdminFormField>

                <AdminFormField label="Indoor/Outdoor">
                  <select
                    className="admin-select"
                    value={indoorOutdoor}
                    onChange={(e: any) => setIndoorOutdoor(e.target.value)}
                  >
                    <option value="indoor">Indoor only</option>
                    <option value="outdoor">Outdoor only</option>
                    <option value="both">Both</option>
                  </select>
                </AdminFormField>
              </div>

              <hr className="admin-divider" />

              {/* Lists Inputs */}
              <div className="admin-grid-2">
                <AdminFormField label="Product Features & Highlights">
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="Add highlight..."
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                    />
                    <button type="button" className="admin-btn admin-btn-secondary" onClick={handleAddFeature}>
                      <Plus size={14} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {features.map((feat, idx) => (
                      <span key={idx} className="admin-tag">
                        {feat}
                        <button type="button" className="admin-tag-remove" onClick={() => handleRemoveFeature(idx)}>
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                </AdminFormField>

                <AdminFormField label="Recommended Room Usage Areas">
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="Add area (e.g. Kitchen)..."
                      value={newUsageArea}
                      onChange={(e) => setNewUsageArea(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddUsageArea())}
                    />
                    <button type="button" className="admin-btn admin-btn-secondary" onClick={handleAddUsageArea}>
                      <Plus size={14} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {usageAreas.map((area, idx) => (
                      <span key={idx} className="admin-tag">
                        {area}
                        <button type="button" className="admin-tag-remove" onClick={() => handleRemoveUsageArea(idx)}>
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                </AdminFormField>
              </div>
            </div>
          </div>

          {/* Right Status & Meta Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="admin-card">
              <div className="admin-card-header">
                <div className="admin-card-title">Status & Visibility</div>
              </div>
              <div className="admin-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="admin-checkbox-group">
                  <input
                    type="checkbox"
                    id="inStockCheck"
                    className="admin-checkbox"
                    checked={inStock}
                    onChange={(e) => setInStock(e.target.checked)}
                  />
                  <label htmlFor="inStockCheck" className="admin-form-label" style={{ marginBottom: 0, cursor: 'pointer' }}>
                    In Stock / Visible to Customers
                  </label>
                </div>

                <div className="admin-checkbox-group">
                  <input
                    type="checkbox"
                    id="latestCheck"
                    className="admin-checkbox"
                    checked={latest}
                    onChange={(e) => setLatest(e.target.checked)}
                  />
                  <label htmlFor="latestCheck" className="admin-form-label" style={{ marginBottom: 0, cursor: 'pointer' }}>
                    Feature as New Arrival
                  </label>
                </div>

                <div className="admin-checkbox-group">
                  <input
                    type="checkbox"
                    id="antiSkidCheck"
                    className="admin-checkbox"
                    checked={antiSkid}
                    onChange={(e) => setAntiSkid(e.target.checked)}
                  />
                  <label htmlFor="antiSkidCheck" className="admin-form-label" style={{ marginBottom: 0, cursor: 'pointer' }}>
                    Anti-Skid Rating (Vitrified safety)
                  </label>
                </div>
              </div>
            </div>

            <div className="admin-card">
              <div className="admin-card-header">
                <div className="admin-card-title">Category & Brand</div>
              </div>
              <div className="admin-card-body">
                <AdminFormField label="Product Category">
                  <select
                    className="admin-select"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </AdminFormField>

                <AdminFormField label="Brand / Manufacturer">
                  <select
                    className="admin-select"
                    value={brandId}
                    onChange={(e) => setBrandId(e.target.value)}
                  >
                    <option value="">Select Brand</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </AdminFormField>
              </div>
            </div>

            {isEdit && (
              <div className="admin-card">
                <div className="admin-card-header">
                  <div className="admin-card-title">Product Image Gallery</div>
                </div>
                <div className="admin-card-body">
                  <ImageUploader
                    productId={productId!}
                    images={images}
                    onImagesChanged={fetchProductData}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </form>
  );
}
