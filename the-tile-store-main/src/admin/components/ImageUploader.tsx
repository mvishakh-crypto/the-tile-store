import React, { useState, useRef } from 'react';
import { UploadCloud, X, Star, ArrowLeftRight, Trash2 } from 'lucide-react';
import { uploadProductImage, deleteProductImage, setProductPrimaryImage } from '../../services/imageUploadService';

interface ImageUploaderProps {
  productId: string;
  images: Array<{
    id: string;
    url: string;
    isPrimary: boolean;
    sortOrder: number;
  }>;
  onImagesChanged: () => void;
}

export default function ImageUploader({ productId, images, onImagesChanged }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    setProgress(10);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const res = await uploadProductImage(file, productId, {
          isPrimary: images.length === 0 && i === 0,
          sortOrder: images.length + i,
          onProgress: (percent) => setProgress(percent),
        });

        if (!res.success) {
          setError(res.error || 'Upload failed');
          break;
        }
      }
      onImagesChanged();
    } catch (err: any) {
      setError(err.message || 'An error occurred during upload');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFileChange(e.dataTransfer.files);
  };

  const handleDelete = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    try {
      const success = await deleteProductImage(imageId);
      if (success) {
        onImagesChanged();
      } else {
        setError('Failed to delete image');
      }
    } catch (err: any) {
      setError(err.message || 'Error deleting image');
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    try {
      const success = await setProductPrimaryImage(productId, imageId);
      if (success) {
        onImagesChanged();
      }
    } catch (err: any) {
      setError(err.message || 'Error setting primary image');
    }
  };

  return (
    <div>
      <div
        className={`admin-upload-zone ${dragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          multiple
          accept="image/*"
          onChange={(e) => handleFileChange(e.target.files)}
        />
        <UploadCloud className="admin-upload-zone-icon" />
        <div className="admin-upload-zone-text">
          Drag and drop your images here, or <span style={{ color: 'var(--admin-accent)', textDecoration: 'underline' }}>browse</span>
        </div>
        <div className="admin-upload-zone-hint">Supports JPEG, PNG, WEBP, AVIF (Max 10MB)</div>
      </div>

      {uploading && (
        <div style={{ marginTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
            <span>Uploading product gallery...</span>
            <span>{progress}%</span>
          </div>
          <div className="admin-progress">
            <div className="admin-progress-bar" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {error && (
        <div className="admin-alert danger" style={{ marginTop: '16px' }}>
          {error}
        </div>
      )}

      {images.length > 0 && (
        <div className="admin-image-grid">
          {images.map((img) => (
            <div key={img.id} className={`admin-image-thumb ${img.isPrimary ? 'primary' : ''}`}>
              <img src={img.url} alt="Product preview" />
              {img.isPrimary && <span className="admin-primary-badge">Primary</span>}
              <div className="admin-image-thumb-actions">
                {!img.isPrimary && (
                  <button
                    className="admin-image-thumb-btn"
                    onClick={() => handleSetPrimary(img.id)}
                    title="Make primary"
                  >
                    <Star size={12} fill="white" />
                  </button>
                )}
                <button
                  className="admin-image-thumb-btn"
                  onClick={() => handleDelete(img.id)}
                  title="Delete image"
                  style={{ color: 'var(--admin-danger)' }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
