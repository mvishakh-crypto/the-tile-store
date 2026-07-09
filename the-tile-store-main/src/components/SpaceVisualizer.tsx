import React, { useState, useMemo, useRef } from 'react';
import { spaceOptions } from '../data/tiles';
import { useProducts } from '../hooks/useProducts';
import { TileProduct, SpaceOption } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Layers, Sun, Moon, Sparkles, Sliders, Info, Download, ShieldCheck, Upload, Camera, X } from 'lucide-react';
import ProgressiveImage from './ProgressiveImage';

interface SpaceVisualizerProps {
  selectedTileFromParent: TileProduct | null;
  clearParentTileSelection: () => void;
}

export default function SpaceVisualizer({ selectedTileFromParent, clearParentTileSelection }: SpaceVisualizerProps) {
  const { data: productsData } = useProducts({}, { field: 'popularity_score', direction: 'desc' }, 1, 1000);
  const products = productsData?.products || [];

  const [activeSpace, setActiveSpace] = useState<SpaceOption>(spaceOptions[0]);
  const [selectedTileId, setSelectedTileId] = useState<string>(spaceOptions[0].defaultTileId);
  const [illuminationMode, setIlluminationMode] = useState<'day' | 'night'>('day');
  const [showSpecsOverlay, setShowSpecsOverlay] = useState<boolean>(true);
  const [downloadingSpecs, setDownloadingSpecs] = useState<boolean>(false);
  const [downloadSuccessNotify, setDownloadSuccessNotify] = useState<string>('');



  // Custom photo upload simulation states
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [isCustomActive, setIsCustomActive] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize tile selection if selected from parent component (e.g. tile archive click)
  useMemo(() => {
    if (selectedTileFromParent) {
      setSelectedTileId(selectedTileFromParent.id);
      // Try to match the space category for an optimal visualizer experience
      const matchingSpace = spaceOptions.find(space => {
        if (selectedTileFromParent.category === 'kitchen' && space.type === 'kitchen') return true;
        if (selectedTileFromParent.category === 'bathroom' && space.type === 'bathroom') return true;
        if (selectedTileFromParent.category === 'floor' && space.type === 'living') return true;
        if (selectedTileFromParent.category === 'wood' && space.type === 'living') return true;
        if (selectedTileFromParent.category === 'outdoor' && space.type === 'outdoor') return true;
        return false;
      });
      if (matchingSpace) {
        setActiveSpace(matchingSpace);
        setIsCustomActive(false);
      }
      clearParentTileSelection();
    }
  }, [selectedTileFromParent, clearParentTileSelection]);

  const activeTile = useMemo(() => {
    return products.find(t => t.id === selectedTileId) || products[0] || {
      id: 'placeholder',
      name: 'Loading...',
      code: '...',
      category: 'floor',
      material: '...',
      finish: 'Matte',
      size: '...',
      origin: '...',
      priceCategory: 'Signature',
      image: '',
      description: '',
      features: [],
      inStock: true
    };
  }, [selectedTileId, products]);

  const handleSpaceChange = (space: SpaceOption) => {
    setIsCustomActive(false);
    setActiveSpace(space);
    setSelectedTileId(space.defaultTileId);
  };

  const handleDownloadSpecs = () => {
    setDownloadingSpecs(true);
    setTimeout(() => {
      setDownloadingSpecs(false);
      setDownloadSuccessNotify(
        isCustomActive
          ? `Downloaded Custom Space Spatial CAD Pack featuring ${activeTile.name} specification sheets!`
          : `Downloaded Spatial CAD Pack: ${activeSpace.name} featuring ${activeTile.name} specification sheets!`
      );
      setTimeout(() => {
        setDownloadSuccessNotify('');
      }, 4000);
    }, 1200);
  };

  // Image Upload handler
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setCustomImage(result);
        setIsCustomActive(true);
        setIsScanning(true);
        setScanProgress(0);

        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          setScanProgress(Math.min(progress, 100));
          if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setIsScanning(false);
            }, 600);
          }
        }, 120);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCancelCustomImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomImage(null);
    setIsCustomActive(false);
    setIsScanning(false);
    setScanProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <section 
      className="py-24 bg-white border-y border-charcoal/5 relative overflow-hidden" 
      id="visualizer"
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="h-[1px] w-6 bg-gold-400"></span>
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-gold-600 font-semibold">
                INTERACTIVE CERAMIC STUDIO
              </span>
            </div>
            
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-charcoal tracking-tight">
              Visualize Your Architecture
            </h2>
          </div>

          <p className="font-sans text-xs sm:text-sm text-charcoal/60 max-w-md leading-relaxed">
            Preview different marble slabs, engineered hardwoods, and artisanal ceramics in real-time inside high-end showrooms or upload your own room template.
          </p>
        </div>

        {/* Studio Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Visualizer Stage Screen (7 Cols) */}
          <div className="lg:col-span-8 flex flex-col gap-4" id="visualizer-screen-area">
            {/* Visualizer Stage viewport */}
            <div 
              className="relative aspect-[16/10] bg-charcoal select-none border border-charcoal/10 overflow-hidden shadow-2xl group"
            >
              {/* Tiled Space Viewport */}
              <div 
                className="absolute inset-0 w-full h-full z-0 overflow-hidden"
              >
                {isCustomActive && customImage ? (
                  <img
                    src={customImage}
                    alt="Custom uploaded room view"
                    className={`w-full h-full object-cover transition-all duration-700 ${
                      illuminationMode === 'night' 
                        ? 'brightness-[0.45] contrast-[1.05] saturate-[0.8] sepia-[0.1]' 
                        : 'brightness-100 contrast-100 saturate-100'
                    }`}
                  />
                ) : (
                  <img
                    src={activeSpace.baseImage}
                    alt={activeSpace.name}
                    className={`w-full h-full object-cover transition-all duration-700 ${
                      illuminationMode === 'night' 
                        ? 'brightness-[0.45] contrast-[1.05] saturate-[0.8] sepia-[0.1]' 
                        : 'brightness-100 contrast-100 saturate-100'
                    }`}
                  />
                )}

                {/* Layer 1.5: Projected flooring simulation for custom image uploads */}
                {isCustomActive && !isScanning && (
                  <div 
                    className="absolute bottom-0 inset-x-0 h-[45%] opacity-75 pointer-events-none transition-all duration-500 overflow-hidden"
                    style={{
                      transform: 'perspective(150px) rotateX(48deg) scale(1.6)',
                      transformOrigin: 'bottom center',
                      backgroundImage: `url(${activeTile.image})`,
                      backgroundSize: '120px 120px',
                      mixBlendMode: 'overlay',
                      borderTop: '2px dashed rgba(201, 162, 39, 0.5)'
                    }}
                  />
                )}
              </div>

              {/* Layer 1.6: AI Scanning Overlay animation */}
              <AnimatePresence>
                {isScanning && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-30 bg-charcoal/80 flex flex-col items-center justify-center text-warmwhite p-6"
                  >
                    {/* Sliding gold laser line */}
                    <motion.div
                      animate={{ y: [-150, 150, -150] }}
                      transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                      className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent shadow-[0_0_15px_#C9A227] z-10"
                    />
                    
                    <div className="flex flex-col items-center gap-2">
                      <Camera className="w-8 h-8 text-gold-500 animate-pulse mb-2" />
                      <span className="font-mono text-[10px] tracking-[0.3em] text-gold-500 uppercase font-semibold">
                        AI Space Calibration Active
                      </span>
                      <span className="font-serif text-sm tracking-wide text-gray-300">
                        Analyzing room perspective and layout geometry...
                      </span>
                      <div className="h-[1px] w-48 bg-white/10 relative overflow-hidden mt-4">
                        <div
                          className="absolute top-0 bottom-0 left-0 bg-gold-500 transition-all duration-300"
                          style={{ width: `${scanProgress}%` }}
                        />
                      </div>
                      <span className="font-mono text-[9px] text-white/40 mt-1">{scanProgress}%</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Layer 2: Floating Tile Spec Sheet overlay */}
              <AnimatePresence>
                {showSpecsOverlay && (
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -25, opacity: 0 }}
                    className="absolute bottom-6 left-6 z-20 glass-panel-dark max-w-xs p-5 text-warmwhite shadow-2xl border border-white/10 hidden sm:block"
                    id="visualizer-stats-overlay"
                  >
                    <div className="flex items-center gap-1.5 mb-1.5 font-mono text-[8px] text-gold-400 tracking-widest uppercase">
                      <Sparkles className="w-3 h-3" />
                      Applied Architectural Surface
                    </div>

                    <h4 className="font-serif text-base font-bold text-warmwhite leading-snug">
                      {activeTile.name}
                    </h4>
                    
                    <p className="font-sans text-[11px] text-gray-300 leading-relaxed mt-1.5 line-clamp-2">
                      {activeTile.description}
                    </p>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-4 pt-3 border-t border-white/10 text-[10px] font-mono text-gray-400">
                      <div>
                        <span className="block text-gray-500 font-sans text-[9px] uppercase tracking-wider">SKU Code</span>
                        <span className="text-warmwhite font-semibold">{activeTile.code}</span>
                      </div>
                      <div>
                        <span className="block text-gray-500 font-sans text-[9px] uppercase tracking-wider">Finish</span>
                        <span className="text-gold-400 font-semibold">{activeTile.finish}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Layer 3: Floating Live Material Sample circle */}
              <AnimatePresence>
                <motion.div
                  key={activeTile.id}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 25 }}
                  className="absolute bottom-6 right-6 z-20 flex flex-col items-center gap-1.5 hidden md:flex cursor-pointer"
                  onClick={() => setShowSpecsOverlay(!showSpecsOverlay)}
                  id="live-sample-circle"
                >
                  <div className="w-16 h-16 rounded-full border-2 border-gold-400 overflow-hidden shadow-2xl">
                    <ProgressiveImage
                      src={activeTile.image}
                      alt="Sample Detail"
                      className="w-full h-full"
                      imgClassName="scale-150 transition-all duration-300"
                      referrerPolicy="no-referrer"
                      id="sample-circle-img"
                    />
                  </div>
                  <span className="font-mono text-[9px] bg-charcoal/90 text-warmwhite px-2 py-0.5 rounded-sm uppercase tracking-widest">
                    CLOSEUP
                  </span>
                </motion.div>
              </AnimatePresence>

              {/* Day / Night Ambient Light Switcher */}
              <div className="absolute top-4 right-4 z-20 flex gap-1.5 bg-charcoal/85 p-1 rounded-none border border-white/15" id="lightmode-switcher">
                <button
                  onClick={() => setIlluminationMode('day')}
                  className={`p-2 transition-all duration-300 cursor-pointer ${
                    illuminationMode === 'day' 
                      ? 'bg-gold-500 text-charcoal' 
                      : 'text-warmwhite/60 hover:text-warmwhite'
                  }`}
                  aria-label="Natural Light Mode"
                  id="lightmode-btn-day"
                >
                  <Sun className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIlluminationMode('night')}
                  className={`p-2 transition-all duration-300 cursor-pointer ${
                    illuminationMode === 'night' 
                      ? 'bg-gold-500 text-charcoal' 
                      : 'text-warmwhite/60 hover:text-warmwhite'
                  }`}
                  aria-label="Midnight Light Mode"
                  id="lightmode-btn-night"
                >
                  <Moon className="w-4 h-4" />
                </button>
              </div>

              {/* Top left Active Room Flag */}
              <div className="absolute top-4 left-4 z-20 bg-charcoal/85 px-3 py-1.5 border border-white/10" id="floor-space-label">
                <span className="font-mono text-[10px] text-gold-400 tracking-widest uppercase">
                  STUDIO SPACE: {isCustomActive ? 'CUSTOM UPLOAD' : activeSpace.name}
                </span>
              </div>
            </div>

            {/* Bottom Controls strip */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-ivory/50 border border-charcoal/5 gap-3" id="visualizer-status-bar">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-gold-600 animate-pulse" />
                <span className="font-mono text-[10px] tracking-widest text-charcoal/60 uppercase">
                  RENDERING ENGINE ACTIVE: <span className="text-charcoal font-semibold">{illuminationMode === 'day' ? 'NATURAL SUNLIGHT REFLECTIVITY' : 'LED LIGHT ABSORBENCY'}</span>
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowSpecsOverlay(!showSpecsOverlay)}
                  className="font-sans text-[10px] text-charcoal/70 hover:text-charcoal flex items-center gap-1 uppercase tracking-widest cursor-pointer"
                  id="info-toggle-btn"
                >
                  <Info className="w-3.5 h-3.5" />
                  {showSpecsOverlay ? 'Hide Specs' : 'Show Specs'}
                </button>
                <span className="text-charcoal/10 font-mono">|</span>
                <button
                  onClick={handleDownloadSpecs}
                  disabled={downloadingSpecs}
                  className="font-mono text-[10px] text-gold-600 hover:text-gold-700 font-semibold flex items-center gap-1 uppercase tracking-widest cursor-pointer"
                  id="download-specs-btn"
                >
                  <Download className={`w-3.5 h-3.5 ${downloadingSpecs ? 'animate-spin' : ''}`} />
                  {downloadingSpecs ? 'Generating Package...' : 'Get CAD Slabs'}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Studio controls (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6" id="visualizer-controls-panel">
            
            {/* Step 1: Select Space */}
            <div className="bg-ivory border border-charcoal/5 p-6" id="visualizer-step-1">
              <div className="flex items-center gap-2 mb-4 justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-charcoal text-warmwhite text-[11px] font-mono flex items-center justify-center font-bold">1</span>
                  <span className="font-sans text-xs tracking-widest text-charcoal/50 uppercase font-semibold">Select Showroom Space</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2" id="space-thumbs-grid">
                {spaceOptions.map((space) => {
                  const isActive = !isCustomActive && activeSpace.id === space.id;
                  return (
                    <button
                      key={space.id}
                      onClick={() => handleSpaceChange(space)}
                      className={`relative aspect-[4/3] border cursor-pointer overflow-hidden transition-all duration-300 ${
                        isActive 
                          ? 'border-gold-500 scale-[0.98]' 
                          : 'border-charcoal/5 opacity-70 hover:opacity-100 hover:border-charcoal/20'
                      }`}
                      id={`space-btn-${space.id}`}
                    >
                      <ProgressiveImage
                        src={space.baseImage}
                        alt={space.name}
                        className="w-full h-full"
                        referrerPolicy="no-referrer"
                        id={`space-img-thumb-${space.id}`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent flex items-end p-2.5">
                        <span className="font-serif text-[10.5px] sm:text-xs text-warmwhite font-medium truncate">
                          {space.name.split(' ')[1] || space.name}
                        </span>
                      </div>
                    </button>
                  );
                })}

                {/* Upload custom room template card */}
                <button
                  type="button"
                  onClick={handleUploadClick}
                  className={`relative aspect-[4/3] border cursor-pointer transition-all duration-300 flex flex-col items-center justify-center p-3 bg-white text-charcoal/80 hover:bg-gold-50 ${
                    isCustomActive ? 'border-gold-500 scale-[0.98]' : 'border-dashed border-charcoal/20 hover:border-gold-500'
                  }`}
                >
                  {customImage ? (
                    <>
                      <img src={customImage} alt="Preview Upload" className="absolute inset-0 w-full h-full object-cover brightness-[0.4]" />
                      <button
                        type="button"
                        onClick={handleCancelCustomImage}
                        className="absolute top-1.5 right-1.5 z-20 w-6 h-6 flex items-center justify-center bg-charcoal/80 hover:bg-charcoal text-warmwhite rounded-full transition-colors cursor-pointer"
                        aria-label="Cancel custom photo"
                        title="Cancel custom photo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <div className="relative z-10 flex flex-col items-center justify-center text-center">
                        <RefreshCw className="w-5 h-5 text-gold-400 mb-1" />
                        <span className="font-mono text-[9px] tracking-widest text-warmwhite uppercase font-bold">Replace Photo</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-gold-600 mb-1.5" />
                      <span className="font-serif text-xs font-bold text-charcoal leading-tight text-center">Your Custom Room</span>
                      <span className="font-mono text-[8px] text-charcoal/40 tracking-wider mt-1 text-center uppercase">Upload Photo</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Step 2: Choose Architectural Tile Material */}
            <div className="bg-ivory border border-charcoal/5 p-6 flex flex-col" id="visualizer-step-2">
              <div className="flex items-center gap-2 mb-4 justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-charcoal text-warmwhite text-[11px] font-mono flex items-center justify-center font-bold">2</span>
                  <span className="font-sans text-xs tracking-widest text-charcoal/50 uppercase font-semibold">Apply Slabs & Materials</span>
                </div>
                
                <button
                  onClick={() => {
                    if (isCustomActive) {
                      setIsScanning(true);
                      setScanProgress(0);
                      let progress = 0;
                      const interval = setInterval(() => {
                        progress += 10;
                        setScanProgress(Math.min(progress, 100));
                        if (progress >= 100) {
                          clearInterval(interval);
                          setTimeout(() => setIsScanning(false), 500);
                        }
                      }, 100);
                    } else {
                      handleSpaceChange(activeSpace);
                    }
                  }}
                  className="p-1 rounded-full text-charcoal/40 hover:text-charcoal hover:bg-charcoal/5 transition-all duration-300 cursor-pointer"
                  title="Reset to space default"
                  id="reset-tile-btn"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Scrollable list of highly visual tiles */}
              <div className="flex flex-col gap-2.5 max-h-[300px] overflow-y-auto pr-2 no-scrollbar" id="material-list">
                {products.map((tile) => {
                  const isSelected = selectedTileId === tile.id;
                  
                  return (
                    <button
                      key={tile.id}
                      onClick={() => setSelectedTileId(tile.id)}
                      className={`w-full flex items-center p-2.5 border transition-all duration-300 cursor-pointer text-left ${
                        isSelected 
                          ? 'bg-white border-gold-500 shadow-md' 
                          : 'bg-white/40 border-charcoal/5 hover:border-charcoal/15 hover:bg-white/70'
                      }`}
                      id={`control-tile-btn-${tile.id}`}
                    >
                      {/* Image Thumbnail */}
                      <div className="w-12 h-12 aspect-square border border-charcoal/10 overflow-hidden shrink-0">
                        <ProgressiveImage
                          src={tile.image}
                          alt={tile.name}
                          className="w-full h-full"
                          referrerPolicy="no-referrer"
                          id={`control-tile-thumb-${tile.id}`}
                        />
                      </div>

                      {/* Summary texts */}
                      <div className="ml-3.5 overflow-hidden flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-mono text-[8px] text-charcoal/40 uppercase tracking-widest truncate">{tile.code}</span>
                          <span className="font-mono text-[8px] text-gold-600 font-bold uppercase tracking-widest shrink-0">{tile.finish}</span>
                        </div>
                        <h4 className="font-serif text-[12.5px] font-semibold text-charcoal leading-tight truncate mt-0.5 group-hover:text-gold-600">
                          {tile.name}
                        </h4>
                        <span className="font-sans text-[10px] text-charcoal/50 mt-0.5 block truncate">
                          {tile.material} • {tile.size}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Premium Download Custom Notification Toaster */}
      <AnimatePresence>
        {downloadSuccessNotify && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 260, damping: 25 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-charcoal text-warmwhite border border-gold-500/30 p-5 shadow-2xl max-w-md w-[90%] sm:w-auto font-sans text-xs tracking-wide flex items-center gap-3.5"
            id="download-success-toast"
          >
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
            <div className="flex-1">
              <span className="font-mono text-[9px] text-gold-400 block tracking-widest uppercase mb-0.5">DOWNLOAD COMPLETED</span>
              <p className="text-gray-300 leading-relaxed font-semibold">{downloadSuccessNotify}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
