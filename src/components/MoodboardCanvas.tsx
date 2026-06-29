import { useState } from 'react';
import { X, Palette, Image as ImageIcon, Download, Share2, Layers, Type, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TileProduct } from '../types';
import ProgressiveImage from './ProgressiveImage';

interface MoodboardCanvasProps {
  isOpen: boolean;
  onClose: () => void;
  wishlist: TileProduct[];
}

export default function MoodboardCanvas({
  isOpen,
  onClose,
  wishlist
}: MoodboardCanvasProps) {
  const [bgTexture, setBgTexture] = useState<'marble' | 'wood' | 'concrete' | 'plaster'>('plaster');
  const [notes, setNotes] = useState<string>('Luxury Living Room Concept - Spring 2026');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<string>('');

  // Individual item positions / rotation (simulated customizable positions)
  const [items, setItems] = useState(() => 
    wishlist.map((tile, i) => ({
      ...tile,
      rotation: [0, 5, -3, 8, -6, 2][i % 6],
      scale: 1,
      id: `${tile.id}-${i}`
    }))
  );

  const bgStyles = {
    marble: 'bg-[url("https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80")] bg-cover brightness-[0.9] opacity-80',
    wood: 'bg-[url("https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1200&q=80")] bg-cover brightness-[0.7]',
    concrete: 'bg-[url("https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=1200&q=80")] bg-cover brightness-[0.6]',
    plaster: 'bg-warmwhite bg-[radial-gradient(#C9A227_0.5px,transparent_0.5px)] [background-size:16px_16px]'
  };

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setExportSuccess('Successfully exported luxury moodboard PDF layout!');
      setTimeout(() => setExportSuccess(''), 4000);
    }, 1500);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const rotateItem = (id: string) => {
    setItems(items.map(item => {
      if (item.id === id) {
        let currentRot = item.rotation;
        return {
          ...item,
          rotation: currentRot >= 15 ? -15 : currentRot + 5
        };
      }
      return item;
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-charcoal/80 flex items-center justify-center p-4 sm:p-6" id="moodboard-modal-wrapper">
          {/* Backdrop glass */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 cursor-pointer"
          />

          {/* Workspace Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative bg-warmwhite max-w-5xl w-full border border-charcoal/10 overflow-hidden shadow-2xl flex flex-col h-[90vh] sm:h-[85vh] z-10"
            id="moodboard-panel-container"
          >
            {/* Header */}
            <div className="p-5 border-b border-charcoal/10 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-gold-600" />
                <span className="font-serif text-base font-bold text-charcoal tracking-wide uppercase">
                  Atelier Moodboard Studio
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 bg-charcoal text-warmwhite hover:bg-gold-500 hover:text-charcoal transition-all rounded-full cursor-pointer shadow"
                aria-label="Close Moodboard"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Main split workarea */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              
              {/* Left Canvas area (70%) */}
              <div className="flex-1 relative overflow-hidden bg-ivory flex flex-col">
                {/* Backdrop Layer styling selector */}
                <div className="absolute top-4 left-4 z-20 flex gap-1 bg-charcoal/90 p-1 border border-white/10 rounded-sm">
                  {(['plaster', 'marble', 'wood', 'concrete'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setBgTexture(t)}
                      className={`px-2.5 py-1 text-[9px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
                        bgTexture === t
                          ? 'bg-gold-500 text-charcoal font-bold'
                          : 'text-warmwhite/60 hover:text-warmwhite'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {/* Canvas Render Frame */}
                <div className="flex-1 relative overflow-hidden flex items-center justify-center p-8">
                  {/* Texture background absolute layer */}
                  <div className={`absolute inset-0 transition-all duration-700 ${bgStyles[bgTexture]}`} />

                  {/* Collage Elements container */}
                  <div className="relative w-full h-full max-w-2xl max-h-[450px] flex flex-wrap items-center justify-center gap-6 z-10 select-none">
                    {items.length === 0 ? (
                      <div className="bg-white/80 backdrop-blur p-6 text-center border border-charcoal/5 max-w-sm">
                        <ImageIcon className="w-6 h-6 mx-auto text-charcoal/40 mb-2" />
                        <h4 className="font-serif text-sm font-bold text-charcoal">Design Board is empty</h4>
                        <p className="font-sans text-xs text-charcoal/50 leading-relaxed mt-1">
                          You removed all samples. Reopen the wishlist and load them again to compile your collage.
                        </p>
                      </div>
                    ) : (
                      items.map((tile) => (
                        <motion.div
                          key={tile.id}
                          style={{
                            rotate: `${tile.rotation}deg`
                          }}
                          className="relative w-36 sm:w-44 bg-white p-3 shadow-xl border border-charcoal/5 hover:scale-105 hover:z-20 hover:shadow-2xl transition-all duration-300 group"
                        >
                          {/* Sample Image */}
                          <div className="aspect-square w-full bg-ivory overflow-hidden border border-charcoal/5">
                            <ProgressiveImage
                              src={tile.image}
                              alt={tile.name}
                              className="w-full h-full"
                              referrerPolicy="no-referrer"
                            />
                          </div>

                          {/* Info bar */}
                          <div className="mt-2 text-left">
                            <span className="block font-mono text-[7px] text-charcoal/40 uppercase tracking-wider">{tile.code}</span>
                            <span className="block font-serif text-[10.5px] font-bold text-charcoal truncate mt-0.5">{tile.name}</span>
                          </div>

                          {/* Individual action tags on hover */}
                          <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <button
                              onClick={() => rotateItem(tile.id)}
                              className="p-1 bg-gold-500 text-charcoal hover:bg-gold-600 shadow-md text-[9px] font-mono cursor-pointer"
                              title="Rotate block"
                            >
                              ↻
                            </button>
                            <button
                              onClick={() => removeItem(tile.id)}
                              className="p-1 bg-red-600 text-warmwhite hover:bg-red-700 shadow-md cursor-pointer"
                              title="Remove"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>

                {/* Floating Canvas Note Editor */}
                <div className="p-4 bg-white/70 backdrop-blur-md border-t border-charcoal/5 z-10 shrink-0 flex items-center gap-3">
                  <Type className="w-4 h-4 text-charcoal/40 shrink-0" />
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-transparent border-none outline-none font-serif text-sm font-medium tracking-wide text-charcoal placeholder-charcoal/30"
                    placeholder="Provide design annotations..."
                  />
                </div>
              </div>

              {/* Right Sidebar controls (30%) */}
              <div className="w-full md:w-80 bg-white border-t md:border-t-0 md:border-l border-charcoal/10 p-6 flex flex-col justify-between shrink-0">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-mono text-[9px] tracking-[0.25em] uppercase text-gold-600 font-bold mb-2">
                      ATELIER WORKSPACE
                    </h4>
                    <p className="font-sans text-[11px] text-charcoal/50 leading-relaxed">
                      Overlap blocks, rotate samples on hover, choose backgrounds to evaluate contrast, and build layouts matching client interior plans.
                    </p>
                  </div>

                  <div className="border-t border-charcoal/5 pt-4">
                    <h5 className="font-mono text-[9px] tracking-widest text-charcoal/40 uppercase mb-2">CANVAS ELEMENTS</h5>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1 no-scrollbar">
                      {items.map(item => (
                        <div key={item.id} className="flex items-center justify-between text-xs py-1.5 border-b border-charcoal/5">
                          <span className="font-serif font-bold text-charcoal truncate flex-1 pr-3">{item.name}</span>
                          <span className="font-mono text-[9px] text-charcoal/40 pr-3">{item.code}</span>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-charcoal/30 hover:text-red-600 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom triggers */}
                <div className="space-y-2 pt-6 border-t border-charcoal/5">
                  <button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="w-full py-3 bg-charcoal text-warmwhite hover:bg-gold-500 hover:text-charcoal transition-all duration-300 font-mono text-[10px] tracking-widest uppercase font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow"
                  >
                    <Download className={`w-4 h-4 ${isExporting ? 'animate-spin' : ''}`} />
                    {isExporting ? 'Packaging PDF...' : 'Download Moodboard'}
                  </button>
                  <button
                    onClick={() => {
                      setExportSuccess('Sharing link compiled: Copied layout clipboard!');
                      setTimeout(() => setExportSuccess(''), 4000);
                    }}
                    className="w-full py-2 bg-transparent border border-charcoal/15 hover:border-gold-500 text-charcoal hover:text-gold-600 transition-all font-mono text-[9px] tracking-widest uppercase font-semibold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Share Workspace
                  </button>
                </div>
              </div>

            </div>

            {/* Toaster element */}
            <AnimatePresence>
              {exportSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 40, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 30, scale: 0.95 }}
                  className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-charcoal text-warmwhite border border-gold-500/30 p-4 shadow-2xl font-sans text-xs tracking-wide flex items-center gap-3"
                >
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="font-semibold">{exportSuccess}</span>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
