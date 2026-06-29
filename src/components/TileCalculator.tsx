import { useState, useEffect } from 'react';
import { X, Calculator, ShieldCheck, Ruler, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TileProduct } from '../types';

interface TileCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  tileProduct: TileProduct | null;
}

export default function TileCalculator({
  isOpen,
  onClose,
  tileProduct
}: TileCalculatorProps) {
  const [unit, setUnit] = useState<'meters' | 'feet'>('feet');
  const [width, setWidth] = useState<number>(12);
  const [height, setHeight] = useState<number>(15);
  const [wastePercent, setWastePercent] = useState<number>(10);
  const [results, setResults] = useState({
    totalAreaSqFt: 0,
    totalAreaSqM: 0,
    tilesNeeded: 0,
    boxesNeeded: 0,
    wasteArea: 0,
    estimatedCost: 0
  });

  // Helper to parse tile dimensions (e.g., "1200 x 2400 mm" or "800 x 800 mm" or "100 x 100 mm")
  const getTileAreaInSqM = (sizeStr: string): number => {
    try {
      const match = sizeStr.toLowerCase().match(/(\d+)\s*x\s*(\d+)\s*(mm|cm|in|m)/);
      if (match) {
        const val1 = parseFloat(match[1]);
        const val2 = parseFloat(match[2]);
        const unit = match[3];

        if (unit === 'mm') {
          return (val1 / 1000) * (val2 / 1000);
        } else if (unit === 'cm') {
          return (val1 / 100) * (val2 / 100);
        } else if (unit === 'm') {
          return val1 * val2;
        }
      }
    } catch (e) {
      console.error('Error parsing size', e);
    }
    return 1.44; // Default fallback (e.g. 1200x1200mm)
  };

  const tileAreaSqM = tileProduct ? getTileAreaInSqM(tileProduct.size) : 1.44;
  const tileAreaSqFt = tileAreaSqM * 10.7639;

  // Tiles per box calculation
  const getTilesPerBox = (areaSqM: number): number => {
    if (areaSqM > 2.0) return 1; // huge slabs (1600x3200)
    if (areaSqM > 1.2) return 2; // large slabs (1200x2400, 1200x1200)
    if (areaSqM > 0.5) return 3; // medium tiles (800x800)
    if (areaSqM > 0.1) return 8; // wood planks, wall tiles
    return 24; // subways, mosaics
  };

  const tilesPerBox = getTilesPerBox(tileAreaSqM);

  // Price per square foot estimation based on class
  const getPricePerSqFt = (priceCategory: string): number => {
    switch (priceCategory) {
      case 'Signature': return 280;
      case 'Premium': return 160;
      case 'Reserve': return 95;
      default: return 120;
    }
  };

  const pricePerSqFt = tileProduct ? getPricePerSqFt(tileProduct.priceCategory) : 120;

  useEffect(() => {
    if (width <= 0 || height <= 0) return;

    let inputArea = width * height;
    let totalAreaSqM = 0;
    let totalAreaSqFt = 0;

    if (unit === 'feet') {
      totalAreaSqFt = inputArea;
      totalAreaSqM = inputArea / 10.7639;
    } else {
      totalAreaSqM = inputArea;
      totalAreaSqFt = inputArea * 10.7639;
    }

    const wasteAreaSqFt = totalAreaSqFt * (wastePercent / 100);
    const finalAreaSqFt = totalAreaSqFt + wasteAreaSqFt;
    const finalAreaSqM = totalAreaSqM + (totalAreaSqM * (wastePercent / 100));

    const tilesNeeded = Math.ceil(finalAreaSqM / tileAreaSqM);
    const boxesNeeded = Math.ceil(tilesNeeded / tilesPerBox);
    const estimatedCost = Math.round(finalAreaSqFt * pricePerSqFt);

    setResults({
      totalAreaSqFt: Math.round(totalAreaSqFt * 100) / 100,
      totalAreaSqM: Math.round(totalAreaSqM * 100) / 100,
      tilesNeeded,
      boxesNeeded,
      wasteArea: Math.round(wasteAreaSqFt * 100) / 100,
      estimatedCost
    });
  }, [width, height, unit, wastePercent, tileAreaSqM, pricePerSqFt, tilesPerBox]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" id="calculator-modal-wrapper">
          {/* Backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-charcoal/40 backdrop-blur-md cursor-pointer"
          />

          {/* Modal content */}
          <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative bg-warmwhite max-w-lg w-full border border-charcoal/10 overflow-hidden shadow-2xl p-6 sm:p-8"
              id="calculator-modal-panel"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-charcoal text-warmwhite hover:bg-gold-500 hover:text-charcoal transition-all duration-300 cursor-pointer shadow-lg"
                aria-label="Close Calculator"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Title */}
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-charcoal/5">
                <Calculator className="w-5 h-5 text-gold-600" />
                <span className="font-serif text-lg font-bold text-charcoal tracking-wide uppercase">
                  Coverage Calculator
                </span>
              </div>

              {tileProduct && (
                <div className="flex items-center gap-3 p-3 bg-ivory border border-charcoal/5 mb-6">
                  <div className="w-10 h-10 overflow-hidden border border-charcoal/5 bg-white shrink-0">
                    <img src={tileProduct.image} alt={tileProduct.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-serif text-xs font-bold text-charcoal">{tileProduct.name}</h4>
                    <p className="font-mono text-[9px] text-charcoal/50 uppercase">
                      {tileProduct.size} • {tileProduct.priceCategory} Tier (₹{pricePerSqFt}/sqft est)
                    </p>
                  </div>
                </div>
              )}

              {/* Input Form */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[10px] tracking-widest text-charcoal/40 uppercase">MEASUREMENT UNIT</span>
                  <div className="flex border border-charcoal/10 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setUnit('feet')}
                      className={`px-3 py-1 font-sans text-[10px] uppercase tracking-wider cursor-pointer ${
                        unit === 'feet' ? 'bg-charcoal text-warmwhite font-semibold' : 'bg-white text-charcoal/60'
                      }`}
                    >
                      Feet (ft)
                    </button>
                    <button
                      type="button"
                      onClick={() => setUnit('meters')}
                      className={`px-3 py-1 font-sans text-[10px] uppercase tracking-wider cursor-pointer ${
                        unit === 'meters' ? 'bg-charcoal text-warmwhite font-semibold' : 'bg-white text-charcoal/60'
                      }`}
                    >
                      Meters (m)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-sans text-[10px] text-charcoal/50 uppercase tracking-widest mb-1.5 font-semibold">Width</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        value={width}
                        onChange={(e) => setWidth(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-charcoal/10 px-3 py-2 outline-none font-mono text-sm"
                      />
                      <span className="absolute right-3 top-2.5 text-[10px] font-mono text-charcoal/40">{unit === 'feet' ? 'ft' : 'm'}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block font-sans text-[10px] text-charcoal/50 uppercase tracking-widest mb-1.5 font-semibold">Length / Height</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        value={height}
                        onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-charcoal/10 px-3 py-2 outline-none font-mono text-sm"
                      />
                      <span className="absolute right-3 top-2.5 text-[10px] font-mono text-charcoal/40">{unit === 'feet' ? 'ft' : 'm'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="font-sans text-[10px] text-charcoal/50 uppercase tracking-widest font-semibold">Waste & Cutting Margin</label>
                    <span className="font-mono text-xs font-bold text-gold-600">{wastePercent}% RECOMMENDED</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[5, 10, 15].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setWastePercent(pct)}
                        className={`py-2 border font-mono text-xs cursor-pointer ${
                          wastePercent === pct
                            ? 'bg-charcoal border-charcoal text-warmwhite font-bold'
                            : 'bg-white border-charcoal/5 text-charcoal/60 hover:border-gold-300'
                        }`}
                      >
                        {pct}% ({pct === 10 ? 'Standard' : pct === 5 ? 'Minimal' : 'Diagonal Cut'})
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Estimation Results Panel */}
              <div className="bg-ivory border border-charcoal/10 p-5 space-y-3.5 mb-6" id="calculator-results">
                <div className="flex items-center justify-between text-xs border-b border-charcoal/5 pb-2">
                  <span className="text-charcoal/50 font-sans">Net Area Coverage</span>
                  <span className="font-mono font-medium text-charcoal">
                    {results.totalAreaSqFt} sqft ({results.totalAreaSqM} sqm)
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs border-b border-charcoal/5 pb-2">
                  <span className="text-charcoal/50 font-sans">Waste Allowance ({wastePercent}%)</span>
                  <span className="font-mono text-charcoal/60">+{results.wasteArea} sqft</span>
                </div>
                <div className="flex items-center justify-between text-xs border-b border-charcoal/5 pb-2">
                  <span className="text-charcoal/50 font-sans">Required Tiles Count</span>
                  <span className="font-mono font-bold text-charcoal">{results.tilesNeeded} individual slabs</span>
                </div>
                <div className="flex items-center justify-between text-xs border-b border-charcoal/5 pb-2">
                  <span className="text-charcoal/50 font-sans flex items-center gap-1">
                    <Ruler className="w-3.5 h-3.5 text-gold-500" />
                    Required Boxes ({tilesPerBox} tiles/box)
                  </span>
                  <span className="font-mono font-bold text-gold-600 text-sm">{results.boxesNeeded} Boxes</span>
                </div>
                {tileProduct && (
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-charcoal/50 font-semibold font-sans">Estimated Cost (Material Only)</span>
                    <span className="font-serif font-extrabold text-charcoal text-base">₹{results.estimatedCost.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-[10px] text-charcoal/40 uppercase tracking-widest justify-center">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                Estimation counts for standard layout grout lines
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
