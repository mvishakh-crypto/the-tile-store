// ============================================================
// useSearch — Debounced search with suggestions, recent & popular
// ============================================================
import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryClient';
import {
  globalSearch,
  getSearchSuggestions,
  getPopularSearches,
  getRecentSearches,
  saveRecentSearch,
  clearRecentSearches,
  logSearchResultClick,
  type SearchResult,
  type SearchSuggestion,
  type SearchFilters,
} from '../services/searchService';
import type { TileProduct } from '../types';

const DEBOUNCE_MS = 280;
const MIN_QUERY_LENGTH = 2;

// ============================================================
// MAIN SEARCH HOOK
// ============================================================
export function useSearch(initialFilters?: SearchFilters) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>(initialFilters || {});
  const [recentSearches, setRecentSearches] = useState<string[]>(getRecentSearches());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce the query
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Search results
  const searchQuery = useQuery({
    queryKey: queryKeys.search.results(debouncedQuery, filters),
    queryFn: () => globalSearch(debouncedQuery, filters),
    enabled: debouncedQuery.length >= MIN_QUERY_LENGTH || Object.keys(filters).some(k => !!(filters as Record<string, unknown>)[k]),
    staleTime: 2 * 60 * 1000,
  });

  // Autocomplete suggestions
  const suggestionsQuery = useQuery({
    queryKey: queryKeys.search.suggestions(debouncedQuery),
    queryFn: () => getSearchSuggestions(debouncedQuery),
    enabled: debouncedQuery.length >= MIN_QUERY_LENGTH,
    staleTime: 60 * 1000,
  });

  // Popular searches
  const popularQuery = useQuery({
    queryKey: queryKeys.search.popular(),
    queryFn: getPopularSearches,
    staleTime: 10 * 60 * 1000,
  });

  // Handle search submission
  const handleSearch = useCallback((q: string) => {
    setQuery(q);
    setDebouncedQuery(q);
    if (q.trim()) {
      saveRecentSearch(q.trim());
      setRecentSearches(getRecentSearches());
    }
  }, []);

  // Handle result click logging
  const handleResultClick = useCallback((product: TileProduct) => {
    if (debouncedQuery) {
      void logSearchResultClick(debouncedQuery, product.id);
    }
  }, [debouncedQuery]);

  // Clear recent searches
  const handleClearRecent = useCallback(() => {
    clearRecentSearches();
    setRecentSearches([]);
  }, []);

  const updateFilter = useCallback((key: keyof SearchFilters, value: string | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const isEmpty = debouncedQuery.length < MIN_QUERY_LENGTH && Object.keys(filters).length === 0;

  return {
    // State
    query,
    debouncedQuery,
    filters,
    recentSearches,

    // Results
    results: searchQuery.data as SearchResult | undefined,
    suggestions: suggestionsQuery.data as SearchSuggestion[] | undefined,
    popularSearches: popularQuery.data as string[] | undefined,

    // Loading states
    isSearching: searchQuery.isFetching,
    isLoadingSuggestions: suggestionsQuery.isFetching,
    isEmpty,
    hasResults: !!searchQuery.data?.products.length,

    // Handlers
    setQuery,
    handleSearch,
    handleResultClick,
    handleClearRecent,
    updateFilter,
    clearFilters,
  };
}

// ============================================================
// SEARCH SUGGESTIONS ONLY (for inline use in input fields)
// ============================================================
export function useSearchSuggestions(partial: string) {
  return useQuery({
    queryKey: queryKeys.search.suggestions(partial),
    queryFn: () => getSearchSuggestions(partial),
    enabled: partial.length >= MIN_QUERY_LENGTH,
    staleTime: 30 * 1000,
  });
}
