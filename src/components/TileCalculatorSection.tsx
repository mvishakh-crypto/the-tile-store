import React, { useState, useEffect } from 'react';
import { Calculator, ShieldCheck, Ruler, BookOpen, AlertTriangle } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';

export default function TileCalculatorSection() {
  const { data: productsData } = useProducts({}, { field: 'popularity_score', direction: 'desc' }, 1, 1000);
  const products = productsData?.products || [];

  const [selectedPresetId, setSelectedPresetId] = useState<string>('custom');
  
  // Custom tile inputs
  const [tileLengthMm, setTileLengthMm] = useState<number>(1200);
  const [tileWidthMm, setTileWidthMm] = useState<number>(1200);
  const [tilesPerBox, setTilesPerBox] = useState<number>(2);

  // Area inputs
  const [unit, setUnit] = useState<'meters' | 'feet'>('feet');
  const [roomLength, setRoomLength] = useState<number>(15);
  const [roomWidth, setRoomWidth] = useState<number>(12);
  
  // Grout & pattern parameters
  const [groutWidthMm, setGroutWidthMm] = useState<number>(2);
  const [patternType, setPatternType] = useState<'straight' | 'diagonal' | 'herringbone'>('straight');

  const [results, setResults] = useState({
    netAreaSqFt: 0,
    netAreaSqM: 0,
    wasteAreaSqFt: 0,
    totalAreaSqFt: 0,
    tilesNeeded: 0,
    boxesNeeded: 0,
    groutAdjustmentSqM: 0
  });

  // Patterns mapping to waste percentages
  const patternWaste = {
    straight: 10,
    diagonal: 15,
    herringbone: 18
  };

  // Synchronize custom tile size if a preset product is selected
  useEffect(() => {
    if (selectedPresetId === 'custom') return;
    const tile = products.find(t => t.id === selectedPresetId);
    if (tile) {
      try {
        const match = tile.size.toLowerCase().match(/(\d+)\s*x\s*(\d+)\s*(mm|cm|in|m)/);
        if (match) {
          const val1 = parseFloat(match[1]);
          const val2 = parseFloat(match[2]);
          const unit = match[3];

          let mmLength = val1;
          let mmWidth = val2;

          if (unit === 'cm') {
            mmLength = val1 * 10;
            mmWidth = val2 * 10;
          } else if (unit === 'm') {
            mmLength = val1 * 1000;
            mmWidth = val2 * 1000;
          }

          setTileLengthMm(mmLength);
          setTileWidthMm(mmWidth);

          // Dynamic tiles per box estimation
          const areaSqM = (mmLength / 1000) * (mmWidth / 1000);
          if (areaSqM > 2.0) setTilesPerBox(1);
          else if (areaSqM > 1.2) setTilesPerBox(2);
          else if (areaSqM > 0.5) setTilesPerBox(3);
          else if (areaSqM > 0.1) setTilesPerBox(8);
          else setTilesPerBox(24);
        }
      } catch (e) {
        console.error('Error parsing preset tile dimensions', e);
      }
    }
  }, [selectedPresetId, products]);

  // Main calculation engine
  useEffect(() => {
    if (roomLength <= 0 || roomWidth <= 0 || tileLengthMm <= 0 || tileWidthMm <= 0) return;

    let netAreaSqM = 0;
    let netAreaSqFt = 0;
    const roomAreaRaw = roomLength * roomWidth;

    if (unit === 'feet') {
      netAreaSqFt = roomAreaRaw;
      netAreaSqM = roomAreaRaw / 10.7639;
    } else {
      netAreaSqM = roomAreaRaw;
      netAreaSqFt = roomAreaRaw * 10.7639;
    }

    // Convert tile size to meters
    const tileLengthM = tileLengthMm / 1000;
    const tileWidthM = tileWidthMm / 1000;

    // Grout joints calculation adjustments
    const groutM = groutWidthMm / 1000;
    const effectiveTileLengthM = tileLengthM + groutM;
    const effectiveTileWidthM = tileWidthM + groutM;
    const effectiveTileAreaSqM = effectiveTileLengthM * effectiveTileWidthM;

    // Calculate baseline tiles count
    const tilesNeededBeforeWaste = netAreaSqM / effectiveTileAreaSqM;

    // Calculate waste multiplier
    const wastePercent = patternWaste[patternType];
    const totalTilesNeeded = Math.ceil(tilesNeededBeforeWaste * (1 + wastePercent / 100));
    const totalBoxesNeeded = Math.ceil(totalTilesNeeded / tilesPerBox);

    const wasteAreaSqFt = netAreaSqFt * (wastePercent / 100);
    const totalAreaSqFt = netAreaSqFt + wasteAreaSqFt;

    setResults({
      netAreaSqFt: Math.round(netAreaSqFt * 100) / 100,
      netAreaSqM: Math.round(netAreaSqM * 100) / 100,
      wasteAreaSqFt: Math.round(wasteAreaSqFt * 100) / 100,
      totalAreaSqFt: Math.round(totalAreaSqFt * 100) / 100,
      tilesNeeded: totalTilesNeeded,
      boxesNeeded: totalBoxesNeeded,
      groutAdjustmentSqM: Math.round((effectiveTileAreaSqM - (tileLengthM * tileWidthM)) * totalTilesNeeded * 1000) / 1000
    });
  }, [roomLength, roomWidth, tileLengthMm, tileWidthMm, unit, groutWidthMm, patternType, tilesPerBox]);

  return (
    <section 
      className="py-24 bg-ivory scroll-mt-20 border-b border-charcoal/5" 
      id="calculator-section"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="h-[1px] w-6 bg-gold-400"></span>
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-gold-600 font-semibold">
              ATELIER CALCULATION SUITE
            </span>
            <span className="h-[1px] w-6 bg-gold-400"></span>
          </div>

          <h2 className="font-serif text-3xl md:text-5xl font-bold text-charcoal tracking-tight mb-4">
            Professional Tile Calculator
          </h2>
          
          <p className="font-sans text-xs sm:text-sm text-charcoal/60 leading-relaxed">
            Estimate tile counts, boxes, grout lines, and pattern wastage parameters using the same algorithmic accuracy as high-end designers.
          </p>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Column 1: Standalone Calculator Form (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-charcoal/5 p-6 sm:p-8 shadow-sm flex flex-col gap-6">
            
            <div className="flex items-center gap-2 pb-4 border-b border-charcoal/5">
              <Calculator className="w-5 h-5 text-gold-600" />
              <span className="font-serif text-base font-bold text-charcoal tracking-wide uppercase">
                Estimate Calculations
              </span>
            </div>

            {/* Step 1: Select Tile size / Preset */}
            <div>
              <label className="block font-sans text-[10px] text-charcoal/50 uppercase tracking-widest font-semibold mb-2">
                1. SELECT TILE OR ENTER CUSTOM SIZE
              </label>
              
              <select
                value={selectedPresetId}
                onChange={(e) => setSelectedPresetId(e.target.value)}
                className="w-full bg-ivory border border-charcoal/10 px-3 py-2.5 outline-none font-sans text-xs uppercase tracking-wider mb-4 cursor-pointer"
              >
                <option value="custom">-- CUSTOM DIMENSIONS --</option>
                {products.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.size})
                  </option>
                ))}
              </select>

              {/* Custom size input fields */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-sans text-[9px] text-charcoal/40 uppercase tracking-widest mb-1">Length (mm)</label>
                  <input
                    type="number"
                    min="1"
                    disabled={selectedPresetId !== 'custom'}
                    value={tileLengthMm}
                    onChange={(e) => setTileLengthMm(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-charcoal/10 px-3 py-2 outline-none font-mono text-xs disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block font-sans text-[9px] text-charcoal/40 uppercase tracking-widest mb-1">Width (mm)</label>
                  <input
                    type="number"
                    min="1"
                    disabled={selectedPresetId !== 'custom'}
                    value={tileWidthMm}
                    onChange={(e) => setTileWidthMm(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-charcoal/10 px-3 py-2 outline-none font-mono text-xs disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block font-sans text-[9px] text-charcoal/40 uppercase tracking-widest mb-1">Tiles / Box</label>
                  <input
                    type="number"
                    min="1"
                    disabled={selectedPresetId !== 'custom'}
                    value={tilesPerBox}
                    onChange={(e) => setTilesPerBox(parseInt(e.target.value) || 1)}
                    className="w-full bg-white border border-charcoal/10 px-3 py-2 outline-none font-mono text-xs disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Room/Wall Area inputs */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="font-sans text-[10px] text-charcoal/50 uppercase tracking-widest font-semibold">
                  2. ENTER FLOOR / WALL AREA MEASUREMENTS
                </label>
                <div className="flex border border-charcoal/10 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setUnit('feet')}
                    className={`px-3 py-1 font-sans text-[9px] uppercase tracking-wider cursor-pointer ${
                      unit === 'feet' ? 'bg-charcoal text-warmwhite font-semibold' : 'bg-white text-charcoal/60'
                    }`}
                  >
                    Feet (ft)
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnit('meters')}
                    className={`px-3 py-1 font-sans text-[9px] uppercase tracking-wider cursor-pointer ${
                      unit === 'meters' ? 'bg-charcoal text-warmwhite font-semibold' : 'bg-white text-charcoal/60'
                    }`}
                  >
                    Meters (m)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans text-[9px] text-charcoal/40 uppercase tracking-widest mb-1">Length</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      value={roomLength}
                      onChange={(e) => setRoomLength(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-charcoal/10 px-3 py-2 outline-none font-mono text-xs"
                    />
                    <span className="absolute right-3 top-2 text-[9px] font-mono text-charcoal/40">{unit === 'feet' ? 'ft' : 'm'}</span>
                  </div>
                </div>
                <div>
                  <label className="block font-sans text-[9px] text-charcoal/40 uppercase tracking-widest mb-1">Width</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      value={roomWidth}
                      onChange={(e) => setRoomWidth(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-charcoal/10 px-3 py-2 outline-none font-mono text-xs"
                    />
                    <span className="absolute right-3 top-2 text-[9px] font-mono text-charcoal/40">{unit === 'feet' ? 'ft' : 'm'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Grout & Pattern */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-sans text-[10px] text-charcoal/50 uppercase tracking-widest font-semibold mb-2">
                  3. GROUT JOINT WIDTH
                </label>
                <select
                  value={groutWidthMm}
                  onChange={(e) => setGroutWidthMm(parseInt(e.target.value))}
                  className="w-full bg-white border border-charcoal/10 px-3 py-2.5 outline-none font-sans text-xs cursor-pointer"
                >
                  <option value={0}>Seamless / Zero-Joint (0mm)</option>
                  <option value={2}>Standard Glazed Joint (2mm)</option>
                  <option value={3}>Medium Spacer (3mm)</option>
                  <option value={5}>Artisanal Cladding Spacer (5mm)</option>
                </select>
              </div>

              <div>
                <label className="block font-sans text-[10px] text-charcoal/50 uppercase tracking-widest font-semibold mb-2">
                  4. LAYING PATTERN (WASTAGE MULTIPLIER)
                </label>
                <select
                  value={patternType}
                  onChange={(e) => setPatternType(e.target.value as any)}
                  className="w-full bg-white border border-charcoal/10 px-3 py-2.5 outline-none font-sans text-xs cursor-pointer"
                >
                  <option value="straight">Straight Layout (+10% waste)</option>
                  <option value="diagonal">Diagonal Layout (+15% waste)</option>
                  <option value="herringbone">Herringbone / Complex (+18% waste)</option>
                </select>
              </div>
            </div>

            {/* Calculation results panel */}
            <div className="bg-ivory border border-charcoal/10 p-5 space-y-3 mt-2">
              <div className="flex items-center justify-between text-xs border-b border-charcoal/5 pb-2">
                <span className="text-charcoal/50 font-sans">Net Area Coverage</span>
                <span className="font-mono font-semibold text-charcoal">
                  {results.netAreaSqFt} Sq Ft ({results.netAreaSqM} Sq M)
                </span>
              </div>
              <div className="flex items-center justify-between text-xs border-b border-charcoal/5 pb-2">
                <span className="text-charcoal/50 font-sans">Wastage Buffer ({patternWaste[patternType]}%)</span>
                <span className="font-mono text-charcoal/60">+{results.wasteAreaSqFt} Sq Ft</span>
              </div>
              <div className="flex items-center justify-between text-xs border-b border-charcoal/5 pb-2">
                <span className="text-charcoal/50 font-sans flex items-center gap-1">
                  <Ruler className="w-3.5 h-3.5 text-gold-500" />
                  Estimated Tiles Required
                </span>
                <span className="font-mono font-bold text-charcoal">{results.tilesNeeded} Slabs</span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-charcoal/70 font-semibold font-sans">Total Boxes Packaged ({tilesPerBox} pcs/box)</span>
                <span className="font-mono font-extrabold text-gold-600 text-base">{results.boxesNeeded} Boxes</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-charcoal/40 uppercase tracking-widest justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              Algorithmic calculations account for grout line compensation
            </div>

          </div>

          {/* Column 2: Step-by-Step planning guide (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            <div className="bg-charcoal text-warmwhite p-6 sm:p-8 border border-white/5 relative">
              {/* Subtle gold decoration line */}
              <div className="absolute top-0 inset-x-0 h-0.5 bg-gold-500" />

              <div className="flex items-center gap-2 mb-4 text-gold-400">
                <BookOpen className="w-4 h-4 text-gold-500" />
                <span className="font-mono text-[9px] tracking-[0.25em] uppercase text-gold-500 font-bold">
                  PLANNING INSTRUCTIONAL GUIDE
                </span>
              </div>

              <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight mb-4 text-warmwhite">
                How to Calculate Tile Area for Accurate Planning
              </h3>

              <p className="font-sans text-[11px] text-gray-400 leading-relaxed mb-6">
                Accurate floor and wall planning ensures you purchase the exact quantity of boxes, avoiding site delays or shade mismatch variations from different manufacturing batches.
              </p>

              {/* Instructions list */}
              <div className="space-y-4 text-xs font-sans text-gray-300">
                <div className="flex items-start gap-3">
                  <span className="font-mono font-semibold text-gold-500 shrink-0 mt-0.5">STEP 1.</span>
                  <div>
                    <h4 className="font-bold text-white uppercase tracking-wider text-[10px]">Measure Room Square Footage</h4>
                    <p className="text-gray-400 text-[10.5px] leading-relaxed mt-0.5">
                      Multiply the length times the width of the floor area (e.g. 15 ft × 12 ft = 180 Sq Ft). Repeat for walls and subtract openings like doors.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="font-mono font-semibold text-gold-500 shrink-0 mt-0.5">STEP 2.</span>
                  <div>
                    <h4 className="font-bold text-white uppercase tracking-wider text-[10px]">Compensate for Grout Spacers</h4>
                    <p className="text-gray-400 text-[10.5px] leading-relaxed mt-0.5">
                      Add spacer width (usually 2mm or 3mm) to the tile size. This reduces the number of tiles needed marginally over large layouts.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="font-mono font-semibold text-gold-500 shrink-0 mt-0.5">STEP 3.</span>
                  <div>
                    <h4 className="font-bold text-white uppercase tracking-wider text-[10px]">Factor in Wastage Rules</h4>
                    <p className="text-gray-400 text-[10.5px] leading-relaxed mt-0.5">
                      Add a wastage buffer to cover corners, cuts, and breakages:
                      <span className="block text-gold-400/90 font-mono text-[10px] mt-1">
                        • Straight Tiles: Add 10%<br />
                        • Diagonal Laying: Add 15%<br />
                        • Herringbone Tiles: Add 18%
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="font-mono font-semibold text-gold-500 shrink-0 mt-0.5">STEP 4.</span>
                  <div>
                    <h4 className="font-bold text-white uppercase tracking-wider text-[10px]">Convert to Package Box Counts</h4>
                    <p className="text-gray-400 text-[10.5px] leading-relaxed mt-0.5">
                      Divide the total tiles count by the number of tiles packed per box (e.g. 180 tiles required / 2 tiles per box = 90 boxes). Always round up.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-sm mt-6">
                <AlertTriangle className="w-4 h-4 text-gold-500 shrink-0" />
                <span className="font-mono text-[9px] text-gold-400 tracking-wide leading-relaxed">
                  TIP: Keep 1 extra box in reserve storage for future pipeline or water repairs, as shade batch codes change dynamically.
                </span>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
