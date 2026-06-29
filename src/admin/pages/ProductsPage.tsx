import React, { useState, useEffect } from 'react';
import AdminHeader from '../components/AdminHeader';
import DataTable from '../components/DataTable';
import ConfirmModal from '../components/ConfirmModal';
import { getProducts, getCategories, getBrands } from '../../services/productService';
import { adminDeleteProduct, adminToggleProductStock, adminCreateProduct } from '../../services/adminService';
import { Plus, Search, Edit2, Copy, Trash2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import type { TileProduct } from '../../types';

import { queryClient } from '../../lib/queryClient';

interface ProductsPageProps {
  onNavigate: (hash: string) => void;
}

export default function ProductsPage({ onNavigate }: ProductsPageProps) {
  const [products, setProducts] = useState<TileProduct[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination state
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [sortField, setSortField] = useState('popularity_score');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);

  // Action modals state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchFilters = async () => {
    try {
      const [catRes, brandRes] = await Promise.all([getCategories(), getBrands()]);
      setCategories(catRes || []);
      setBrands(brandRes || []);
    } catch (e) {
      // Safe fail
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getProducts(
        {
          search: search || undefined,
          category: category || undefined,
          brand: brand || undefined,
          inStock: undefined, // show both in/out stock in admin
        },
        { field: sortField, direction: sortDirection },
        page,
        15
      );
      setProducts(res.products);
      setTotalCount(res.total);
    } catch (err: any) {
      setError(err.message || 'Failed to load catalog products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [search, category, brand, sortField, sortDirection, page]);

  const handleStockToggle = async (productId: string, currentStock: boolean) => {
    try {
      await adminToggleProductStock(productId, !currentStock);
      setProducts(
        products.map((p) => (p.id === productId ? { ...p, inStock: !currentStock } : p))
      );
      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (e: any) {
      setError('Failed to update stock status');
    }
  };

  const handleDuplicate = async (product: TileProduct) => {
    try {
      const uniqueCode = `${product.code}-COPY`;
      const uniqueSlug = `${product.slug}-copy-${Date.now()}`;
      
      const newProduct = {
        name: `${product.name} (Copy)`,
        code: uniqueCode,
        slug: uniqueSlug,
        categoryId: categories.find(c => c.slug === product.category)?.id,
        brandId: brands.find(b => b.name === product.brand)?.id,
        material: product.material,
        finish: product.finish,
        size: product.size,
        origin: product.origin,
        priceCategory: product.priceCategory,
        description: product.description,
        features: product.features,
        color: product.color,
        texture: product.texture,
        antiSkid: product.antiSkid,
        usageAreas: product.usageArea,
        style: product.style,
        indoorOutdoor: product.indoorOutdoor,
        latest: product.latest,
        inStock: product.inStock,
      };

      await adminCreateProduct(newProduct as any);
      queryClient.invalidateQueries({ queryKey: ['products'] });
      fetchProducts();
    } catch (e: any) {
      setError(e.message || 'Failed to duplicate product');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await adminDeleteProduct(deleteId);
      setProducts(products.filter((p) => p.id !== deleteId));
      setDeleteId(null);
      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (err: any) {
      setError(err.message || 'Failed to delete product');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <AdminHeader title="Products Directory" breadcrumb={['Catalog', 'Products']}>
        <button
          className="admin-btn admin-btn-primary"
          onClick={() => onNavigate('#/admin/products/new')}
        >
          <Plus size={16} />
          Add Product
        </button>
      </AdminHeader>

      <main className="admin-content">
        {error && (
          <div className="admin-alert danger">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Filter bar */}
        <div className="admin-filter-bar">
          <div className="admin-search-wrapper">
            <Search className="admin-search-icon" />
            <input
              type="text"
              placeholder="Search by title, code..."
              className="admin-search-input"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <select
            className="admin-select"
            style={{ width: '160px' }}
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            className="admin-select"
            style={{ width: '160px' }}
            value={brand}
            onChange={(e) => {
              setBrand(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Brands</option>
            {brands.map((b) => (
              <option key={b.id} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Products Table */}
        <DataTable<TileProduct>
          loading={loading}
          data={products}
          getRowId={(p) => p.id}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={(field, dir) => {
            setSortField(field);
            setSortDirection(dir);
          }}
          currentPage={page}
          totalPages={Math.ceil(totalCount / 15)}
          onPageChange={setPage}
          pageSize={15}
          totalCount={totalCount}
          columns={[
            {
              key: 'image',
              header: 'Image',
              width: '60px',
              render: (p) => (
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--admin-radius-sm)',
                    overflow: 'hidden',
                    background: '#f3f4f6',
                    border: '1px solid var(--admin-border-light)',
                  }}
                >
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: '#d1d5db' }} />
                  )}
                </div>
              ),
            },
            {
              key: 'name',
              header: 'Product Details',
              sortable: true,
              render: (p) => (
                <div>
                  <div style={{ fontWeight: 600 }}>{p.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--admin-text-secondary)', display: 'flex', gap: '8px' }}>
                    <span>Code: {p.code}</span>
                    <span>•</span>
                    <span>Category: {p.category}</span>
                  </div>
                </div>
              ),
            },
            {
              key: 'brand',
              header: 'Brand',
              sortable: true,
            },
            {
              key: 'size',
              header: 'Dimensions',
            },
            {
              key: 'priceCategory',
              header: 'Tier',
              sortable: true,
              render: (p) => (
                <span
                  style={{
                    fontSize: '11.5px',
                    fontWeight: 600,
                    color:
                      p.priceCategory === 'Signature'
                        ? 'var(--admin-purple-text)'
                        : p.priceCategory === 'Reserve'
                        ? 'var(--admin-orange-text)'
                        : 'var(--admin-accent-text)',
                  }}
                >
                  {p.priceCategory}
                </span>
              ),
            },
            {
              key: 'inStock',
              header: 'Stock Status',
              render: (p) => (
                <button
                  type="button"
                  onClick={() => handleStockToggle(p.id, !!p.inStock)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
                  title="Toggle stock status"
                >
                  {p.inStock ? (
                    <span className="admin-badge success">
                      <Eye size={12} /> In Stock
                    </span>
                  ) : (
                    <span className="admin-badge danger">
                      <EyeOff size={12} /> Out of Stock
                    </span>
                  )}
                </button>
              ),
            },
            {
              key: 'actions',
              header: '',
              render: (p) => (
                <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                  <button
                    className="admin-btn admin-btn-ghost admin-btn-icon"
                    onClick={() => onNavigate(`#/admin/products/${p.id}/edit`)}
                    title="Edit"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    className="admin-btn admin-btn-ghost admin-btn-icon"
                    onClick={() => handleDuplicate(p)}
                    title="Duplicate"
                  >
                    <Copy size={13} />
                  </button>
                  <button
                    className="admin-btn admin-btn-ghost admin-btn-icon"
                    onClick={() => setDeleteId(p.id)}
                    title="Delete"
                    style={{ color: 'var(--admin-danger-text)' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ),
            },
          ]}
        />
      </main>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        message="Are you sure you want to delete this product? This will permanently remove it from the store catalog."
        loading={deleteLoading}
      />
    </div>
  );
}
