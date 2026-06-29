import React, { useState, useEffect } from 'react';
import AdminHeader from '../components/AdminHeader';
import DataTable from '../components/DataTable';
import { getProducts } from '../../services/productService';
import { adminToggleProductStock, adminUpdateProduct } from '../../services/adminService';
import { Search, Save, AlertCircle, Eye, EyeOff } from 'lucide-react';
import type { TileProduct } from '../../types';

import { queryClient } from '../../lib/queryClient';

export default function InventoryPage() {
  const [products, setProducts] = useState<TileProduct[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [savingId, setSavingId] = useState<string | null>(null);

  // Buffer state to store modified values locally before saving
  const [editBuffers, setEditBuffers] = useState<Record<string, { stock_quantity?: number; popularity_score?: number }>>({});

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getProducts(
        {
          search: search || undefined,
          inStock: undefined,
        },
        { field: 'popularity_score', direction: 'desc' },
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
    fetchProducts();
  }, [search, page]);

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

  const handleBufferChange = (productId: string, key: 'stock_quantity' | 'popularity_score', val: number) => {
    setEditBuffers({
      ...editBuffers,
      [productId]: {
        ...editBuffers[productId],
        [key]: val,
      },
    });
  };

  const handleSaveInline = async (productId: string) => {
    const buffer = editBuffers[productId];
    if (!buffer) return;
    setSavingId(productId);
    setError(null);

    try {
      const updates: any = {};
      if (buffer.popularity_score !== undefined) {
        updates.popularityScore = buffer.popularity_score;
      }
      // If stock quantity or inStock can be passed
      await adminUpdateProduct(productId, updates);
      
      // Update database simulation locally
      setProducts(
        products.map((p) => {
          if (p.id === productId) {
            return {
              ...p,
              popularityScore: buffer.popularity_score !== undefined ? buffer.popularity_score : p.popularityScore,
            };
          }
          return p;
        })
      );
      
      // Clear buffer
      const newBuffers = { ...editBuffers };
      delete newBuffers[productId];
      setEditBuffers(newBuffers);
      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (err: any) {
      setError(err.message || 'Failed to save inline inventory updates.');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <AdminHeader title="Inventory & Stock Management" breadcrumb={['Catalog', 'Inventory']} onRefresh={fetchProducts} />

      <main className="admin-content">
        {error && (
          <div className="admin-alert danger">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="admin-filter-bar">
          <div className="admin-search-wrapper">
            <Search className="admin-search-icon" />
            <input
              type="text"
              placeholder="Search by code, title..."
              className="admin-search-input"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        <DataTable<TileProduct>
          loading={loading}
          data={products}
          getRowId={(p) => p.id}
          currentPage={page}
          totalPages={Math.ceil(totalCount / 15)}
          onPageChange={setPage}
          pageSize={15}
          totalCount={totalCount}
          columns={[
            {
              key: 'code',
              header: 'Product Code',
              render: (p) => <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{p.code}</span>,
            },
            {
              key: 'name',
              header: 'Product Title',
              render: (p) => <span style={{ fontWeight: 600 }}>{p.name}</span>,
            },
            {
              key: 'inStock',
              header: 'Availability Status',
              render: (p) => (
                <button
                  type="button"
                  onClick={() => handleStockToggle(p.id, !!p.inStock)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
                  title="Toggle stock status"
                >
                  {p.inStock ? (
                    <span className="admin-badge success">
                      <Eye size={12} /> Active Stock
                    </span>
                  ) : (
                    <span className="admin-badge danger">
                      <EyeOff size={12} /> Out of stock
                    </span>
                  )}
                </button>
              ),
            },
            {
              key: 'popularityScore',
              header: 'Trend Rating Score',
              render: (p) => {
                const currentVal =
                  editBuffers[p.id]?.popularity_score !== undefined
                    ? editBuffers[p.id].popularity_score
                    : p.popularityScore || 0;
                return (
                  <input
                    type="number"
                    className="admin-inline-input"
                    value={currentVal}
                    onChange={(e) => handleBufferChange(p.id, 'popularity_score', parseInt(e.target.value) || 0)}
                  />
                );
              },
            },
            {
              key: 'actions',
              header: '',
              render: (p) => {
                const hasChanges = editBuffers[p.id] !== undefined;
                return (
                  <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                    {hasChanges && (
                      <button
                        className="admin-btn admin-btn-primary admin-btn-sm"
                        disabled={savingId === p.id}
                        onClick={() => handleSaveInline(p.id)}
                      >
                        <Save size={12} />
                        {savingId === p.id ? '...' : 'Save'}
                      </button>
                    )}
                  </div>
                );
              },
            },
          ]}
        />
      </main>
    </div>
  );
}
