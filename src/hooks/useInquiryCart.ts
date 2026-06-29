// ============================================================
// useInquiryCart — DB-backed inquiry cart hook
// ============================================================
import { useState, useEffect, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  addToInquiryCart,
  updateInquiryCartItem,
  removeFromInquiryCart,
  clearInquiryCart,
  submitInquiry,
  type InquirySubmissionResult,
} from '../services/inquiryService';
import { checkRateLimit, RATE_LIMITS } from '../lib/validation';
import type { TileProduct } from '../types';
import type { InquiryItem } from '../components/InquiryCartDrawer';
import type { InquiryFormData } from '../lib/validation';

const CART_STORAGE_KEY = 'atelier-inquiry-cart';

function loadLocalCart(): InquiryItem[] {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveLocalCart(items: InquiryItem[]): void {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Silent fail
  }
}

// ============================================================
// INQUIRY CART HOOK
// Drop-in replacement for the existing App.tsx inquiry cart state.
// ============================================================
export function useInquiryCart(userId?: string | null) {
  const [items, setItems] = useState<InquiryItem[]>(() => loadLocalCart());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmissionResult, setLastSubmissionResult] =
    useState<InquirySubmissionResult | null>(null);

  // Sync to localStorage
  useEffect(() => {
    saveLocalCart(items);
  }, [items]);

  // Add mutation
  const addMutation = useMutation({
    mutationFn: (product: TileProduct) => addToInquiryCart(product, userId),
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ productId, updates }: {
      productId: string;
      updates: Partial<{ quantity: number; notes: string }>;
    }) => updateInquiryCartItem(productId, updates, userId),
  });

  // Remove mutation
  const removeMutation = useMutation({
    mutationFn: (productId: string) => removeFromInquiryCart(productId, userId),
  });

  const handleAddToCart = useCallback((product: TileProduct) => {
    if (items.some(item => item.product.id === product.id)) return;

    // Optimistic update
    setItems(prev => [...prev, { product, quantity: 1, notes: '' }]);

    // Background sync to DB
    addMutation.mutate(product);
  }, [items, addMutation]);

  const handleUpdateItem = useCallback(
    (productId: string, updates: Partial<InquiryItem>) => {
      setItems(prev =>
        prev.map(item =>
          item.product.id === productId ? { ...item, ...updates } : item
        )
      );

      const dbUpdates: Partial<{ quantity: number; notes: string }> = {};
      if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

      if (Object.keys(dbUpdates).length > 0) {
        updateMutation.mutate({ productId, updates: dbUpdates });
      }
    },
    [updateMutation]
  );

  const handleRemoveItem = useCallback((productId: string) => {
    setItems(prev => prev.filter(item => item.product.id !== productId));
    removeMutation.mutate(productId);
  }, [removeMutation]);

  const handleClearAll = useCallback(async () => {
    setItems([]);
    await clearInquiryCart(userId);
  }, [userId]);

  const handleSubmitInquiry = useCallback(
    async (formData: InquiryFormData): Promise<InquirySubmissionResult> => {
      // Client-side rate limiting
      const rateCheck = checkRateLimit(
        RATE_LIMITS.INQUIRY_SUBMIT.key,
        RATE_LIMITS.INQUIRY_SUBMIT.max,
        RATE_LIMITS.INQUIRY_SUBMIT.windowMs
      );

      if (!rateCheck.allowed) {
        const result: InquirySubmissionResult = {
          success: false,
          error: `Too many submissions. Please try again in ${Math.ceil(rateCheck.resetIn / 1000)} seconds.`,
        };
        setLastSubmissionResult(result);
        return result;
      }

      setIsSubmitting(true);
      try {
        const result = await submitInquiry(formData, items, userId);
        if (result.success) {
          setItems([]);
        }
        setLastSubmissionResult(result);
        return result;
      } finally {
        setIsSubmitting(false);
      }
    },
    [items, userId]
  );

  const isInCart = useCallback(
    (productId: string) => items.some(item => item.product.id === productId),
    [items]
  );

  return {
    items,
    itemCount: items.length,
    addToCart: handleAddToCart,
    updateItem: handleUpdateItem,
    removeItem: handleRemoveItem,
    clearAll: handleClearAll,
    submitInquiry: handleSubmitInquiry,
    isInCart,
    isSubmitting,
    lastSubmissionResult,
  };
}
