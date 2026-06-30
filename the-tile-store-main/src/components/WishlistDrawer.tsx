import { X, Heart, Eye, Calculator, Palette, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TileProduct } from '../types';
import ProgressiveImage from './ProgressiveImage';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlist: TileProduct[];
  onRemoveFromWishlist: (tileId: string) => void;
  onSelectTileForVisualizer: (tile: TileProduct) => void;
  onOpenCalculator: (tile: TileProduct) => void;
  onOpenMoodboard: () => void;
}

export default function WishlistDrawer({
  isOpen,
  onClose,
  wishlist,
  onRemoveFromWishlist,
  onSelectTileForVisualizer,
  onOpenCalculator,
  onOpenMoodboard
}: WishlistDrawerProps) {
  
  const handleVisualize = (tile: TileProduct) => {
    onSelectTileForVisualizer(tile);
    onClose();
    const element = document.getElementById('visualizer');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end" id="wishlist-drawer-wrapper">
          {/* Backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-charcoal/30 backdrop-blur-sm cursor-pointer"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative w-full max-w-md bg-warmwhite border-l border-charcoal/10 h-full flex flex-col shadow-2xl z-10"
            id="wishlist-drawer-panel"
          >
            {/* Header */}
            <div className="p-6 border-b border-charcoal/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-gold-600 fill-gold-600" />
                <span className="font-serif text-lg font-bold text-charcoal tracking-wide uppercase">
                  Curated Moodboard
                </span>
                <span className="font-mono text-[9px] bg-gold-400 text-charcoal px-2 py-0.5 rounded-sm uppercase tracking-widest font-semibold">
                  {wishlist.length} Items
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 bg-charcoal/5 border border-charcoal/5 hover:border-gold-500 transition-colors rounded-none cursor-pointer"
                aria-label="Close Wishlist"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
              {wishlist.length === 0 ? (
                <div className="text-center py-20 flex flex-col items-center justify-center">
                  <div className="p-4 bg-charcoal/5 rounded-full inline-flex text-charcoal/30 mb-3">
                    <Heart className="w-8 h-8" />
                  </div>
                  <h4 className="font-serif text-sm font-bold text-charcoal">Your design list is empty</h4>
                  <p className="font-sans text-xs text-charcoal/50 mt-1 max-w-xs mx-auto leading-relaxed">
                    Select the heart icons on the product cards to start building your luxury layout design dashboard.
                  </p>
                </div>
              ) : (
                wishlist.map(tile => (
                  <div
                    key={tile.id}
                    className="p-3 bg-white border border-charcoal/5 hover:border-gold-500/30 flex items-center gap-4 justify-between transition-all duration-300"
                  >
                    <div className="flex items-center gap-3.5">
                      {/* Image Thumbnail */}
                      <div className="w-14 h-14 border border-charcoal/10 overflow-hidden bg-ivory shrink-0">
                        <ProgressiveImage
                          src={tile.image}
                          alt={tile.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      
                      <div>
                        <h4 className="font-serif text-xs font-bold text-charcoal line-clamp-1">{tile.name}</h4>
                        <p className="font-mono text-[8.5px] text-charcoal/40 uppercase mt-0.5">{tile.code}</p>
                        <p className="font-sans text-[10px] text-gold-600 font-semibold mt-1">{tile.brand || 'The Tile Store'}</p>
                      </div>
                    </div>

                    {/* Quick Operations panel */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleVisualize(tile)}
                        className="p-2 bg-charcoal/5 border border-charcoal/5 hover:border-gold-500 text-charcoal hover:bg-gold-50 transition-all cursor-pointer"
                        title="Spatial Preview"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onOpenCalculator(tile)}
                        className="p-2 bg-charcoal/5 border border-charcoal/5 hover:border-gold-500 text-charcoal hover:bg-gold-50 transition-all cursor-pointer"
                        title="Calculate boxes"
                      >
                        <Calculator className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onRemoveFromWishlist(tile.id)}
                        className="p-2 bg-charcoal/5 border border-charcoal/5 hover:border-red-500 hover:text-red-600 transition-all cursor-pointer text-charcoal/40"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer triggers */}
            {wishlist.length > 0 && (
              <div className="p-6 border-t border-charcoal/10 bg-ivory space-y-2.5">
                <button
                  onClick={() => {
                    onClose();
                    onOpenMoodboard();
                  }}
                  className="w-full py-3.5 bg-charcoal text-warmwhite border border-charcoal hover:bg-gold-500 hover:text-charcoal hover:border-gold-500 transition-all duration-300 font-sans text-[10px] tracking-widest uppercase font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  <Palette className="w-4 h-4" />
                  Launch Visual Moodboard
                </button>
                <p className="font-mono text-[8px] text-charcoal/40 uppercase tracking-widest text-center">
                  ARRANGE VEINS AND TEXTURES ON ATELIER CANVAS
                </p>
              </div>
            )}

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
