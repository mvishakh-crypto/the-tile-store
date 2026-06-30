import React, { useState, useEffect } from 'react';
import AdminHeader from '../components/AdminHeader';
import DataTable from '../components/DataTable';
import { adminGenerateAllEmbeddings, adminRebuildRecommendations } from '../../services/adminService';
import { supabase } from '../../lib/supabase';
import { Brain, RefreshCw, BarChart, Server, CheckCircle, AlertCircle, Play } from 'lucide-react';

export default function AIPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Progress states
  const [embeddingProgress, setEmbeddingProgress] = useState(0);
  const [embeddingTotal, setEmbeddingTotal] = useState(0);
  const [embeddingRunning, setEmbeddingRunning] = useState(false);

  const [rebuildRunning, setRebuildRunning] = useState(false);
  const [rebuildSuccess, setRebuildSuccess] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbError } = await supabase
        .from('ai_search_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (dbError) throw dbError;
      setLogs(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve AI search log streams.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleRegenerateEmbeddings = async () => {
    if (!confirm('Are you sure you want to regenerate vector search embeddings for all active products? This will update the embedding registry.')) return;
    setEmbeddingRunning(true);
    setEmbeddingProgress(0);
    setError(null);

    try {
      const res = await adminGenerateAllEmbeddings((completed, total) => {
        setEmbeddingProgress(completed);
        setEmbeddingTotal(total);
      });
      alert(`Embedding regeneration complete! Successfully updated ${res.completed} items.`);
    } catch (err: any) {
      setError(err.message || 'Error occurred generating embeddings.');
    } finally {
      setEmbeddingRunning(false);
    }
  };

  const handleRebuildRecommendations = async () => {
    setRebuildRunning(true);
    setRebuildSuccess(false);
    setError(null);
    try {
      await adminRebuildRecommendations();
      setRebuildSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to update similar recommendation charts.');
    } finally {
      setRebuildRunning(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <AdminHeader title="AI Systems & Vector Diagnostics" breadcrumb={['Systems', 'AI Panel']} onRefresh={fetchLogs} />

      <main className="admin-content">
        {error && (
          <div className="admin-alert danger">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="admin-grid-3" style={{ marginBottom: '24px' }}>
          {/* Embedding Panel */}
          <div className="admin-card">
            <div className="admin-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Server size={16} style={{ color: 'var(--admin-accent)' }} />
                <span className="admin-card-title">Vector Embeddings Registry</span>
              </div>
            </div>
            <div className="admin-card-body">
              <p style={{ fontSize: '13px', color: 'var(--admin-text-secondary)', marginBottom: '16px' }}>
                Generates vector search footprints for products to power spatial and text-based semantic AI search.
              </p>
              
              {embeddingRunning && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span>Regenerating footprints...</span>
                    <span>{embeddingProgress} / {embeddingTotal}</span>
                  </div>
                  <div className="admin-progress">
                    <div
                      className="admin-progress-bar"
                      style={{ width: `${(embeddingProgress / (embeddingTotal || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              <button
                className="admin-btn admin-btn-primary"
                onClick={handleRegenerateEmbeddings}
                disabled={embeddingRunning}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <RefreshCw size={14} className={embeddingRunning ? 'animate-spin' : ''} />
                {embeddingRunning ? 'Indexing Catalog...' : 'Regenerate Footprints'}
              </button>
            </div>
          </div>

          {/* Similar Recommendations */}
          <div className="admin-card">
            <div className="admin-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Brain size={16} style={{ color: 'var(--admin-purple)' }} />
                <span className="admin-card-title">AI Recommendation Engine</span>
              </div>
            </div>
            <div className="admin-card-body">
              <p style={{ fontSize: '13px', color: 'var(--admin-text-secondary)', marginBottom: '16px' }}>
                Calculates similarity maps based on material, style, and catalog metadata to link products in drawers.
              </p>

              {rebuildSuccess && (
                <div className="admin-alert success" style={{ padding: '8px 12px', fontSize: '12.5px', marginBottom: '16px' }}>
                  <CheckCircle size={14} />
                  <span>Recommendation links rebuilt.</span>
                </div>
              )}

              <button
                className="admin-btn admin-btn-secondary"
                onClick={handleRebuildRecommendations}
                disabled={rebuildRunning}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <Play size={14} />
                {rebuildRunning ? 'Linking Catalog...' : 'Rebuild Recommendation Maps'}
              </button>
            </div>
          </div>

          {/* AI Search Stats summary */}
          <div className="admin-card">
            <div className="admin-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BarChart size={16} style={{ color: 'var(--admin-success)' }} />
                <span className="admin-card-title">AI Search Logs Overview</span>
              </div>
            </div>
            <div className="admin-card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--admin-text-secondary)' }}>Semantic Model:</span>
                  <span style={{ fontWeight: 600 }}>Gemini-Text-Embedding-004</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--admin-text-secondary)' }}>Footprint dimensions:</span>
                  <span style={{ fontWeight: 600 }}>768 dimensions</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--admin-text-secondary)' }}>Log stream state:</span>
                  <span className="admin-badge success">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI search query stream */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div className="admin-card-title">Real-time Search Log stream</div>
          </div>
          <div className="admin-card-body" style={{ padding: 0 }}>
            <DataTable<any>
              loading={loading}
              data={logs}
              columns={[
                {
                  key: 'search_type',
                  header: 'Query Mode',
                  render: (log) => (
                    <span className={`admin-badge ${log.search_type === 'image' ? 'purple' : 'info'}`}>
                      {log.search_type.toUpperCase()}
                    </span>
                  ),
                },
                {
                  key: 'query',
                  header: 'Search Query / Payload',
                  render: (log) =>
                    log.search_type === 'image' ? (
                      <span style={{ color: 'var(--admin-text-secondary)', fontStyle: 'italic' }}>
                        Image payload uploaded
                      </span>
                    ) : (
                      <span style={{ fontWeight: 600 }}>&ldquo;{log.query}&rdquo;</span>
                    ),
                },
                {
                  key: 'result_count',
                  header: 'Hits returned',
                },
                {
                  key: 'created_at',
                  header: 'Time',
                  render: (log) => new Date(log.created_at).toLocaleString(),
                },
              ]}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
