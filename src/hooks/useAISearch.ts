// ============================================================
// useAISearch — Image-based AI tile search hook
// ============================================================
import React, { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { searchByImage, type ImageSearchResult } from '../services/aiService';
import { checkRateLimit, RATE_LIMITS } from '../lib/validation';

export function useAIImageSearch() {
  const [results, setResults] = useState<ImageSearchResult[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (file: File) => searchByImage(file, 8),
    onSuccess: (data) => {
      setResults(data);
      setRateLimitError(null);
    },
    onError: (error) => {
      console.error('[AI Image Search] Error:', error);
      setResults([]);
    },
  });

  const handleImageUpload = useCallback(async (file: File) => {
    // Rate limit check
    const rateCheck = checkRateLimit(
      RATE_LIMITS.AI_IMAGE_SEARCH.key,
      RATE_LIMITS.AI_IMAGE_SEARCH.max,
      RATE_LIMITS.AI_IMAGE_SEARCH.windowMs
    );

    if (!rateCheck.allowed) {
      setRateLimitError(
        `Search limit reached. Please wait ${Math.ceil(rateCheck.resetIn / 1000)} seconds.`
      );
      return;
    }

    setRateLimitError(null);

    // Create preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Run search
    mutation.mutate(file);
  }, [mutation]);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith('image/')) {
        void handleImageUpload(file);
      }
    },
    [handleImageUpload]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        void handleImageUpload(file);
      }
    },
    [handleImageUpload]
  );

  const clearSearch = useCallback(() => {
    setResults([]);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setRateLimitError(null);
  }, [previewUrl]);

  return {
    results,
    previewUrl,
    isSearching: mutation.isPending,
    hasResults: results.length > 0,
    error: mutation.error?.message || rateLimitError,
    handleImageUpload,
    handleDrop,
    handleFileInput,
    clearSearch,
  };
}
