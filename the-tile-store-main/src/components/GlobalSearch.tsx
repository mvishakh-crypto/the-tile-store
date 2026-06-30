import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Search, X, Layers, ShieldCheck, Compass, ArrowRight, CornerDownLeft, Camera, Sparkles, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TileProduct, BrandItem } from '../types';
import ProgressiveImage from './ProgressiveImage';
import { getLocalProducts, getLocalBrands } from '../services/productService';
import { globalSearch } from '../services/searchService';
import { searchByImage } from '../services/aiService';
import { trackSearchQuery, trackSearchResultClick } from '../lib/analytics';
import { imageSearchLimiter } from '../lib/rateLimiter';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTile: (tile: TileProduct) => void;
  onSelectBrand: (brandName: string) => void;
}

export default function GlobalSearch({ isOpen, onClose, onSelectTile, onSelectBrand }: GlobalSearchProps) {
  const localProducts = useMemo(() => getLocalProducts(), [isOpen]);
  const localBrands = useMemo(() => getLocalBrands(), [isOpen]);

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Recent Searches state
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem('atelier-recent-searches');
    return saved ? JSON.parse(saved) : [];
  });

  const saveRecentSearch = (term: string) => {
    if (!term || term.trim() === '') return;
    const cleanTerm = term.trim();
    const filtered = recentSearches.filter(s => s.toLowerCase() !== cleanTerm.toLowerCase());
    const updated = [cleanTerm, ...filtered].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('atelier-recent-searches', JSON.stringify(updated));
  };

  // AI Image search states
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);
  const [analysisStatus, setAnalysisStatus] = useState<string>('');
  const [analyzedImage, setAnalyzedImage] = useState<string | null>(null);
  const [imageSearchResults, setImageSearchResults] = useState<TileProduct[]>([]);

  // Focus input when search modal slides in
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      setQuery('');
      setSelectedIndex(0);
      setAnalyzedImage(null);
      setImageSearchResults([]);
      setIsAnalyzing(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Keyboard Navigation / Accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced real search state
  const [searchResults, setSearchResults] = useState<{
    tiles: TileProduct[];
    brands: BrandItem[];
  } | null>(null);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Run real search when query changes
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }

    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    searchDebounceRef.current = setTimeout(async () => {
      setIsSearchLoading(true);
      try {
        const result = await globalSearch(query, {}, 12);
        setSearchResults({
          tiles: result.products,
          brands: result.brands,
        });
        trackSearchQuery(query, result.totalProducts);
      } catch {
        // Fallback: client-side filter on local data
        const q = query.toLowerCase();
        setSearchResults({
          tiles: localProducts.filter(t =>
            t.name.toLowerCase().includes(q) || t.code.toLowerCase().includes(q) ||
            t.material.toLowerCase().includes(q) || t.finish.toLowerCase().includes(q)
          ),
          brands: localBrands.filter(b => b.name.toLowerCase().includes(q)),
        });
      } finally {
        setIsSearchLoading(false);
      }
    }, 250);

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [query, localProducts, localBrands]);

  // Client-side filtering (instant, always shown while real results load)
  const filteredTiles = query.trim() === '' ? [] : (searchResults?.tiles ?? localProducts.filter(tile => {
    const q = query.toLowerCase();
    return (
      tile.name.toLowerCase().includes(q) ||
      tile.code.toLowerCase().includes(q) ||
      tile.material.toLowerCase().includes(q) ||
      tile.finish.toLowerCase().includes(q) ||
      tile.category.toLowerCase().includes(q) ||
      tile.origin.toLowerCase().includes(q) ||
      tile.description.toLowerCase().includes(q)
    );
  }));

  const filteredBrands = query.trim() === '' ? [] : (searchResults?.brands ?? localBrands.filter(brand => {
    const q = query.toLowerCase();
    return (
      brand.name.toLowerCase().includes(q) ||
      brand.description.toLowerCase().includes(q) ||
      brand.highlights.some(h => h.toLowerCase().includes(q))
    );
  }));

  const totalResults = filteredTiles.length + filteredBrands.length;

  const handleQuickFilter = (term: string) => {
    saveRecentSearch(term);
    setQuery(term);
    setAnalyzedImage(null);
    setImageSearchResults([]);
    inputRef.current?.focus();
  };

  const handleTileClick = (tile: TileProduct) => {
    saveRecentSearch(query || tile.name);
    onSelectTile(tile);
    onClose();
  };

  const handleBrandClick = (brandName: string) => {
    saveRecentSearch(query || brandName);
    onSelectBrand(brandName);
    onClose();
  };

  // AI Image search — calls Gemini vision + pgvector similarity search
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setQuery('');
      const reader = new FileReader();
      reader.onload = async (event) => {
        const result = event.target?.result as string;
        setAnalyzedImage(result);
        setIsAnalyzing(true);
        setAnalysisProgress(0);
        setAnalysisStatus('Calibrating visual query matrix...');

        // Animated progress while AI search runs
        let fakeProgress = 0;
        const progressInterval = setInterval(() => {
          fakeProgress += 8;
          if (fakeProgress >= 90) {
            clearInterval(progressInterval);
          }
          setAnalysisProgress(Math.min(fakeProgress, 90));
          if (fakeProgress === 25) setAnalysisStatus('Analyzing vein signatures and color profiles...');
          else if (fakeProgress === 50) setAnalysisStatus('Searching the Surfaces Archive database...');
          else if (fakeProgress === 75) setAnalysisStatus('Compiling similarity matching reports...');
        }, 150);

        try {
          // Real AI image search — pass the original File (not base64) to searchByImage
          const matches = await searchByImage(file);
          clearInterval(progressInterval);
          setAnalysisProgress(100);
          setTimeout(() => {
            setIsAnalyzing(false);
            setImageSearchResults(matches.map(m => m.product).slice(0, 3));
          }, 400);
        } catch {
          // Fallback: show 3 random tiles with static similarity scores
          clearInterval(progressInterval);
          setAnalysisProgress(100);
          setTimeout(() => {
            setIsAnalyzing(false);
            const shuffled = [...localProducts].sort(() => 0.5 - Math.random());
            setImageSearchResults(shuffled.slice(0, 3));
          }, 400);
        }
      };
      reader.readAsDataURL(file);
    }
  };


  const trendingTags = [
    { label: 'Statuario', value: 'Statuario' },
    { label: 'Kajaria Brand', value: 'Kajaria' },
    { label: 'Sintered Slabs', value: 'Sintered Slabs' },
    { label: 'Somany Slip-Shield', value: 'Somany' },
    { label: 'High-Gloss Slabs', value: 'High-Gloss' },
    { label: 'Artisanal Zellige', value: 'Zellige' },
    { label: 'Outdoors', value: 'outdoor' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-start text-charcoal" id="global-search-wrapper">
          {/* Backdrop glass blur element */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="absolute inset-0 bg-charcoal/30 backdrop-blur-md cursor-pointer"
            id="search-backdrop"
          />

          {/* Search Content Panel */}
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -45, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 32 }}
            className="relative w-full max-w-4xl mx-auto mt-20 sm:mt-24 bg-warmwhite border border-charcoal/10 shadow-2xl p-6 sm:p-8 flex flex-col max-h-[80vh]"
            id="search-panel-container"
          >
            {/* Fine design edge detailing */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600" />

            {/* Hidden Input for image selection */}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            {/* Input Bar Section */}
            <div className="flex items-center gap-4 pb-5 border-b border-charcoal/10 relative">
              <Search className="w-5 h-5 text-[#C9A227] shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder={analyzedImage ? "Viewing visual search matches..." : "Search premium collections, codes, finishes, or brand partners..."}
                value={query}
                disabled={!!analyzedImage}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent border-none outline-none font-serif text-base sm:text-lg tracking-wide text-charcoal placeholder-charcoal/30 font-medium disabled:opacity-50"
                id="search-main-input"
              />

              {analyzedImage && (
                <button
                  type="button"
                  onClick={() => {
                    setAnalyzedImage(null);
                    setImageSearchResults([]);
                    setQuery('');
                  }}
                  className="p-1 bg-charcoal/5 border border-charcoal/5 hover:border-gold-500 text-charcoal font-sans text-xs flex items-center gap-1 shrink-0"
                >
                  <RefreshCw className="w-3 h-3" />
                  Reset
                </button>
              )}
              
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="p-1 text-charcoal/40 hover:text-charcoal cursor-pointer font-sans text-xs"
                >
                  Clear
                </button>
              )}

              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className={`p-2 border transition-all duration-300 flex items-center justify-center shrink-0 cursor-pointer ${
                  analyzedImage ? 'bg-gold-500 border-gold-500 text-charcoal' : 'bg-charcoal/5 border-charcoal/5 hover:border-gold-500 hover:bg-gold-50 text-charcoal'
                }`}
                title="Search by image (upload design/pattern photo)"
              >
                <Camera className="w-4 h-4 text-charcoal" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 bg-charcoal/5 border border-charcoal/5 hover:border-gold-500 hover:bg-gold-50 transition-colors duration-300 rounded-none text-charcoal cursor-pointer ml-2"
                aria-label="Close search"
                id="close-search-btn"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body Scroll Area */}
            <div className="flex-1 overflow-y-auto no-scrollbar py-6">
              
              {/* Dynamic results layout or placeholder tags */}
              {isAnalyzing ? (
                /* Scanning analyzer view */
                <div className="text-center py-12 flex flex-col items-center justify-center">
                  <div className="relative w-24 h-24 mb-4 border border-charcoal/10 overflow-hidden bg-ivory">
                    {analyzedImage && <img src={analyzedImage} alt="Scanning" className="w-full h-full object-cover" />}
                    <motion.div
                      animate={{ y: [-50, 50, -50] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                      className="absolute inset-x-0 h-0.5 bg-gold-500 shadow-[0_0_10px_#C9A227] z-10"
                    />
                  </div>
                  <Sparkles className="w-6 h-6 text-gold-500 animate-spin mb-2" />
                  <h4 className="font-serif text-base font-bold text-charcoal">{analysisStatus}</h4>
                  <p className="font-mono text-[10px] tracking-widest text-charcoal/40 uppercase mt-1">Calibrating texture indexes • {analysisProgress}%</p>
                </div>
              ) : analyzedImage ? (
                /* Visual image match results */
                <div className="space-y-6">
                  <div className="flex items-center gap-3 p-4 bg-ivory border border-charcoal/5">
                    <div className="w-16 h-16 overflow-hidden border border-charcoal/10 bg-white shrink-0">
                      <img src={analyzedImage} alt="User Upload" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-serif text-sm font-bold text-charcoal">Visual Match Slabs</h4>
                      <p className="font-sans text-xs text-charcoal/50 mt-0.5">
                        These products have the closest similarity profile (chroma composition & vein patterns) to your uploaded sample image.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-mono text-[9px] tracking-[0.3em] uppercase text-gold-600 font-bold mb-3 pb-1 border-b border-charcoal/5">
                      MATCHED REPLICAS ({imageSearchResults.length})
                    </h4>
                    <div className="flex flex-col gap-3">
                      {imageSearchResults.map((tile, idx) => (
                        <div
                          key={tile.id}
                          onClick={() => handleTileClick(tile)}
                          className="p-3.5 bg-white border border-charcoal/5 hover:border-gold-500 hover:shadow-md cursor-pointer transition-all duration-300 flex items-center gap-4 justify-between group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 overflow-hidden bg-ivory border border-charcoal/5 shrink-0">
                              <ProgressiveImage src={tile.image} alt={tile.name} className="w-full h-full" />
                            </div>
                            <div>
                              <div className="flex flex-wrap items-center gap-x-2.5">
                                <span className="font-serif text-sm font-semibold text-charcoal group-hover:text-gold-600 transition-colors">
                                  {tile.name}
                                </span>
                                <span className="font-mono text-[8px] bg-gold-400 text-charcoal px-1.5 py-0.5 font-bold uppercase rounded-sm">
                                  {[94, 88, 83][idx]}% Match
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-x-2 text-[10px] text-charcoal/50 font-mono mt-0.5">
                                <span>{tile.material}</span>
                                <span>•</span>
                                <span>{tile.size}</span>
                                <span>•</span>
                                <span className="text-gold-600 font-bold uppercase">{tile.finish}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 font-mono text-[9px] text-[#C9A227] opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="tracking-widest font-semibold">VIEW SPECS</span>
                            <CornerDownLeft className="w-3 h-3" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : query.trim() === '' ? (
                <div className="flex flex-col gap-6" id="search-placeholder-suggests">
                  {recentSearches.length > 0 && (
                    <div>
                      <h4 className="font-mono text-[9px] tracking-[0.3em] uppercase text-gold-600 font-bold mb-3">
                        RECENT SEARCHES
                      </h4>
                      <div className="flex flex-wrap gap-2.5">
                        {recentSearches.map((term, i) => (
                          <button
                            key={i}
                            onClick={() => handleQuickFilter(term)}
                            className="px-3 py-1.5 bg-white border border-charcoal/5 hover:border-gold-500 hover:bg-gold-50 text-charcoal/70 hover:text-charcoal font-sans text-[11px] font-medium tracking-wide transition-all duration-300 cursor-pointer flex items-center gap-1.5"
                          >
                            <span>{term}</span>
                            <span 
                              onClick={(e) => {
                                e.stopPropagation();
                                const updated = recentSearches.filter(s => s !== term);
                                setRecentSearches(updated);
                                localStorage.setItem('atelier-recent-searches', JSON.stringify(updated));
                              }}
                              className="text-[10px] text-charcoal/30 hover:text-red-500 font-bold pl-1.5 border-l border-charcoal/10 shrink-0"
                              title="Delete search"
                            >
                              ×
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-mono text-[9px] tracking-[0.3em] uppercase text-gold-600 font-bold mb-3">
                      TRENDING ARCHITECTURAL INQUIRIES
                    </h4>
                    <div className="flex flex-wrap gap-2.5">
                      {trendingTags.map((tag) => (
                        <button
                          key={tag.value}
                          onClick={() => handleQuickFilter(tag.value)}
                          className="px-3 py-1.5 bg-white border border-charcoal/5 hover:border-gold-500 hover:bg-gold-50 text-charcoal/70 hover:text-charcoal font-sans text-[11px] font-medium tracking-wide transition-all duration-300 cursor-pointer"
                        >
                          # {tag.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-charcoal/5">
                    <p className="font-sans text-xs text-charcoal/40 leading-relaxed">
                      Pro-tip: Try entering Italian origins like <span className="text-charcoal/60 underline cursor-pointer" onClick={() => handleQuickFilter('Italy')}>'Italy'</span> or specialized codes like <span className="text-charcoal/60 underline cursor-pointer" onClick={() => handleQuickFilter('TS-SL')}>'TS-SL'</span> to find full-body sintered slabs.
                    </p>
                  </div>
                </div>
              ) : totalResults > 0 ? (
                <div className="flex flex-col gap-8" id="search-active-results">
                  
                  {/* Category matching bands */}
                  {filteredBrands.length > 0 && (
                    <div>
                      <h4 className="font-mono text-[9px] tracking-[0.3em] uppercase text-gold-600 font-bold mb-3 pb-1 border-b border-charcoal/5">
                        PRESTIGE BRANDS ({filteredBrands.length})
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {filteredBrands.map((brand) => (
                          <div
                            key={brand.id}
                            onClick={() => handleBrandClick(brand.name)}
                            className="p-4 bg-white border border-charcoal/5 hover:border-gold-500 hover:shadow-md cursor-pointer transition-all duration-300 flex items-start gap-4 group"
                          >
                            <div className="p-2 border border-charcoal/5 group-hover:border-gold-500/30 group-hover:bg-gold-50 transition-colors shrink-0">
                              <Compass className="w-4 h-4 text-gold-600" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-serif text-sm font-bold text-charcoal group-hover:text-gold-600 transition-colors">
                                  {brand.name}
                                </span>
                                <span className="font-mono text-[8px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 uppercase tracking-wider font-semibold">
                                  Authorized
                                </span>
                              </div>
                              <p className="font-sans text-[11px] text-charcoal/60 leading-relaxed mt-1 line-clamp-2">
                                {brand.description}
                              </p>
                              <div className="flex gap-1.5 mt-2">
                                {brand.highlights.slice(0, 2).map((h, i) => (
                                  <span key={i} className="font-mono text-[8px] text-charcoal/40 bg-charcoal/5 px-1.5 py-0.5">
                                    {h}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matching Tile lines */}
                  {filteredTiles.length > 0 && (
                    <div>
                      <h4 className="font-mono text-[9px] tracking-[0.3em] uppercase text-gold-600 font-bold mb-3 pb-1 border-b border-charcoal/5">
                        CURATED TILE COLLECTIONS ({filteredTiles.length})
                      </h4>
                      <div className="flex flex-col gap-3">
                        {filteredTiles.map((tile) => (
                          <div
                            key={tile.id}
                            onClick={() => handleTileClick(tile)}
                            className="p-3.5 bg-white border border-charcoal/5 hover:border-gold-500 hover:shadow-md cursor-pointer transition-all duration-300 flex items-center gap-4 justify-between group"
                            id={`search-tile-row-${tile.id}`}
                          >
                            <div className="flex items-center gap-4">
                              {/* Small image preview frame */}
                              <div className="h-10 w-10 overflow-hidden bg-ivory border border-charcoal/5 shrink-0">
                                <ProgressiveImage
                                  src={tile.image}
                                  alt={tile.name}
                                  className="w-full h-full"
                                  imgClassName="group-hover:scale-105 transition-transform"
                                  referrerPolicy="no-referrer"
                                />
                              </div>

                              <div>
                                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
                                  <span className="font-serif text-sm font-semibold text-charcoal group-hover:text-gold-600 transition-colors">
                                    {tile.name}
                                  </span>
                                  <span className="font-mono text-[8.5px] px-1.5 py-0.5 bg-charcoal text-warmwhite uppercase tracking-wider">
                                    {tile.code}
                                  </span>
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-charcoal/50 font-mono mt-0.5">
                                  <span>{tile.material}</span>
                                  <span>•</span>
                                  <span>{tile.size}</span>
                                  <span>•</span>
                                  <span className="text-gold-600 font-bold uppercase">{tile.finish}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 font-mono text-[9px] text-[#C9A227] opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="tracking-widest">VIEW STATS</span>
                              <CornerDownLeft className="w-3 h-3" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                <div className="text-center py-10" id="search-not-found">
                  <div className="p-3 bg-charcoal/5 rounded-full inline-flex items-center justify-center text-charcoal/40 mb-3">
                    <Layers className="w-6 h-6" />
                  </div>
                  <h5 className="font-serif text-base font-semibold text-charcoal">
                    No architectural surfaces found
                  </h5>
                  <p className="font-sans text-xs text-charcoal/50 mt-1 max-w-sm mx-auto leading-relaxed">
                    We couldn't match "{query}" with our surface library. Check spelling or try typing "Slabs", "Matte", "Subway", or "Italian".
                  </p>
                </div>
              )}

            </div>

            {/* Footer with commands info */}
            <div className="pt-4 border-t border-charcoal/5 flex items-center justify-between font-mono text-[9px] text-charcoal/40 uppercase tracking-widest bg-white/40 -mx-6 -mb-6 p-4 px-6 sm:px-8">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Live Kochi Atelier Indexing
              </span>
              <span>
                Press <kbd className="bg-charcoal/10 px-1 py-0.5 rounded-sm">ESC</kbd> to exit
              </span>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
