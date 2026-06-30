import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Calculator, Ruler, ShieldCheck, AlertTriangle,
  BookOpen, ChevronDown, ChevronUp, LayoutGrid
} from 'lucide-react';
import { useProducts } from '../hooks/useProducts';

interface CalculatorPageProps {
  onBack: () => void;
}

const patternWaste = { straight: 10, diagonal: 15, herringbone: 18 } as const;
type Pattern = keyof typeof patternWaste;

// Common standard tile sizes for quick-pick
const STANDARD_SIZES = [
  { label: '300 × 300 mm', l: 300, w: 300 },
  { label: '400 × 400 mm', l: 400, w: 400 },
  { label: '600 × 600 mm', l: 600, w: 600 },
  { label: '800 × 800 mm', l: 800, w: 800 },
  { label: '600 × 1200 mm', l: 600, w: 1200 },
  { label: '800 × 1600 mm', l: 800, w: 1600 },
  { label: '1200 × 1200 mm', l: 1200, w: 1200 },
  { label: '1200 × 2400 mm', l: 1200, w: 2400 },
];

const FAQ_ITEMS = [
  {
    q: 'How much extra tile should I order for wastage?',
    a: 'Order 10% extra for straight-lay patterns, 15% for diagonal, and 18% for herringbone or complex patterns. Always round up to the nearest full box. Keeping 1 spare box is also recommended for future repairs.'
  },
  {
    q: 'What is a grout joint and how does it affect quantity?',
    a: 'A grout joint is the gap between tiles filled with grout mortar. Standard joints are 2–3mm. Wider joints slightly reduce the number of tiles needed across a large area, which our calculator accounts for automatically.'
  },
  {
    q: 'How do I calculate tile quantity for an L-shaped or irregular room?',
    a: 'Break the room into rectangular sections, calculate each individually using Length × Width, then sum all areas. Add the standard wastage percentage to the total.'
  },
  {
    q: 'Do I need to deduct doors and windows from my area?',
    a: 'For floors, no. For walls, yes — deduct door and window openings. Subtract (Width × Height) of each opening from your total wall area before calculating.'
  },
  {
    q: 'How many tiles come in a box?',
    a: 'This depends on tile size. Large format slabs (1200×2400) typically come 1 per box. Medium tiles (600×600, 800×800) come 2–4 per box. Smaller tiles (300×300) come 8–12 per box. Always check the actual box label.'
  },
];

export default function CalculatorPage({ onBack }: CalculatorPageProps) {
  const { data: productsData } = useProducts({}, { field: 'popularity_score', direction: 'desc' }, 1, 1000);
  const products = productsData?.products || [];

  // — Tile selection
  const [selectedPresetId, setSelectedPresetId] = useState<string>('custom');
  const [selectedStdSize, setSelectedStdSize] = useState<number>(-1);
  const [tileLengthMm, setTileLengthMm] = useState<number>(600);
  const [tileWidthMm, setTileWidthMm] = useState<number>(600);
  const [tilesPerBox, setTilesPerBox] = useState<number>(3);

  // — Room inputs
  const [unit, setUnit] = useState<'feet' | 'meters'>('feet');
  const [roomLength, setRoomLength] = useState<number>(15);
  const [roomWidth, setRoomWidth] = useState<number>(12);

  // — Options
  const [groutWidthMm, setGroutWidthMm] = useState<number>(2);
  const [patternType, setPatternType] = useState<Pattern>('straight');
  const [extraBoxes, setExtraBoxes] = useState<number>(1);

  // — FAQ
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // — Results ref for scroll
  const resultsRef = useRef<HTMLDivElement>(null);

  // Sync preset tile selection
  useEffect(() => {
    if (selectedPresetId === 'custom') return;
    const tile = products.find(t => t.id === selectedPresetId);
    if (tile) {
      const match = tile.size.toLowerCase().match(/(\d+)\s*x\s*(\d+)\s*(mm|cm|in|m)/);
      if (match) {
        let l = parseFloat(match[1]);
        let w = parseFloat(match[2]);
        if (match[3] === 'cm') { l *= 10; w *= 10; }
        if (match[3] === 'm') { l *= 1000; w *= 1000; }
        setTileLengthMm(l);
        setTileWidthMm(w);
        const area = (l / 1000) * (w / 1000);
        setTilesPerBox(area > 2 ? 1 : area > 1.2 ? 2 : area > 0.5 ? 3 : area > 0.1 ? 8 : 24);
      }
      setSelectedStdSize(-1);
    }
  }, [selectedPresetId, products]);

  // Sync standard size pick
  const handleStdSize = (idx: number) => {
    const s = STANDARD_SIZES[idx];
    setSelectedStdSize(idx);
    setSelectedPresetId('custom');
    setTileLengthMm(s.l);
    setTileWidthMm(s.w);
    const area = (s.l / 1000) * (s.w / 1000);
    setTilesPerBox(area > 2 ? 1 : area > 1.2 ? 2 : area > 0.5 ? 3 : area > 0.1 ? 8 : 24);
  };

  // — Core calculation engine
  const calc = () => {
    const rawArea = roomLength * roomWidth;
    let netSqM = unit === 'meters' ? rawArea : rawArea / 10.7639;
    let netSqFt = unit === 'feet' ? rawArea : rawArea * 10.7639;

    const tileLM = tileLengthMm / 1000;
    const tileWM = tileWidthMm / 1000;
    const groutM = groutWidthMm / 1000;

    const effL = tileLM + groutM;
    const effW = tileWM + groutM;
    const effTileArea = effL * effW;
    const plainTileArea = tileLM * tileWM;

    const baseCount = netSqM / effTileArea;
    const wastePct = patternWaste[patternType];
    const totalTiles = Math.ceil(baseCount * (1 + wastePct / 100));
    const boxesRaw = Math.ceil(totalTiles / tilesPerBox);
    const totalBoxes = boxesRaw + extraBoxes;

    const wasteAreaSqFt = netSqFt * (wastePct / 100);
    const totalSqFt = netSqFt + wasteAreaSqFt;
    const totalSqM = netSqM * (1 + wastePct / 100);

    return {
      netSqFt: +netSqFt.toFixed(2),
      netSqM: +netSqM.toFixed(2),
      wastePct,
      wasteAreaSqFt: +wasteAreaSqFt.toFixed(2),
      totalSqFt: +totalSqFt.toFixed(2),
      totalSqM: +totalSqM.toFixed(2),
      tileSizeLabel: `${tileLengthMm} × ${tileWidthMm} mm`,
      tileAreaSqM: +(plainTileArea).toFixed(4),
      tileAreaSqFt: +(plainTileArea * 10.7639).toFixed(4),
      tilesPerBox,
      baseCount: +baseCount.toFixed(2),
      totalTiles,
      boxesRaw,
      extraBoxes,
      totalBoxes,
    };
  };

  const r = calc();

  return (
    <div className="min-h-screen bg-ivory" id="calculator-page">
      {/* ── Page Header Bar ── */}
      <div className="sticky top-0 z-40 bg-warmwhite/90 backdrop-blur-xl border-b border-charcoal/8 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-charcoal/60 hover:text-charcoal transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-mono text-[10px] tracking-widest uppercase">Back to Home</span>
          </button>

          <div className="flex flex-col items-center">
            <span className="font-serif text-sm font-bold tracking-[0.25em] uppercase text-charcoal">The Tile Store</span>
            <span className="font-mono text-[8px] tracking-[0.25em] uppercase text-charcoal/40">SURFACES & INTERIORS ARCHIVE</span>
          </div>

          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-gold-600" />
            <span className="font-mono text-[10px] tracking-widest uppercase text-charcoal/50 hidden sm:block">
              Tile Calculator
            </span>
          </div>
        </div>
      </div>

      {/* ── Hero Strip ── */}
      <div className="bg-charcoal py-12 md:py-16 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex items-center gap-2 mb-3">
            <span className="h-[1px] w-8 bg-gold-500" />
            <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-gold-500">
              ATELIER CALCULATION SUITE
            </span>
          </div>
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-warmwhite tracking-tight mb-3">
            Tile Area Calculator
          </h1>
          <p className="font-sans text-sm text-warmwhite/50 max-w-xl leading-relaxed">
            Calculate tile quantity, boxes, wastage, and grout compensation with the same accuracy used by professional architects and interior designers.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-16">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">

          {/* ══ LEFT: CALCULATOR FORM (7 cols) ══ */}
          <div className="xl:col-span-7 space-y-6">

            {/* — Step 1: Select Tile Size — */}
            <div className="bg-white border border-charcoal/8 shadow-sm p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-5 pb-4 border-b border-charcoal/5">
                <span className="font-sans text-xs font-semibold uppercase tracking-widest text-charcoal">Select Tile Size</span>
              </div>

              {/* Quick-pick standard sizes */}
              <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-charcoal/40 mb-3">STANDARD SIZES — QUICK PICK</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
                {STANDARD_SIZES.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleStdSize(idx)}
                    className={`px-3 py-2 border font-mono text-[10px] tracking-wide cursor-pointer transition-all ${
                      selectedStdSize === idx
                        ? 'bg-charcoal text-gold-400 border-charcoal font-bold'
                        : 'bg-ivory border-charcoal/10 text-charcoal/60 hover:border-gold-400 hover:text-charcoal'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Or pick from catalog */}
              <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-charcoal/40 mb-2">OR SELECT FROM OUR CATALOG</p>
              <select
                value={selectedPresetId}
                onChange={(e) => { setSelectedPresetId(e.target.value); setSelectedStdSize(-1); }}
                className="w-full bg-ivory border border-charcoal/10 px-3 py-2.5 outline-none font-sans text-xs tracking-wider cursor-pointer mb-5 text-charcoal"
              >
                <option value="custom">-- Custom Dimensions --</option>
                {products.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.size})</option>
                ))}
              </select>

              {/* Manual inputs */}
              <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-charcoal/40 mb-2">MANUAL DIMENSIONS</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-sans text-[9px] text-charcoal/40 uppercase tracking-widest mb-1">Length (mm)</label>
                  <input type="number" min="1" value={tileLengthMm}
                    onChange={e => { setTileLengthMm(+e.target.value || 0); setSelectedPresetId('custom'); setSelectedStdSize(-1); }}
                    className="w-full bg-white border border-charcoal/10 px-3 py-2 outline-none font-mono text-xs focus:border-gold-400 transition-colors" />
                </div>
                <div>
                  <label className="block font-sans text-[9px] text-charcoal/40 uppercase tracking-widest mb-1">Width (mm)</label>
                  <input type="number" min="1" value={tileWidthMm}
                    onChange={e => { setTileWidthMm(+e.target.value || 0); setSelectedPresetId('custom'); setSelectedStdSize(-1); }}
                    className="w-full bg-white border border-charcoal/10 px-3 py-2 outline-none font-mono text-xs focus:border-gold-400 transition-colors" />
                </div>
                <div>
                  <label className="block font-sans text-[9px] text-charcoal/40 uppercase tracking-widest mb-1">Tiles / Box</label>
                  <input type="number" min="1" value={tilesPerBox}
                    onChange={e => setTilesPerBox(+e.target.value || 1)}
                    className="w-full bg-white border border-charcoal/10 px-3 py-2 outline-none font-mono text-xs focus:border-gold-400 transition-colors" />
                </div>
              </div>
            </div>

            {/* — Step 2: Room Area — */}
            <div className="bg-white border border-charcoal/8 shadow-sm p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-5 pb-4 border-b border-charcoal/5">
                <span className="font-sans text-xs font-semibold uppercase tracking-widest text-charcoal">Enter Measurements</span>

                {/* Unit toggle */}
                <div className="ml-auto flex border border-charcoal/10 overflow-hidden">
                  {(['feet', 'meters'] as const).map(u => (
                    <button key={u} type="button" onClick={() => setUnit(u)}
                      className={`px-4 py-1.5 font-mono text-[9px] uppercase tracking-wider cursor-pointer transition-colors ${
                        unit === u ? 'bg-charcoal text-warmwhite font-bold' : 'bg-white text-charcoal/50 hover:bg-ivory'
                      }`}>
                      {u === 'feet' ? 'Feet (ft)' : 'Meters (m)'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans text-[9px] text-charcoal/40 uppercase tracking-widest mb-1">Room Length</label>
                  <div className="relative">
                    <input type="number" min="0.1" step="0.1" value={roomLength}
                      onChange={e => setRoomLength(+e.target.value || 0)}
                      className="w-full bg-white border border-charcoal/10 px-3 py-2.5 outline-none font-mono text-sm focus:border-gold-400 transition-colors" />
                    <span className="absolute right-3 top-2.5 text-[9px] font-mono text-charcoal/40">{unit === 'feet' ? 'ft' : 'm'}</span>
                  </div>
                </div>
                <div>
                  <label className="block font-sans text-[9px] text-charcoal/40 uppercase tracking-widest mb-1">Room Width</label>
                  <div className="relative">
                    <input type="number" min="0.1" step="0.1" value={roomWidth}
                      onChange={e => setRoomWidth(+e.target.value || 0)}
                      className="w-full bg-white border border-charcoal/10 px-3 py-2.5 outline-none font-mono text-sm focus:border-gold-400 transition-colors" />
                    <span className="absolute right-3 top-2.5 text-[9px] font-mono text-charcoal/40">{unit === 'feet' ? 'ft' : 'm'}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* — Step 3: Grout & Pattern — */}
            <div className="bg-white border border-charcoal/8 shadow-sm p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-5 pb-4 border-b border-charcoal/5">
                <span className="font-sans text-xs font-semibold uppercase tracking-widest text-charcoal">Grout & Laying Pattern</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-sans text-[9px] text-charcoal/40 uppercase tracking-widest mb-2">Grout Joint Width</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[{ v: 0, label: '0 mm\nSeamless' }, { v: 2, label: '2 mm\nStandard' }, { v: 3, label: '3 mm\nMedium' }, { v: 5, label: '5 mm\nArtisanal' }].map(g => (
                      <button key={g.v} type="button" onClick={() => setGroutWidthMm(g.v)}
                        className={`py-2.5 px-2 border font-mono text-[10px] leading-tight cursor-pointer transition-all whitespace-pre-line ${
                          groutWidthMm === g.v
                            ? 'bg-charcoal text-gold-400 border-charcoal font-bold'
                            : 'border-charcoal/10 text-charcoal/60 hover:border-gold-400 hover:text-charcoal'
                        }`}>
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-sans text-[9px] text-charcoal/40 uppercase tracking-widest mb-2">Laying Pattern</label>
                  <div className="space-y-2">
                    {([
                      { id: 'straight', label: 'Straight Layout', waste: '10%', desc: 'Standard grid' },
                      { id: 'diagonal', label: 'Diagonal Layout', waste: '15%', desc: '45° angle cut' },
                      { id: 'herringbone', label: 'Herringbone / Complex', waste: '18%', desc: 'V-pattern' },
                    ] as { id: Pattern; label: string; waste: string; desc: string }[]).map(p => (
                      <button key={p.id} type="button" onClick={() => setPatternType(p.id)}
                        className={`w-full flex items-center justify-between px-4 py-3 border cursor-pointer transition-all ${
                          patternType === p.id
                            ? 'bg-charcoal text-warmwhite border-charcoal'
                            : 'border-charcoal/10 text-charcoal hover:border-gold-400'
                        }`}>
                        <div className="text-left">
                          <p className="font-sans text-xs font-medium">{p.label}</p>
                          <p className={`font-mono text-[9px] ${patternType === p.id ? 'text-warmwhite/50' : 'text-charcoal/40'}`}>{p.desc}</p>
                        </div>
                        <span className={`font-mono text-xs font-bold ${patternType === p.id ? 'text-gold-400' : 'text-gold-600'}`}>
                          +{p.waste} waste
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* — Step 4: Extra Boxes — */}
            <div className="bg-white border border-charcoal/8 shadow-sm p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-charcoal/5">
                <span className="font-sans text-xs font-semibold uppercase tracking-widest text-charcoal">Reserve / Spare Boxes</span>
              </div>
              <p className="font-sans text-xs text-charcoal/50 mb-4 leading-relaxed">
                We recommend keeping at least <strong>1 spare box</strong> in storage for future repairs. Shade batch codes change between manufacturing runs.
              </p>
              <div className="flex items-center gap-3">
                {[0, 1, 2, 3].map(n => (
                  <button key={n} type="button" onClick={() => setExtraBoxes(n)}
                    className={`w-12 h-12 border font-mono text-sm font-bold cursor-pointer transition-all ${
                      extraBoxes === n ? 'bg-charcoal text-gold-400 border-charcoal' : 'border-charcoal/10 text-charcoal/60 hover:border-gold-400'
                    }`}>
                    {n}
                  </button>
                ))}
                <span className="font-mono text-[9px] tracking-widest text-charcoal/40 uppercase ml-2">
                  extra boxes
                </span>
              </div>
            </div>

          </div>

          {/* ══ RIGHT: RESULTS + GUIDE (5 cols) ══ */}
          <div className="xl:col-span-5 space-y-6" ref={resultsRef}>

            {/* — Live Result Summary — */}
            <motion.div
              key={`${r.totalBoxes}-${r.totalTiles}`}
              initial={{ scale: 0.98, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-charcoal text-warmwhite border border-white/5 shadow-2xl"
              id="calculator-results"
            >
              <div className="p-6 border-b border-white/5">
                <div className="flex items-center gap-2 mb-1">
                  <Calculator className="w-4 h-4 text-gold-500" />
                  <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-gold-500">LIVE RESULT</span>
                </div>
                <p className="font-mono text-[9px] text-warmwhite/30 uppercase tracking-widest">
                  Updates automatically as you change inputs
                </p>
              </div>

              {/* Primary Output */}
              <div className="p-6 flex flex-col items-center text-center border-b border-white/5">
                <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-warmwhite/40 mb-1">TOTAL BOXES REQUIRED</p>
                <p className="font-serif text-6xl font-bold text-gold-400 leading-none">{r.totalBoxes}</p>
                <p className="font-mono text-xs text-warmwhite/50 mt-2">
                  {r.boxesRaw} boxes + {r.extraBoxes} spare
                </p>
              </div>

              <div className="p-6 space-y-0">
                {[
                  { label: 'Tile Size Selected', value: r.tileSizeLabel },
                  { label: 'Tiles Per Box', value: `${r.tilesPerBox} pcs` },
                  { label: 'Net Floor Area', value: `${r.netSqFt} sq ft (${r.netSqM} sq m)` },
                  { label: `Wastage (${r.wastePct}%)`, value: `+${r.wasteAreaSqFt} sq ft`, muted: true },
                  { label: 'Total Area (with wastage)', value: `${r.totalSqFt} sq ft` },
                  { label: 'Total Tiles Required', value: `${r.totalTiles} tiles` },
                ].map((row, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                    <span className={`font-sans text-xs ${row.muted ? 'text-warmwhite/40' : 'text-warmwhite/60'}`}>{row.label}</span>
                    <span className={`font-mono text-xs font-semibold ${row.muted ? 'text-warmwhite/40' : 'text-warmwhite'}`}>{row.value}</span>
                  </div>
                ))}
              </div>

              <div className="px-6 pb-6">
                <div className="flex items-center gap-2 py-3 px-4 bg-white/5 border border-white/10">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="font-mono text-[9px] text-warmwhite/50 tracking-wide leading-relaxed">
                    Calculation accounts for grout joint compensation ({groutWidthMm}mm) and {r.wastePct}% pattern wastage.
                  </span>
                </div>
              </div>
            </motion.div>

            {/* — Calculation Breakdown — */}
            <div className="bg-white border border-charcoal/8 shadow-sm">
              <div className="px-6 py-5 border-b border-charcoal/5 flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-gold-600" />
                <h3 className="font-sans text-xs font-semibold uppercase tracking-widest text-charcoal">Calculation Breakdown</h3>
              </div>
              <div className="p-6 space-y-3 font-mono text-xs">
                {/* Formula steps */}
                {[
                  {
                    step: 'Step 1 — Net Floor Area',
                    formula: `${roomLength} ${unit === 'feet' ? 'ft' : 'm'} × ${roomWidth} ${unit === 'feet' ? 'ft' : 'm'}`,
                    result: `= ${r.netSqFt} sq ft (${r.netSqM} sq m)`,
                    highlight: false,
                  },
                  {
                    step: 'Step 2 — Tile Area (with grout)',
                    formula: `(${tileLengthMm} + ${groutWidthMm}) mm × (${tileWidthMm} + ${groutWidthMm}) mm`,
                    result: `= ${r.tileAreaSqM} sq m per tile`,
                    highlight: false,
                  },
                  {
                    step: 'Step 3 — Base Tile Count',
                    formula: `${r.netSqM} ÷ ${r.tileAreaSqM}`,
                    result: `≈ ${r.baseCount} tiles`,
                    highlight: false,
                  },
                  {
                    step: `Step 4 — Add ${r.wastePct}% Wastage (${patternType})`,
                    formula: `${r.baseCount} × ${(1 + r.wastePct / 100).toFixed(2)}`,
                    result: `= ${r.totalTiles} tiles (rounded up)`,
                    highlight: false,
                  },
                  {
                    step: `Step 5 — Convert to Boxes (${r.tilesPerBox} tiles/box)`,
                    formula: `⌈${r.totalTiles} ÷ ${r.tilesPerBox}⌉`,
                    result: `= ${r.boxesRaw} boxes`,
                    highlight: false,
                  },
                  {
                    step: `Step 6 — Add ${r.extraBoxes} Spare Box${r.extraBoxes !== 1 ? 'es' : ''}`,
                    formula: `${r.boxesRaw} + ${r.extraBoxes}`,
                    result: `= ${r.totalBoxes} boxes`,
                    highlight: true,
                  },
                ].map((row, idx) => (
                  <div key={idx} className={`p-3 ${row.highlight ? 'bg-gold-50 border border-gold-200/50' : 'bg-ivory border border-charcoal/5'}`}>
                    <p className={`text-[9px] tracking-widest uppercase mb-1 ${row.highlight ? 'text-gold-700 font-bold' : 'text-charcoal/40'}`}>
                      {row.step}
                    </p>
                    <p className="text-charcoal/60 text-[11px]">{row.formula}</p>
                    <p className={`font-semibold mt-0.5 ${row.highlight ? 'text-gold-700 text-sm' : 'text-charcoal'}`}>
                      {row.result}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ══ FULL-WIDTH: HOW TO CALCULATE GUIDE ══ */}
        <div className="mt-16 pt-16 border-t border-charcoal/8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

            {/* Left: Section Title + Intro */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-gold-600" />
                <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-gold-600 font-semibold">
                  PLANNING GUIDE
                </span>
              </div>
              <h2 className="font-serif text-2xl md:text-4xl font-bold text-charcoal tracking-tight mb-4">
                How to Calculate Tile Area for Accurate Planning
              </h2>
              <p className="font-sans text-sm text-charcoal/60 leading-relaxed mb-8">
                Accurate tile planning ensures you purchase the precise number of boxes, preventing site delays, shade batch mismatches, or unnecessary wastage. Follow this professional step-by-step method used by architects and project managers.
              </p>

              {/* Steps */}
              <div className="space-y-6">
                {[
                  {
                    n: '01',
                    title: 'Measure Your Room Accurately',
                    body: 'Use a steel measuring tape — not a cloth one. Measure the length and width of your floor at the longest points. For irregular rooms, divide the area into rectangles and calculate each separately.',
                    tip: 'Measure at least twice and verify. Even a 6-inch error can cost you boxes.'
                  },
                  {
                    n: '02',
                    title: 'Calculate the Net Floor Area',
                    body: 'Multiply Length × Width. For example, a room of 15 ft × 12 ft = 180 sq ft. For walls, also subtract door and window openings (Width × Height of each opening).',
                    tip: null
                  },
                  {
                    n: '03',
                    title: 'Account for Grout Joints',
                    body: 'Add the grout joint width (typically 2–3mm) to each tile dimension before calculating. Over 100+ tiles this makes a small but meaningful difference, particularly on large-format tiles.',
                    tip: 'Polished tiles: 1.5–2mm joints. Matte/structured: 3mm. Outdoor: 5mm minimum.'
                  },
                  {
                    n: '04',
                    title: 'Apply the Wastage Factor',
                    body: 'Add a percentage buffer to cover corner cuts, edge cuts, breakages, and installation errors. The standard rates are:',
                    bullets: ['Straight layout: +10%', 'Diagonal (45°) layout: +15%', 'Herringbone or complex: +18%'],
                    tip: null
                  },
                  {
                    n: '05',
                    title: 'Convert Tiles to Boxes',
                    body: 'Divide your total tile count by the number of tiles per box. Always round up (ceiling function) — never round down. Then add 1–2 extra boxes for future repairs.',
                    tip: 'Keep spare boxes from the same production batch. Shade codes change batch-to-batch.'
                  },
                ].map((s, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.08 }}
                    className="flex gap-5"
                  >
                    <div className="flex-1 pt-1">
                      <h3 className="font-sans text-sm font-semibold text-charcoal mb-1.5">{s.title}</h3>
                      <p className="font-sans text-xs text-charcoal/60 leading-relaxed">{s.body}</p>
                      {s.bullets && (
                        <ul className="mt-2 space-y-1">
                          {s.bullets.map((b, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-gold-500 rounded-full flex-shrink-0" />
                              <span className="font-mono text-[10px] text-gold-700">{b}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      {s.tip && (
                        <div className="mt-3 flex items-start gap-2 p-2.5 bg-gold-50 border border-gold-200/40">
                          <AlertTriangle className="w-3.5 h-3.5 text-gold-600 flex-shrink-0 mt-0.5" />
                          <span className="font-mono text-[9px] text-gold-700 leading-relaxed">{s.tip}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right: Formula Reference Card + FAQs */}
            <div className="space-y-6">


              {/* FAQs */}
              <div className="bg-white border border-charcoal/8">
                <div className="px-6 py-5 border-b border-charcoal/5">
                  <h3 className="font-sans text-xs font-semibold uppercase tracking-widest text-charcoal">
                    Frequently Asked Questions
                  </h3>
                </div>
                <div className="divide-y divide-charcoal/5">
                  {FAQ_ITEMS.map((item, idx) => (
                    <div key={idx}>
                      <button
                        type="button"
                        onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                        className="w-full flex items-center justify-between px-6 py-4 text-left cursor-pointer hover:bg-ivory/60 transition-colors"
                      >
                        <span className="font-sans text-xs font-medium text-charcoal pr-6">{item.q}</span>
                        {openFaq === idx
                          ? <ChevronUp className="w-4 h-4 text-gold-500 flex-shrink-0" />
                          : <ChevronDown className="w-4 h-4 text-charcoal/30 flex-shrink-0" />
                        }
                      </button>
                      <AnimatePresence>
                        {openFaq === idx && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                          >
                            <p className="px-6 pb-4 font-sans text-xs text-charcoal/55 leading-relaxed border-t border-charcoal/5 pt-3">
                              {item.a}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* ── Footer Note ── */}
      <div className="bg-charcoal py-8 mt-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-mono text-[9px] tracking-widest uppercase text-warmwhite/30">
            © {new Date().getFullYear()} The Tile Store — Surfaces & Interiors Archive
          </p>
          <button
            onClick={onBack}
            className="flex items-center gap-2 font-mono text-[9px] tracking-widest uppercase text-gold-500 hover:text-gold-400 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to Main Site
          </button>
        </div>
      </div>
    </div>
  );
}
