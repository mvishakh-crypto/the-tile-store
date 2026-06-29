import React, { useState, useEffect } from 'react';
import AdminHeader from '../components/AdminHeader';
import DataTable from '../components/DataTable';
import ConfirmModal from '../components/ConfirmModal';
import AdminFormField from '../components/AdminFormField';
import { getBlogs, getBlogCategories } from '../../services/blogService';
import { adminCreateBlog, adminUpdateBlog, adminDeleteBlog } from '../../services/blogService';
import { uploadBlogCover } from '../../services/imageUploadService';
import { Plus, Edit2, Trash2, Eye, EyeOff, Save, X, AlertCircle } from 'lucide-react';
import type { BlogArticle, BlogCategory } from '../../services/blogService';
import { queryClient } from '../../lib/queryClient';

export default function BlogPage() {
  const [blogs, setBlogs] = useState<BlogArticle[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [page, setPage] = useState(1);

  // Form edit states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [authorName, setAuthorName] = useState('Atelier Editorial');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [published, setPublished] = useState(false);

  // Upload States
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Delete Action states
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchFilters = async () => {
    try {
      const catRes = await getBlogCategories();
      setCategories(catRes || []);
    } catch (e) {
      // Safe fail
    }
  };

  const fetchBlogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getBlogs({ page, pageSize: 15 });
      setBlogs(res.blogs || []);
      setTotalCount(res.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve blog archive.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [page]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (idx: number) => {
    setTags(tags.filter((_, i) => i !== idx));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadProgress(10);
    try {
      const res = await uploadBlogCover(files[0], slug || 'temp-slug', {
        onProgress: (pct) => setUploadProgress(pct),
      });
      if (res.success && res.url) {
        setCoverImage(res.url);
      } else {
        setError(res.error || 'Cover image upload failed');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred uploading image cover.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleOpenCreate = () => {
    setEditId(null);
    setTitle('');
    setSlug('');
    setExcerpt('');
    setContent('');
    setCoverImage('');
    setCategoryId('');
    setAuthorName('Atelier Editorial');
    setTags([]);
    setPublished(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: BlogArticle) => {
    setEditId(b.id);
    setTitle(b.title);
    setSlug(b.slug);
    setExcerpt(b.excerpt || '');
    setContent(b.content);
    setCoverImage(b.coverImage || '');
    setCategoryId(b.categoryId || '');
    setAuthorName(b.authorName);
    setTags(b.tags || []);
    setPublished(!!b.publishedAt);
    setIsModalOpen(true);
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const blogInput = {
      title,
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      excerpt,
      content,
      coverImage: coverImage || undefined,
      categoryId: categoryId || undefined,
      authorName,
      tags,
      published,
    };

    try {
      if (editId) {
        const success = await adminUpdateBlog(editId, blogInput);
        if (!success) throw new Error('Update failed');
      } else {
        const res = await adminCreateBlog(blogInput);
        if (!res) throw new Error('Creation failed');
      }
      setIsModalOpen(false);
      fetchBlogs();
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    } catch (err: any) {
      setError(err.message || 'Failed to save blog post.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await adminDeleteBlog(deleteId);
      setBlogs(blogs.filter((b) => b.id !== deleteId));
      setDeleteId(null);
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    } catch (err: any) {
      setError(err.message || 'Failed to delete blog post.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <AdminHeader title="Blog CMS Center" breadcrumb={['Content', 'Blog CMS']}>
        <button className="admin-btn admin-btn-primary" onClick={handleOpenCreate}>
          <Plus size={16} /> New Article
        </button>
      </AdminHeader>

      <main className="admin-content">
        {error && (
          <div className="admin-alert danger">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <DataTable<BlogArticle>
          loading={loading}
          data={blogs}
          getRowId={(b) => b.id}
          currentPage={page}
          totalPages={Math.ceil(totalCount / 15)}
          onPageChange={setPage}
          pageSize={15}
          totalCount={totalCount}
          columns={[
            {
              key: 'coverImage',
              header: 'Cover',
              width: '60px',
              render: (b) => (
                <div
                  style={{
                    width: '50px',
                    height: '32px',
                    borderRadius: 'var(--admin-radius-sm)',
                    overflow: 'hidden',
                    background: '#f3f4f6',
                    border: '1px solid var(--admin-border-light)',
                  }}
                >
                  {b.coverImage ? (
                    <img src={b.coverImage} alt={b.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: '#d1d5db' }} />
                  )}
                </div>
              ),
            },
            {
              key: 'title',
              header: 'Article Title',
              render: (b) => (
                <div>
                  <div style={{ fontWeight: 600 }}>{b.title}</div>
                  <div style={{ fontSize: '11px', color: 'var(--admin-text-secondary)' }}>
                    Author: {b.authorName} | Slug: {b.slug}
                  </div>
                </div>
              ),
            },
            {
              key: 'categoryName',
              header: 'Category',
            },
            {
              key: 'status',
              header: 'Status',
              render: (b) =>
                b.publishedAt ? (
                  <span className="admin-badge success">
                    <Eye size={12} /> Published
                  </span>
                ) : (
                  <span className="admin-badge warning">
                    <EyeOff size={12} /> Draft Mode
                  </span>
                ),
            },
            {
              key: 'viewCount',
              header: 'Views',
            },
            {
              key: 'actions',
              header: '',
              render: (b) => (
                <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                  <button className="admin-btn admin-btn-ghost admin-btn-icon" onClick={() => handleOpenEdit(b)}>
                    <Edit2 size={13} />
                  </button>
                  <button
                    className="admin-btn admin-btn-ghost admin-btn-icon"
                    style={{ color: 'var(--admin-danger-text)' }}
                    onClick={() => setDeleteId(b.id)}
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
            <form onSubmit={handleSaveBlog}>
              <div className="admin-modal-header">
                <span className="admin-modal-title">{editId ? 'Edit Blog Article' : 'Compose New Article'}</span>
                <button type="button" className="admin-modal-close" onClick={() => setIsModalOpen(false)}>
                  <X size={15} />
                </button>
              </div>
              
              <div className="admin-modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <div className="admin-grid-2">
                  <AdminFormField label="Article Title" required>
                    <input
                      type="text"
                      className="admin-input"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </AdminFormField>

                  <AdminFormField label="URL Slug">
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="e.g. brutalist-concrete-revival"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                    />
                  </AdminFormField>
                </div>

                <div className="admin-grid-2">
                  <AdminFormField label="Topic Category">
                    <select
                      className="admin-select"
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                    >
                      <option value="">Uncategorized</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </AdminFormField>

                  <AdminFormField label="Author Name" required>
                    <input
                      type="text"
                      className="admin-input"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      required
                    />
                  </AdminFormField>
                </div>

                <AdminFormField label="Excerpt Summary">
                  <textarea
                    className="admin-textarea"
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    style={{ minHeight: '60px' }}
                  />
                </AdminFormField>

                <AdminFormField label="Article Content (Markdown supported)" required>
                  <textarea
                    className="admin-textarea"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    style={{ minHeight: '200px' }}
                    required
                  />
                </AdminFormField>

                <div className="admin-grid-2">
                  <AdminFormField label="Article Cover image url">
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="https://images.unsplash.com..."
                      value={coverImage}
                      onChange={(e) => setCoverImage(e.target.value)}
                    />
                  </AdminFormField>

                  <AdminFormField label="Upload New Cover File">
                    <input type="file" accept="image/*" className="admin-input" onChange={handleFileChange} />
                    {uploading && (
                      <div className="admin-progress" style={{ marginTop: '8px' }}>
                        <div className="admin-progress-bar" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    )}
                  </AdminFormField>
                </div>

                <AdminFormField label="Tags / Keywords">
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="Add tag (e.g. marble)..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    />
                    <button type="button" className="admin-btn admin-btn-secondary" onClick={handleAddTag}>
                      Add
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {tags.map((tag, idx) => (
                      <span key={idx} className="admin-tag">
                        #{tag}
                        <button type="button" className="admin-tag-remove" onClick={() => handleRemoveTag(idx)}>
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                </AdminFormField>

                <div className="admin-checkbox-group" style={{ marginTop: '16px' }}>
                  <input
                    type="checkbox"
                    id="publishCheck"
                    className="admin-checkbox"
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                  />
                  <label htmlFor="publishCheck" className="admin-form-label" style={{ marginBottom: 0, cursor: 'pointer' }}>
                    Publish immediately (Visible in live list)
                  </label>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  <Save size={16} /> Save Post
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
        title="Delete Post"
        message="Are you sure you want to delete this blog post permanently? This action cannot be undone."
        loading={deleteLoading}
      />
    </div>
  );
}
