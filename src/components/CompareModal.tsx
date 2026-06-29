import { X, Scale, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TileProduct } from '../types';
import ProgressiveImage from './ProgressiveImage';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  comparedProducts: TileProduct[];
  onRemoveFromCompare: (tileId: string) => void;
  onSelectTileForVisualizer: (tile: TileProduct) => void;
}

export default function CompareModal({
  isOpen,
  onClose,
  comparedProducts,
  onRemoveFromCompare,
  onSelectTileForVisualizer
}: CompareModalProps) {
  
  const handleApplyToVisualizer = (tile: TileProduct) => {
    onSelectTileForVisualizer(tile);
    onClose();
    // Scroll to visualizer
    const element = document.getElementById('visualizer');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" id="compare-modal-wrapper">
          {/* Backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-charcoal/40 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Container */}
          <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative bg-warmwhite max-w-5xl w-full border border-charcoal/10 overflow-hidden shadow-2xl p-6 sm:p-8 flex flex-col"
              id="compare-modal-panel"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-charcoal text-warmwhite hover:bg-gold-500 hover:text-charcoal transition-all duration-300 cursor-pointer shadow-lg"
                aria-label="Close Comparison"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Title Header */}
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-charcoal/5">
                <Scale className="w-5 h-5 text-gold-600" />
                <span className="font-serif text-lg font-bold text-charcoal tracking-wide uppercase">
                  Surface Comparison Matrix
                </span>
                <span className="font-mono text-[9px] bg-gold-400 text-charcoal font-semibold px-2 py-0.5 rounded-sm uppercase tracking-widest">
                  {comparedProducts.length} Slabs selected
                </span>
              </div>

              {/* Grid content */}
              {comparedProducts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="font-sans text-xs text-charcoal/50">No products selected for comparison. Add tiles from the catalog spec panels.</p>
                </div>
              ) : (
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full border-collapse text-left font-sans text-xs">
                    <thead>
                      <tr className="border-b border-charcoal/10">
                        <th className="py-4 pr-4 font-mono text-[9px] tracking-widest uppercase text-charcoal/40 w-1/4">Specification</th>
                        {comparedProducts.map(tile => (
                          <th key={tile.id} className="py-4 px-4 w-1/4 relative group">
                            <div className="flex flex-col gap-2">
                              {/* Product Thumbnail */}
                              <div className="relative aspect-square w-24 h-24 overflow-hidden border border-charcoal/5 bg-ivory">
                                <ProgressiveImage
                                  src={tile.image}
                                  alt={tile.name}
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                                <button
                                  onClick={() => onRemoveFromCompare(tile.id)}
                                  className="absolute top-1 right-1 p-1 bg-charcoal/85 hover:bg-red-700 text-warmwhite rounded-none cursor-pointer transition-colors shadow-md"
                                  title="Remove from comparison"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                              <span className="font-serif text-sm font-bold text-charcoal leading-tight line-clamp-1">{tile.name}</span>
                              <span className="font-mono text-[9px] text-charcoal/40 uppercase">{tile.code}</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-charcoal/5">
                      <tr>
                        <td className="py-3 pr-4 font-semibold text-charcoal/50">Brand Partner</td>
                        {comparedProducts.map(tile => (
                          <td key={tile.id} className="py-3 px-4 font-mono text-[11px] font-semibold text-gold-600">{tile.brand || 'The Tile Store'}</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-3 pr-4 font-semibold text-charcoal/50">Glaze Finish</td>
                        {comparedProducts.map(tile => (
                          <td key={tile.id} className="py-3 px-4 font-mono text-[11px] font-medium">{tile.finish}</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-3 pr-4 font-semibold text-charcoal/50">Modular Dimensions</td>
                        {comparedProducts.map(tile => (
                          <td key={tile.id} className="py-3 px-4 font-mono text-[11px]">{tile.size}</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-3 pr-4 font-semibold text-charcoal/50">Slab Thickness</td>
                        {comparedProducts.map(tile => (
                          <td key={tile.id} className="py-3 px-4 font-mono text-[11px]">{tile.thickness || '10 - 15 mm'}</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-3 pr-4 font-semibold text-charcoal/50">Base Material</td>
                        {comparedProducts.map(tile => (
                          <td key={tile.id} className="py-3 px-4 font-sans text-charcoal/80">{tile.material}</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-3 pr-4 font-semibold text-charcoal/50">Quarry Origin</td>
                        {comparedProducts.map(tile => (
                          <td key={tile.id} className="py-3 px-4 font-sans text-charcoal/80">{tile.origin}</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-3 pr-4 font-semibold text-charcoal/50">Color Scheme</td>
                        {comparedProducts.map(tile => (
                          <td key={tile.id} className="py-3 px-4 font-sans text-charcoal/80">{tile.color || 'Neutral'}</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-3 pr-4 font-semibold text-charcoal/50">Tactile Texture</td>
                        {comparedProducts.map(tile => (
                          <td key={tile.id} className="py-3 px-4 font-sans text-charcoal/80">{tile.texture || 'Smooth'}</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-3 pr-4 font-semibold text-charcoal/50">Anti-Skid (Safety)</td>
                        {comparedProducts.map(tile => (
                          <td key={tile.id} className="py-3 px-4 font-mono text-[10px]">
                            {tile.antiSkid ? (
                              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 font-semibold">✓ YES (R11/R12)</span>
                            ) : (
                              <span className="text-charcoal/40 bg-charcoal/5 px-2 py-0.5">STANDARD</span>
                            )}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-3 pr-4 font-semibold text-charcoal/50">Water Absorption</td>
                        {comparedProducts.map(tile => (
                          <td key={tile.id} className="py-3 px-4 font-mono text-[11px]">{tile.waterAbsorption || '0.05%'}</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-3 pr-4 font-semibold text-charcoal/50">Price Category</td>
                        {comparedProducts.map(tile => (
                          <td key={tile.id} className="py-3 px-4 font-mono font-bold text-gold-600">{tile.priceCategory} Class</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-3 pr-4 font-semibold text-charcoal/50">Architectural Features</td>
                        {comparedProducts.map(tile => (
                          <td key={tile.id} className="py-3 px-4 py-4">
                            <div className="flex flex-wrap gap-1">
                              {tile.features.map((feat, i) => (
                                <span key={i} className="text-[9px] font-mono bg-charcoal/5 px-1.5 py-0.5 rounded-sm whitespace-nowrap">
                                  {feat}
                                </span>
                              ))}
                            </div>
                          </td>
                        ))}
                      </tr>
                      <tr className="border-t border-charcoal/10">
                        <td className="py-4 pr-4">Actions</td>
                        {comparedProducts.map(tile => (
                          <td key={tile.id} className="py-4 px-4">
                            <button
                              onClick={() => handleApplyToVisualizer(tile)}
                              className="w-full py-2 bg-charcoal text-warmwhite border border-charcoal hover:bg-gold-500 hover:text-charcoal hover:border-gold-500 transition-all duration-300 font-mono text-[9px] tracking-widest uppercase font-semibold flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <RefreshCw className="w-3 h-3" />
                              Apply in Room
                            </button>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
