import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Heart, ShoppingBag, Eye, Info, Check,
  MapPin, Truck, ShieldCheck, ChevronRight, Star, HelpCircle,
  BookOpen, ArrowRight, Sparkles
} from 'lucide-react';
import { TileProduct } from '../types';
import Breadcrumbs from '../components/Breadcrumbs';
import { useProduct, useRelatedProducts } from '../hooks/useProducts';
import { trackProductView } from '../lib/analytics';

interface ProductDetailPageProps {
  productId: string;
  onNavigate: (hash: string) => void;
  onAddToInquiry: (product: TileProduct) => void;
  onAddToWishlist: (product: TileProduct) => void;
  onRemoveFromWishlist: (tileId: string) => void;
  wishlist: TileProduct[];
  comparedProducts: TileProduct[];
  onAddToCompare: (product: TileProduct) => void;
  onRemoveFromCompare: (tileId: string) => void;
  onSelectTileForVisualizer: (tile: TileProduct) => void;
}

type TabId = 'specs' | 'shipping' | 'reviews' | 'instructions';

export default function ProductDetailPage({
  productId,
  onNavigate,
  onAddToInquiry,
  onAddToWishlist,
  onRemoveFromWishlist,
  wishlist,
  comparedProducts,
  onAddToCompare,
  onRemoveFromCompare,
  onSelectTileForVisualizer
}: ProductDetailPageProps) {
  const [activeTab, setActiveTab] = useState<TabId>('specs');
  const [zipCode, setZipCode] = useState('');
  const [deliveryEstimate, setDeliveryEstimate] = useState<{
    available: boolean;
    days: number;
    cost: string;
    partner: string;
  } | null>(null);
  const [estimating, setEstimating] = useState(false);

  const { data: product, isLoading: productLoading } = useProduct(productId);
  const { data: relatedProducts } = useRelatedProducts(product?.id || '', 4);

  // Track product page view in analytics
  useEffect(() => {
    if (product) {
      trackProductView(productId, 'direct');
    }
    window.scrollTo(0, 0);
  }, [productId, product]);

  if (productLoading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center pt-24">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-charcoal/20 border-t-charcoal rounded-full animate-spin" />
          <span className="font-mono text-xs tracking-widest text-charcoal/40 uppercase">Loading Surface Dossier...</span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center pt-24">
        <div className="text-center">
          <h2 className="font-serif text-2xl font-bold text-charcoal mb-2">Surface Dossier Not Found</h2>
          <button onClick={() => onNavigate('#/collections')} className="mt-4 px-6 py-2.5 bg-charcoal text-warmwhite font-sans text-xs tracking-widest uppercase cursor-pointer">
            Return to Collections
          </button>
        </div>
      </div>
    );
  }

  // Wishlist / Compare helper checks
  const isInWishlist = wishlist.some(item => item.id === product.id);


  const estimateDelivery = () => {
    if (!zipCode || zipCode.length < 5) return;
    setEstimating(true);
    setTimeout(() => {
      const zipNum = parseInt(zipCode.substring(0, 3)) || 100;
      const isMetro = zipNum >= 100 && zipNum <= 600;
      setDeliveryEstimate({
        available: true,
        days: isMetro ? 3 + Math.floor(Math.random() * 2) : 5 + Math.floor(Math.random() * 4),
        cost: isMetro ? 'Free (Atelier VIP Delivery)' : '₹1,500 — ₹3,000 Flat rate',
        partner: isMetro ? 'Atelier Express Fleet' : 'Premium Dry Freight Network',
      });
      setEstimating(false);
    }, 1000);
  };


  const breadcrumbs = [
    { label: 'Collections', hash: '#/collections' },
    { label: product.category.charAt(0).toUpperCase() + product.category.slice(1) + ' Surfaces', hash: `#/category/${product.category}` },
    { label: product.name }
  ];

  return (
    <div className="min-h-screen bg-ivory pt-24 pb-16" id="product-detail-page">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Breadcrumb row & Back button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <Breadcrumbs items={breadcrumbs} onNavigate={onNavigate} />
          
          <button
            onClick={() => onNavigate('#/collections')}
            className="flex items-center gap-1.5 font-mono text-[9px] tracking-widest uppercase text-charcoal/50 hover:text-charcoal transition-colors cursor-pointer self-start sm:self-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Collections
          </button>
        </div>

        {/* Product Core Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-16">
          
          {/* LEFT COLUMN: Cinematic visuals (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="relative aspect-[4/3] bg-white border border-charcoal/10 overflow-hidden shadow-xl group">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
              />
              
              {/* Overlay elements */}
              <div className="absolute top-4 left-4 z-10 bg-charcoal/90 text-warmwhite px-3 py-1.5 font-mono text-[8px] tracking-[0.25em] uppercase">
                ORIGIN: {product.origin}
              </div>

              <div className="absolute bottom-4 right-4 z-10 bg-gold-500 text-charcoal px-3 py-1.5 font-mono text-[9px] tracking-widest font-bold uppercase shadow-lg">
                {product.priceCategory} CLASS
              </div>

              {/* Seamless scale visual overlay */}
              <div className="absolute bottom-4 left-4 z-10 glass-panel-dark p-2 text-white text-[8px] font-mono tracking-widest uppercase flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-gold-500" />
                Sizing: {product.size}
              </div>
            </div>

            {/* Micro snaps detail view list */}
            <div className="grid grid-cols-3 gap-4">
              <div className="aspect-square bg-white border border-charcoal/10 overflow-hidden relative shadow-sm">
                <img src={product.image} alt="Detail" className="w-full h-full object-cover scale-150" />
                <div className="absolute inset-0 bg-charcoal/10" />
                <span className="absolute bottom-2 left-2 font-mono text-[7px] text-white tracking-widest uppercase bg-charcoal/80 px-1.5 py-0.5">Vein Zoom</span>
              </div>
              <div className="aspect-square bg-white border border-charcoal/10 overflow-hidden relative shadow-sm flex flex-col items-center justify-center p-3 text-center">
                <ShieldCheck className="w-5 h-5 text-gold-600 mb-1.5" />
                <span className="font-mono text-[8.5px] font-bold text-charcoal uppercase tracking-widest">WARRANTY</span>
                <span className="font-sans text-[9px] text-charcoal/50 mt-0.5">Lifetime structural coverage</span>
              </div>
              <div className="aspect-square bg-white border border-charcoal/10 overflow-hidden relative shadow-sm flex flex-col items-center justify-center p-3 text-center">
                <MapPin className="w-5 h-5 text-gold-600 mb-1.5" />
                <span className="font-mono text-[8.5px] font-bold text-charcoal uppercase tracking-widest">STOCK STATUS</span>
                <span className="font-sans text-[9px] text-emerald-600 font-semibold mt-0.5">Kochi Warehouse</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Specifications and Spec Controls (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-[9px] tracking-[0.25em] text-gold-600 font-bold uppercase">
                  {product.brand || 'ATELIER EXCLUSIVE'}
                </span>
                <span className="h-[1px] w-4 bg-gold-400"></span>
                <span className="font-mono text-[9px] text-charcoal/40 uppercase tracking-widest">
                  SKU: {product.code}
                </span>
              </div>

              <h1 className="font-serif text-3xl md:text-4xl font-bold text-charcoal tracking-tight leading-tight mb-3">
                {product.name}
              </h1>

              <p className="font-sans text-xs sm:text-sm text-charcoal/60 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Quick Specs summary */}
            <div className="p-4 bg-white border border-charcoal/8 space-y-2">
              <div className="flex justify-between text-xs py-1 border-b border-charcoal/5">
                <span className="text-charcoal/50">Base Material</span>
                <span className="font-mono text-charcoal font-medium">{product.material}</span>
              </div>
              <div className="flex justify-between text-xs py-1 border-b border-charcoal/5">
                <span className="text-charcoal/50">Surface finish</span>
                <span className="font-mono text-charcoal font-medium text-gold-600">{product.finish}</span>
              </div>
              <div className="flex justify-between text-xs py-1 border-b border-charcoal/5">
                <span className="text-charcoal/50">Module Dimensions</span>
                <span className="font-mono text-charcoal font-medium">{product.size}</span>
              </div>
              {product.thickness && (
                <div className="flex justify-between text-xs py-1">
                  <span className="text-charcoal/50">Thickness</span>
                  <span className="font-mono text-charcoal font-medium">{product.thickness}</span>
                </div>
              )}
            </div>

            {/* Action buttons panel */}
            <div className="space-y-2.5 pt-2">
              {/* Inquiry & spatial button */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onAddToInquiry(product)}
                  className="py-4 bg-charcoal text-warmwhite hover:bg-gold-500 hover:text-charcoal border border-charcoal hover:border-gold-500 font-mono text-[10px] tracking-widest uppercase font-bold transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Add to Inquiry
                </button>

                <button
                  onClick={() => {
                    onSelectTileForVisualizer(product);
                    onNavigate('#/visualizer');
                  }}
                  className="py-4 bg-transparent border border-charcoal/20 hover:border-gold-500 hover:text-gold-600 text-charcoal font-mono text-[10px] tracking-widest uppercase font-bold transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  Spatial Preview
                </button>
              </div>

              {/* Quick specs utility row */}
              <button
                onClick={() => {
                  if (isInWishlist) {
                    onRemoveFromWishlist(product.id);
                  } else {
                    onAddToWishlist(product);
                  }
                }}
                className="py-2.5 border border-charcoal/10 hover:border-gold-500 text-charcoal hover:bg-gold-50 text-[9px] font-mono tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer w-full mt-1"
              >
                <Heart className={`w-3.5 h-3.5 ${isInWishlist ? 'fill-gold-600 text-gold-600' : ''}`} />
                {isInWishlist ? 'Saved in Wishlist' : 'Add to Wishlist'}
              </button>
            </div>

            {/* Usage warning tag */}
            <div className="p-3.5 bg-gold-50 border border-gold-200/50 flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-gold-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-mono text-[9px] tracking-wider text-gold-700 font-bold uppercase">ARCHITECTURAL USAGE RECOMMENDATION</p>
                <p className="font-sans text-[11px] text-gold-800 leading-relaxed mt-0.5">
                  Certified for {product.usageArea?.join(', ') || 'general indoor walls and floors'}. Resistant to high chemical cleaners and structural load stresses.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Info Block (Specs, Shipping, Reviews, Instructions) */}
        <div className="bg-white border border-charcoal/10 shadow-sm mb-16" id="product-tabs-section">
          {/* Tab headers */}
          <div className="flex border-b border-charcoal/10 overflow-x-auto no-scrollbar bg-ivory/30">
            {[
              { id: 'specs', label: 'Technical Spec Sheet' },
              { id: 'shipping', label: 'Regional Delivery Calc' },
              { id: 'reviews', label: 'Reviews & Spotlight' },
              { id: 'instructions', label: 'Professional Laying Guide' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-4 font-mono text-[9.5px] tracking-widest uppercase transition-all whitespace-nowrap cursor-pointer relative ${
                  activeTab === tab.id
                    ? 'text-charcoal font-bold bg-white'
                    : 'text-charcoal/45 hover:text-charcoal/80'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold-500" />
                )}
              </button>
            ))}
          </div>

          {/* Tab contents */}
          <div className="p-6 sm:p-8">
            {activeTab === 'specs' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 font-sans text-xs">
                {[
                  { label: 'Surface SKU Code', value: product.code },
                  { label: 'Manufacturer Brand', value: product.brand || 'Atelier Selection' },
                  { label: 'Geological Quarry Origin', value: product.origin },
                  { label: 'Module Dimensions', value: product.size },
                  { label: 'Base Material Composition', value: product.material },
                  { label: 'Surface Glaze / Finish', value: product.finish },
                  { label: 'Laying Style Compatibility', value: product.style || 'Modern / Classic' },
                  { label: 'Water Absorption Metric', value: product.waterAbsorption || '0.02% (Vitreous Class)' },
                  { label: 'Thickness Gauge', value: product.thickness || '12 - 15 mm' },
                  { label: 'Slip Resistance rating', value: product.antiSkid ? 'R11 Anti-Skid' : 'Standard polish' },
                  { label: 'Indoor / Outdoor certified', value: product.indoorOutdoor ? product.indoorOutdoor.toUpperCase() : 'INDOOR' },
                  { label: 'Color Profile Tone', value: product.color || 'Neutral' }
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between py-2.5 border-b border-charcoal/5 last:border-0 md:last:border-b">
                    <span className="text-charcoal/45">{item.label}</span>
                    <span className="font-mono text-charcoal font-bold text-right">{item.value}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="max-w-xl">
                <h4 className="font-serif text-base font-bold text-charcoal mb-2">Estimate Shipping Time & Cost</h4>
                <p className="font-sans text-xs text-charcoal/50 mb-6 leading-relaxed">
                  Enter your local regional postal code (PIN) to compute the nearest logistical depot coordinates and forecast delivery schedules.
                </p>

                <div className="flex gap-2 mb-6">
                  <input
                    type="text"
                    value={zipCode}
                    onChange={(e) => {
                      setZipCode(e.target.value.replace(/\D/g, '').substring(0, 6));
                      setDeliveryEstimate(null);
                    }}
                    placeholder="Enter PIN Code (e.g. 682001)"
                    className="flex-1 px-4 py-3 bg-charcoal/[0.02] border border-charcoal/10 font-mono text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:border-gold-500/40"
                    onKeyDown={(e) => e.key === 'Enter' && estimateDelivery()}
                  />
                  <button
                    onClick={estimateDelivery}
                    disabled={estimating || zipCode.length < 5}
                    className="px-6 py-3 bg-charcoal text-warmwhite hover:bg-gold-500 hover:text-charcoal font-mono text-[10px] tracking-widest uppercase transition-all cursor-pointer disabled:opacity-30"
                  >
                    {estimating ? 'Calculating...' : 'Estimate'}
                  </button>
                </div>

                <AnimatePresence>
                  {deliveryEstimate && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-5 border border-gold-500/20 bg-gold-50/20"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span className="font-sans text-xs font-semibold text-charcoal">Delivery available to PIN {zipCode}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-3.5 bg-white border border-charcoal/5">
                          <span className="block font-mono text-[8px] tracking-widest text-charcoal/40 uppercase mb-1">Logistics timeline</span>
                          <span className="font-serif text-lg font-bold text-charcoal">{deliveryEstimate.days} Days</span>
                        </div>
                        <div className="p-3.5 bg-white border border-charcoal/5">
                          <span className="block font-mono text-[8px] tracking-widest text-charcoal/40 uppercase mb-1">Shipping Quote</span>
                          <span className="font-serif text-xs sm:text-sm font-bold text-charcoal">{deliveryEstimate.cost}</span>
                        </div>
                        <div className="p-3.5 bg-white border border-charcoal/5">
                          <span className="block font-mono text-[8px] tracking-widest text-charcoal/40 uppercase mb-1">Carrier Network</span>
                          <span className="font-mono text-[10px] font-semibold text-charcoal leading-tight mt-1 block">{deliveryEstimate.partner}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="flex items-center gap-6 p-4 bg-charcoal/[0.02] border border-charcoal/5 max-w-lg">
                  <div className="text-center">
                    <p className="font-serif text-3xl font-bold text-charcoal">4.9</p>
                    <div className="flex items-center gap-0.5 justify-center mt-1">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className="w-3 h-3 text-gold-500 fill-gold-500" />
                      ))}
                    </div>
                    <p className="font-mono text-[8px] text-charcoal/40 mt-1">100% Recommended by Architects</p>
                  </div>
                  <div className="flex-1 font-sans text-xs text-charcoal/50 leading-relaxed">
                    Evaluated by registered builders and principal interior designers. Outstanding color calibration score and zero thickness calibration error.
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { name: 'Studio Aurelius Kochi', role: 'Premium Architect', quote: 'The Statuario slabs supplied by The Tile Store were cut meticulously. Color match across bookmatch layouts is clean. We recommend them for high-end Kerala coastal villas.' },
                    { name: 'Nisha R., Principal Designer', role: 'Residential Consultant', quote: 'Stunning gloss depth and scratch resistance. Used in a double-height lounge foyer layout and the final mirror reflection exceeds clients expectations. Logistics were perfectly coordinated.' }
                  ].map((rev, idx) => (
                    <div key={idx} className="p-4 border border-charcoal/5">
                      <div className="flex justify-between items-center mb-2 font-mono text-[10px]">
                        <span className="font-bold text-charcoal">{rev.name} ({rev.role})</span>
                        <span className="text-gold-600 font-semibold">✓ VERIFIED CLIENT</span>
                      </div>
                      <p className="font-sans text-xs text-charcoal/60 leading-relaxed italic">"{rev.quote}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'instructions' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { num: '01', title: 'Adhesive selection', body: 'Use high-performance polymer-modified thin-set adhesives. For sintered stone countertops, utilize food-grade epoxy bounds.' },
                    { num: '02', title: 'Substrate Flatness', body: 'Ensure subfloor is flat (max 2mm variation over 2m). For large format slabs, apply self-leveling mortar screeds.' },
                    { num: '03', title: 'Joint width limits', body: 'Maintain minimum 2mm grout joint. For large formats, 1.5mm joints are suitable with tile-leveling clips.' },
                    { num: '04', title: 'Curing timeline', body: 'Allow 24–48 hours curing before applying epoxy grout. Keep high-traffic boots away from tile layouts during set.' }
                  ].map((step, idx) => (
                    <div key={idx} className="p-4 bg-ivory/60 border border-charcoal/5">
                      <span className="font-mono text-gold-600 font-bold text-xs block mb-2">{step.num}. {step.title.toUpperCase()}</span>
                      <p className="font-sans text-[11px] text-charcoal/60 leading-relaxed">{step.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Similar / Related Slabs Carousel */}
        <div>
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-charcoal/10">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold-600" />
              <h3 className="font-serif text-xl font-bold text-charcoal">AI Similarity Recommendations</h3>
            </div>
            
            <button
              onClick={() => onNavigate('#/collections')}
              className="font-mono text-[9px] tracking-widest uppercase text-gold-600 hover:text-gold-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              Browse Library
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(relatedProducts ?? []).map(tile => (
              <div
                key={tile.id}
                onClick={() => onNavigate(`#/product/${tile.id}`)}
                className="bg-white border border-charcoal/5 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-gold-400/40 cursor-pointer flex flex-col justify-between group"
              >
                <div className="aspect-square bg-ivory overflow-hidden relative">
                  <img
                    src={tile.image}
                    alt={tile.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute bottom-2.5 left-2.5 z-10 font-mono text-[8px] tracking-widest uppercase px-2 py-0.5 bg-charcoal/90 text-warmwhite">
                    {tile.finish}
                  </span>
                  <span className="absolute bottom-2.5 right-2.5 z-10 font-mono text-[8px] tracking-widest uppercase px-2 py-0.5 bg-gold-500 text-charcoal font-bold">
                    {tile.priceCategory}
                  </span>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-mono text-[8px] text-charcoal/40">{tile.code}</span>
                      <span className="font-mono text-[8px] text-gold-600 font-bold uppercase">{tile.brand || 'Kochi'}</span>
                    </div>
                    <h4 className="font-serif text-sm font-semibold text-charcoal truncate group-hover:text-gold-600 transition-colors">
                      {tile.name}
                    </h4>
                  </div>
                  <div className="mt-3 pt-3 border-t border-charcoal/5 flex justify-between items-center text-[9px] font-mono">
                    <span className="text-charcoal/45">{tile.size}</span>
                    <span className="text-gold-500 font-semibold group-hover:underline uppercase tracking-wider">Specs →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
