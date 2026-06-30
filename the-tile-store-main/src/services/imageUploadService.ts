// @ts-nocheck
// ============================================================
// Image Upload Service — Enterprise image pipeline
// Handles product images, room photos, moodboard exports, blog covers
// Ready for admin uploads (images can be added later by the owner)
// ============================================================
import { supabase, isSupabaseConfigured, STORAGE_BUCKETS, handleSupabaseError } from '../lib/supabase';
import { getLocalProducts, saveLocalProducts } from './productService';

// ============================================================
// TYPES
// ============================================================

export interface UploadOptions {
  onProgress?: (percent: number) => void;
  maxSizeMB?: number;
  allowedTypes?: string[];
}

export interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

export interface ProductImageUploadResult extends UploadResult {
  imageId?: string;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  altText: string | null;
  isPrimary: boolean;
  sortOrder: number;
  storagePath: string | null;
  createdAt: string;
}

// ============================================================
// VALIDATION
// ============================================================

const DEFAULT_ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];
const DEFAULT_MAX_SIZE_MB = 10;

function validateImageFile(file: File, options?: UploadOptions): string | null {
  const allowedTypes = options?.allowedTypes ?? DEFAULT_ALLOWED_TYPES;
  const maxSizeMB = options?.maxSizeMB ?? DEFAULT_MAX_SIZE_MB;

  if (!allowedTypes.includes(file.type)) {
    return `File type "${file.type}" is not supported. Allowed: ${allowedTypes.join(', ')}`;
  }

  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > maxSizeMB) {
    return `File size (${sizeMB.toFixed(1)} MB) exceeds the limit of ${maxSizeMB} MB`;
  }

  return null; // valid
}

/**
 * Generate a sanitized storage path for a file.
 */
function generateStoragePath(prefix: string, fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() || 'jpg';
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 8);
  return `${prefix}/${timestamp}-${random}.${ext}`;
}

// ============================================================
// PRODUCT IMAGES
// ============================================================

/**
 * Upload a product image to Supabase Storage and register it in product_images table.
 * The admin will use this after Supabase is connected.
 * In static mode: validates and returns a mock result.
 */
export async function uploadProductImage(
  file: File,
  productId: string,
  options?: UploadOptions & {
    altText?: string;
    isPrimary?: boolean;
    sortOrder?: number;
  }
): Promise<ProductImageUploadResult> {
  // Validate file
  const validationError = validateImageFile(file, options);
  if (validationError) {
    return { success: false, error: validationError };
  }

  if (!isSupabaseConfigured) {
    console.info('[ImageUploadService] Static mode: simulating product image upload');
    options?.onProgress?.(100);

    // Convert file to base64 Data URL for persistence
    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

    const newImage: ProductImage = {
      id: `sim-img-${Date.now()}`,
      productId: productId,
      url: dataUrl,
      altText: options?.altText || null,
      isPrimary: options?.isPrimary ?? false,
      sortOrder: options?.sortOrder ?? 0,
      storagePath: null,
      createdAt: new Date().toISOString(),
    };

    try {
      const stored = localStorage.getItem('tts-local-product-images');
      const list = stored ? JSON.parse(stored) : [];
      list.push(newImage);
      localStorage.setItem('tts-local-product-images', JSON.stringify(list));

      if (newImage.isPrimary) {
        const localProducts = getLocalProducts();
        const updated = localProducts.map(p => p.id === productId ? { ...p, image: dataUrl } : p);
        saveLocalProducts(updated);
        window.dispatchEvent(new Event('storage'));
      }
    } catch (e) {
      console.error(e);
    }

    return {
      success: true,
      url: dataUrl,
      path: `tile-images/${productId}/primary.jpg`,
      imageId: newImage.id,
    };
  }

  try {
    const storagePath = generateStoragePath(`products/${productId}`, file.name);

    // Upload to Supabase Storage
    options?.onProgress?.(10);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKETS.TILE_IMAGES)
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError || !uploadData) {
      throw new Error(uploadError?.message || 'Upload failed');
    }

    options?.onProgress?.(70);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKETS.TILE_IMAGES)
      .getPublicUrl(uploadData.path);

    const publicUrl = urlData.publicUrl;

    // Register in product_images table
    const { data: imageRow, error: dbError } = await supabase
      .from('product_images')
      .insert({
        product_id: productId,
        url: publicUrl,
        alt_text: options?.altText || null,
        is_primary: options?.isPrimary ?? false,
        sort_order: options?.sortOrder ?? 0,
        storage_path: uploadData.path,
      })
      .select('id')
      .single();

    if (dbError || !imageRow) {
      // Storage upload succeeded but DB write failed — still return the URL
      console.warn('[ImageUploadService] DB write failed, but storage upload succeeded');
    }

    options?.onProgress?.(100);

    return {
      success: true,
      url: publicUrl,
      path: uploadData.path,
      imageId: imageRow?.id || null,
    };
  } catch (err) {
    const apiError = handleSupabaseError(err);
    return { success: false, error: apiError.message };
  }
}

/**
 * Upload multiple product images at once.
 * Returns an array of results (some may succeed, some may fail).
 */
export async function uploadProductImages(
  files: File[],
  productId: string,
  options?: UploadOptions
): Promise<ProductImageUploadResult[]> {
  const results: ProductImageUploadResult[] = [];
  let completed = 0;

  for (const file of files) {
    const result = await uploadProductImage(file, productId, {
      ...options,
      isPrimary: completed === 0 && results.length === 0,
      sortOrder: completed,
      onProgress: (pct) => {
        // Overall progress across all files
        const overallPct = Math.round(
          ((completed + pct / 100) / files.length) * 100
        );
        options?.onProgress?.(overallPct);
      },
    });
    results.push(result);
    completed++;
  }

  return results;
}

/**
 * Get all images for a product from the database.
 */
export async function getProductImages(productId: string): Promise<ProductImage[]> {
  if (!isSupabaseConfigured) {
    try {
      const stored = localStorage.getItem('tts-local-product-images');
      if (!stored) return [];
      const list = JSON.parse(stored) as ProductImage[];
      return list
        .filter(img => img.productId === productId)
        .sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0) || a.sortOrder - b.sortOrder);
    } catch {
      return [];
    }
  }

  try {
    const { data, error } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', productId)
      .order('is_primary', { ascending: false })
      .order('sort_order', { ascending: true });

    if (error || !data) return [];

    return data.map((row) => ({
      id: row.id,
      productId: row.product_id,
      url: row.url,
      altText: row.alt_text,
      isPrimary: row.is_primary,
      sortOrder: row.sort_order,
      storagePath: row.storage_path,
      createdAt: row.created_at,
    }));
  } catch {
    return [];
  }
}

/**
 * Set a specific product image as the primary image.
 * Removes primary flag from other images for that product.
 */
export async function setProductPrimaryImage(
  productId: string,
  imageId: string
): Promise<boolean> {
  if (!isSupabaseConfigured) {
    try {
      const stored = localStorage.getItem('tts-local-product-images');
      if (stored) {
        let list = JSON.parse(stored) as ProductImage[];
        let primaryUrl = '';
        list = list.map(img => {
          if (img.productId === productId) {
            const isPrim = img.id === imageId;
            if (isPrim) primaryUrl = img.url;
            return { ...img, isPrimary: isPrim };
          }
          return img;
        });
        localStorage.setItem('tts-local-product-images', JSON.stringify(list));

        if (primaryUrl) {
          const localProducts = getLocalProducts();
          const updated = localProducts.map(p => p.id === productId ? { ...p, image: primaryUrl } : p);
          saveLocalProducts(updated);
          window.dispatchEvent(new Event('storage'));
        }
        return true;
      }
    } catch {
      return false;
    }
    return false;
  }

  try {
    // Remove primary from all
    await supabase
      .from('product_images')
      .update({ is_primary: false })
      .eq('product_id', productId);

    // Set this one as primary
    const { error } = await supabase
      .from('product_images')
      .update({ is_primary: true })
      .eq('id', imageId);

    return !error;
  } catch {
    return false;
  }
}

/**
 * Delete a product image from both Storage and the database.
 */
export async function deleteProductImage(imageId: string): Promise<boolean> {
  if (!isSupabaseConfigured) {
    try {
      const stored = localStorage.getItem('tts-local-product-images');
      if (stored) {
        let list = JSON.parse(stored) as ProductImage[];
        const targetImg = list.find(img => img.id === imageId);
        if (!targetImg) return false;
        
        list = list.filter(img => img.id !== imageId);
        localStorage.setItem('tts-local-product-images', JSON.stringify(list));

        if (targetImg.isPrimary) {
          const remaining = list.filter(img => img.productId === targetImg.productId);
          const nextPrim = remaining[0];
          if (nextPrim) {
            nextPrim.isPrimary = true;
            localStorage.setItem('tts-local-product-images', JSON.stringify(list));
          }
          
          const localProducts = getLocalProducts();
          const updated = localProducts.map(p => p.id === targetImg.productId ? { ...p, image: nextPrim ? nextPrim.url : '' } : p);
          saveLocalProducts(updated);
          window.dispatchEvent(new Event('storage'));
        }
        return true;
      }
    } catch {
      return false;
    }
    return false;
  }

  try {
    // Get the image to find its storage path
    const { data: image } = await supabase
      .from('product_images')
      .select('storage_path')
      .eq('id', imageId)
      .single();

    // Delete from storage if path exists
    if (image?.storage_path) {
      await supabase.storage
        .from(STORAGE_BUCKETS.TILE_IMAGES)
        .remove([image.storage_path]);
    }

    // Delete from database
    const { error } = await supabase
      .from('product_images')
      .delete()
      .eq('id', imageId);

    return !error;
  } catch {
    return false;
  }
}

// ============================================================
// ROOM UPLOADS (for visualizer + AI image search)
// ============================================================

/**
 * Upload a room photo for the Space Visualizer.
 * Anyone can upload (anonymous users included).
 */
export async function uploadRoomPhoto(
  file: File,
  sessionId: string,
  options?: UploadOptions
): Promise<UploadResult> {
  const validationError = validateImageFile(file, {
    ...options,
    maxSizeMB: options?.maxSizeMB ?? 15, // Rooms can be larger
  });

  if (validationError) {
    return { success: false, error: validationError };
  }

  if (!isSupabaseConfigured) {
    options?.onProgress?.(100);
    return {
      success: true,
      url: URL.createObjectURL(file),
      path: `room-uploads/rooms/${sessionId}-preview.jpg`,
    };
  }

  try {
    const storagePath = `rooms/${sessionId}-${Date.now()}.${file.name.split('.').pop() || 'jpg'}`;

    options?.onProgress?.(20);

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS.ROOM_UPLOADS)
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (error || !data) throw new Error(error?.message || 'Upload failed');

    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKETS.ROOM_UPLOADS)
      .getPublicUrl(data.path);

    options?.onProgress?.(100);

    return {
      success: true,
      url: urlData.publicUrl,
      path: data.path,
    };
  } catch (err) {
    const apiError = handleSupabaseError(err);
    return { success: false, error: apiError.message };
  }
}

// ============================================================
// BLOG COVER IMAGES (admin only)
// ============================================================

/**
 * Upload a blog cover image.
 * Admin-only in production (enforced by storage RLS policy).
 */
export async function uploadBlogCover(
  file: File,
  blogSlug: string,
  options?: UploadOptions
): Promise<UploadResult> {
  const validationError = validateImageFile(file, options);
  if (validationError) {
    return { success: false, error: validationError };
  }

  if (!isSupabaseConfigured) {
    options?.onProgress?.(100);
    return {
      success: true,
      url: URL.createObjectURL(file),
      path: `blog-covers/${blogSlug}.jpg`,
    };
  }

  try {
    const ext = file.name.split('.').pop() || 'jpg';
    const storagePath = `covers/${blogSlug}-${Date.now()}.${ext}`;

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS.BLOG_COVERS)
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: true, // Allow replacing existing cover
      });

    if (error || !data) throw new Error(error?.message || 'Upload failed');

    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKETS.BLOG_COVERS)
      .getPublicUrl(data.path);

    options?.onProgress?.(100);

    return {
      success: true,
      url: urlData.publicUrl,
      path: data.path,
    };
  } catch (err) {
    const apiError = handleSupabaseError(err);
    return { success: false, error: apiError.message };
  }
}

// ============================================================
// MOODBOARD EXPORTS
// ============================================================

/**
 * Upload a moodboard canvas export (PNG screenshot).
 */
export async function uploadMoodboardExport(
  blob: Blob,
  moodboardId: string
): Promise<UploadResult> {
  if (!isSupabaseConfigured) {
    return {
      success: true,
      url: URL.createObjectURL(blob),
      path: `moodboards/${moodboardId}.png`,
    };
  }

  try {
    const storagePath = `exports/${moodboardId}-${Date.now()}.png`;

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS.MOODBOARDS)
      .upload(storagePath, blob, {
        contentType: 'image/png',
        upsert: false,
      });

    if (error || !data) throw new Error(error?.message || 'Upload failed');

    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKETS.MOODBOARDS)
      .getPublicUrl(data.path);

    return {
      success: true,
      url: urlData.publicUrl,
      path: data.path,
    };
  } catch (err) {
    const apiError = handleSupabaseError(err);
    return { success: false, error: apiError.message };
  }
}

// ============================================================
// GENERIC DELETE
// ============================================================

/**
 * Delete any file from a storage bucket by path.
 */
export async function deleteStorageFile(
  bucket: string,
  path: string
): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);
    return !error;
  } catch {
    return false;
  }
}

// ============================================================
// UTILITY: Get optimized image URL
// ============================================================

/**
 * Get a resized/optimized version of a Supabase Storage image.
 * Falls back to the original URL if not a Supabase Storage URL.
 */
export function getOptimizedImageUrl(
  url: string,
  options?: { width?: number; height?: number; quality?: number }
): string {
  if (!isSupabaseConfigured || !url.includes('supabase')) {
    return url;
  }

  // Extract bucket and path from the public URL
  // Format: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
  const storageMatch = url.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)/);
  if (!storageMatch) return url;

  const [, bucket, path] = storageMatch;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path, {
    transform: {
      width: options?.width,
      height: options?.height,
      quality: options?.quality ?? 80,
      format: 'origin' as 'origin',
    },
  });

  return data.publicUrl;
}
