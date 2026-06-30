import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronDown, ChevronUp, Star, MapPin, Truck, Clock, Shield, BookOpen, HelpCircle, MessageSquare, Package, CheckCircle2 } from 'lucide-react';
import { TileProduct } from '../types';

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: TileProduct | null;
  onAddToInquiry: (product: TileProduct) => void;
  onAddToWishlist: (product: TileProduct) => void;
}

type TabId = 'overview' | 'faqs' | 'guides' | 'reviews' | 'delivery';

interface FAQ {
  question: string;
  answer: string;
}

interface Review {
  name: string;
  rating: number;
  date: string;
  title: string;
  body: string;
  verified: boolean;
}

const PRODUCT_FAQS: FAQ[] = [
  {
    question: 'What is the recommended grout width for this tile?',
    answer: 'We recommend a 2mm grout joint for polished tiles and 3mm for matte/structured finishes. For large-format tiles (60×120cm+), a 1.5mm joint is typical to achieve a seamless look.',
  },
  {
    question: 'Is this tile suitable for underfloor heating?',
    answer: 'Yes. All our porcelain and ceramic tiles are compatible with underfloor heating systems. The thermal conductivity of porcelain makes it an excellent choice for radiant heating.',
  },
  {
    question: 'How do I maintain and clean this tile?',
    answer: 'For daily maintenance, use warm water with a pH-neutral cleaner. Avoid acidic or abrasive cleaners. For polished surfaces, microfiber mops are recommended. Sealing is not required for porcelain tiles.',
  },
  {
    question: 'What is the breakage/wastage allowance I should order?',
    answer: 'We recommend ordering 10% extra for straight-lay patterns and 15% for diagonal or herringbone patterns. Complex room layouts may require up to 20% additional tiles.',
  },
  {
    question: 'Can this tile be used outdoors?',
    answer: 'Only tiles with an anti-skid (R11+) rating and water absorption below 0.5% are suitable for exterior use. Check the product specifications or consult our team for outdoor-rated options.',
  },
];

const PRODUCT_REVIEWS: Review[] = [
  {
    name: 'Architect Priya M.',
    rating: 5,
    date: '2 weeks ago',
    title: 'Exceptional quality and consistency',
    body: 'Used these for a luxury villa project. The shade variation is minimal and the finish is exactly as shown in the showroom. Highly recommend for premium residential projects.',
    verified: true,
  },
  {
    name: 'Rajan K.',
    rating: 4,
    date: '1 month ago',
    title: 'Beautiful tiles, great packaging',
    body: 'Ordered for our master bathroom renovation. The tiles arrived in perfect condition with excellent packaging. Installation was smooth.',
    verified: true,
  },
  {
    name: 'Interior Studio B.',
    rating: 5,
    date: '3 weeks ago',
    title: 'Our go-to for luxury projects',
    body: 'We\'ve been sourcing from The Tile Store for years. The consistency, quality, and range of premium surfaces is unmatched. This particular collection is stunning.',
    verified: true,
  },
];

const INSTALLATION_GUIDE_STEPS = [
  {
    step: 1,
    title: 'Surface Preparation',
    description: 'Ensure the substrate is clean, dry, level, and structurally sound. For large-format tiles, use a self-leveling compound to achieve a perfectly flat surface (max 3mm deviation over 2m).',
  },
  {
    step: 2,
    title: 'Layout Planning',
    description: 'Dry-lay tiles from the center of the room outward. Mix tiles from multiple boxes to ensure uniform shade distribution. Plan cuts for edges to maintain symmetry.',
  },
  {
    step: 3,
    title: 'Adhesive Application',
    description: 'Use a premium polymer-modified thin-set adhesive. Apply with a 10-12mm notched trowel for large tiles. Back-butter the tile for full coverage. Work in small sections.',
  },
  {
    step: 4,
    title: 'Tile Placement',
    description: 'Place tiles firmly with a slight twist. Use tile leveling clips/spacers for consistent joints. Tap with a rubber mallet to ensure full adhesive contact. Check level frequently.',
  },
  {
    step: 5,
    title: 'Grouting & Finishing',
    description: 'Wait 24-48 hours before grouting. Use a high-quality epoxy or cementitious grout matched to your tile color. Clean excess grout within 15-20 minutes of application.',
  },
];

export default function ProductDetailModal({
  isOpen,
  onClose,
  product,
  onAddToInquiry,
  onAddToWishlist,
}: ProductDetailModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [zipCode, setZipCode] = useState('');
  const [deliveryEstimate, setDeliveryEstimate] = useState<{
    available: boolean;
    days: number;
    cost: string;
    partner: string;
  } | null>(null);
  const [estimating, setEstimating] = useState(false);

  if (!product) return null;

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <Package className="w-3.5 h-3.5" /> },
    { id: 'faqs', label: 'FAQs', icon: <HelpCircle className="w-3.5 h-3.5" /> },
    { id: 'guides', label: 'Install Guide', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'reviews', label: 'Reviews', icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { id: 'delivery', label: 'Delivery', icon: <Truck className="w-3.5 h-3.5" /> },
  ];

  const estimateDelivery = () => {
    if (!zipCode || zipCode.length < 5) return;
    setEstimating(true);
    // Simulate delivery estimation
    setTimeout(() => {
      const zipNum = parseInt(zipCode.substring(0, 3));
      const isMetro = zipNum >= 100 && zipNum <= 600;
      setDeliveryEstimate({
        available: true,
        days: isMetro ? 3 + Math.floor(Math.random() * 3) : 5 + Math.floor(Math.random() * 5),
        cost: isMetro ? 'Free (Metro)' : '₹1,200 — ₹2,500',
        partner: isMetro ? 'Express Logistics Partner' : 'Premium Freight Network',
      });
      setEstimating(false);
    }, 1200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-4 md:inset-8 lg:inset-12 z-50 bg-warmwhite border border-charcoal/10 shadow-2xl flex flex-col md:flex-row overflow-hidden"
            id="product-detail-modal"
          >
            {/* Left — Product Image */}
            <div className="w-full md:w-2/5 relative bg-charcoal/[0.03] flex-shrink-0">
              <button
                onClick={onClose}
                className="absolute top-4 left-4 z-10 p-2 bg-warmwhite/80 backdrop-blur-sm border border-charcoal/10 hover:bg-charcoal hover:text-warmwhite transition-all cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              <img
                src={product.image}
                alt={product.name}
                className="w-full h-64 md:h-full object-cover"
              />

              {/* Overlay Info Strip */}
              <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-charcoal/80 to-transparent">
                <span className="px-2 py-0.5 bg-gold-500 text-charcoal font-mono text-[8px] tracking-[0.3em] uppercase font-bold">
                  {product.priceCategory}
                </span>
                <h2 className="font-serif text-xl md:text-2xl font-bold text-warmwhite mt-2 tracking-wide">
                  {product.name}
                </h2>
                <p className="font-mono text-[10px] tracking-widest text-warmwhite/60 uppercase mt-1">
                  {product.code} • {product.material} • {product.finish}
                </p>
              </div>
            </div>

            {/* Right — Tabbed Content */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Tab Bar */}
              <div className="flex items-center gap-0 border-b border-charcoal/10 overflow-x-auto no-scrollbar bg-ivory/30">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-2 px-5 py-4 font-mono text-[10px] tracking-widest uppercase transition-all whitespace-nowrap cursor-pointer ${
                      activeTab === tab.id
                        ? 'text-charcoal font-bold'
                        : 'text-charcoal/40 hover:text-charcoal/70'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.span
                        layoutId="product-tab-underline"
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold-500"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto no-scrollbar p-6">
                <AnimatePresence mode="wait">
                  {/* OVERVIEW TAB */}
                  {activeTab === 'overview' && (
                    <motion.div
                      key="overview"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="font-sans text-sm text-charcoal/70 leading-relaxed mb-6">
                        {product.description}
                      </p>

                      {/* Specs Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        {[
                          { label: 'Size', value: product.size },
                          { label: 'Material', value: product.material },
                          { label: 'Finish', value: product.finish },
                          { label: 'Origin', value: product.origin },
                          { label: 'Anti-Skid', value: product.antiSkid ? 'Yes (R11)' : 'No' },
                          { label: 'Category', value: product.category.charAt(0).toUpperCase() + product.category.slice(1) },
                          ...(product.thickness ? [{ label: 'Thickness', value: product.thickness }] : []),
                          ...(product.waterAbsorption ? [{ label: 'Water Absorption', value: product.waterAbsorption }] : []),
                        ].map((spec, idx) => (
                          <div key={idx} className="p-3 bg-charcoal/[0.02] border border-charcoal/5">
                            <p className="font-mono text-[8px] tracking-[0.3em] uppercase text-charcoal/40 mb-1">
                              {spec.label}
                            </p>
                            <p className="font-sans text-sm font-semibold text-charcoal">{spec.value}</p>
                          </div>
                        ))}
                      </div>

                      {/* Features */}
                      {product.features.length > 0 && (
                        <div className="mb-6">
                          <h3 className="font-mono text-[10px] tracking-[0.3em] uppercase text-charcoal/50 mb-3">
                            KEY FEATURES
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {product.features.map((feat, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1.5 bg-gold-50 border border-gold-200/50 font-mono text-[9px] tracking-widest text-gold-700 uppercase"
                              >
                                {feat}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* CTAs */}
                      <div className="flex gap-3 mt-8">
                        <button
                          onClick={() => onAddToInquiry(product)}
                          className="flex-1 py-3 bg-charcoal text-warmwhite hover:bg-gold-500 hover:text-charcoal font-mono text-[10px] tracking-widest uppercase transition-all cursor-pointer"
                        >
                          Add to Inquiry
                        </button>
                        <button
                          onClick={() => onAddToWishlist(product)}
                          className="px-6 py-3 border border-charcoal/15 text-charcoal hover:border-gold-500 hover:bg-gold-50 font-mono text-[10px] tracking-widest uppercase transition-all cursor-pointer"
                        >
                          ♡ Wishlist
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* FAQs TAB */}
                  {activeTab === 'faqs' && (
                    <motion.div
                      key="faqs"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-2"
                    >
                      <h3 className="font-serif text-lg font-bold text-charcoal mb-4">
                        Frequently Asked Questions
                      </h3>
                      {PRODUCT_FAQS.map((faq, idx) => (
                        <div key={idx} className="border border-charcoal/5">
                          <button
                            onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                            className="w-full flex items-center justify-between p-4 text-left hover:bg-charcoal/[0.02] transition-colors cursor-pointer"
                          >
                            <span className="font-sans text-sm font-medium text-charcoal pr-4">
                              {faq.question}
                            </span>
                            {expandedFaq === idx
                              ? <ChevronUp className="w-4 h-4 text-gold-500 flex-shrink-0" />
                              : <ChevronDown className="w-4 h-4 text-charcoal/30 flex-shrink-0" />
                            }
                          </button>
                          <AnimatePresence>
                            {expandedFaq === idx && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <p className="px-4 pb-4 font-sans text-sm text-charcoal/60 leading-relaxed border-t border-charcoal/5 pt-3">
                                  {faq.answer}
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {/* INSTALLATION GUIDE TAB */}
                  {activeTab === 'guides' && (
                    <motion.div
                      key="guides"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <h3 className="font-serif text-lg font-bold text-charcoal mb-2">
                        Installation Guide
                      </h3>
                      <p className="font-sans text-sm text-charcoal/50 mb-6">
                        Professional installation steps for {product.material} {product.finish.toLowerCase()} finish tiles.
                      </p>

                      <div className="space-y-4">
                        {INSTALLATION_GUIDE_STEPS.map((step, idx) => (
                          <motion.div
                            key={step.step}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.08 }}
                            className="flex gap-4 p-4 border border-charcoal/5 hover:border-gold-500/20 transition-colors"
                          >
                            <div className="w-10 h-10 flex-shrink-0 bg-charcoal flex items-center justify-center">
                              <span className="font-mono text-sm font-bold text-gold-500">{step.step}</span>
                            </div>
                            <div>
                              <h4 className="font-sans text-sm font-semibold text-charcoal">{step.title}</h4>
                              <p className="font-sans text-xs text-charcoal/50 leading-relaxed mt-1">
                                {step.description}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* REVIEWS TAB */}
                  {activeTab === 'reviews' && (
                    <motion.div
                      key="reviews"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Summary */}
                      <div className="flex items-center gap-6 mb-6 p-4 bg-charcoal/[0.02] border border-charcoal/5">
                        <div className="text-center">
                          <p className="font-serif text-3xl font-bold text-charcoal">4.8</p>
                          <div className="flex items-center gap-0.5 mt-1">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star key={star} className={`w-3.5 h-3.5 ${star <= 4 ? 'text-gold-500 fill-gold-500' : 'text-gold-300 fill-gold-300'}`} />
                            ))}
                          </div>
                          <p className="font-mono text-[9px] tracking-widest text-charcoal/40 uppercase mt-1">
                            Based on 47 reviews
                          </p>
                        </div>

                        {/* Rating bars */}
                        <div className="flex-1 space-y-1">
                          {[
                            { stars: 5, pct: 78 },
                            { stars: 4, pct: 15 },
                            { stars: 3, pct: 5 },
                            { stars: 2, pct: 2 },
                            { stars: 1, pct: 0 },
                          ].map(r => (
                            <div key={r.stars} className="flex items-center gap-2">
                              <span className="font-mono text-[9px] text-charcoal/50 w-3">{r.stars}</span>
                              <div className="flex-1 h-1.5 bg-charcoal/5 overflow-hidden">
                                <div className="h-full bg-gold-500 transition-all" style={{ width: `${r.pct}%` }} />
                              </div>
                              <span className="font-mono text-[9px] text-charcoal/40 w-8 text-right">{r.pct}%</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Individual Reviews */}
                      <div className="space-y-4">
                        {PRODUCT_REVIEWS.map((review, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="p-4 border border-charcoal/5"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-sans text-sm font-semibold text-charcoal">{review.name}</span>
                                {review.verified && (
                                  <span className="flex items-center gap-1 px-1.5 py-0.5 bg-green-50 border border-green-200/50">
                                    <CheckCircle2 className="w-3 h-3 text-green-600" />
                                    <span className="font-mono text-[8px] tracking-widest text-green-600 uppercase">Verified</span>
                                  </span>
                                )}
                              </div>
                              <span className="font-mono text-[9px] text-charcoal/40">{review.date}</span>
                            </div>

                            <div className="flex items-center gap-0.5 mb-2">
                              {[1, 2, 3, 4, 5].map(star => (
                                <Star
                                  key={star}
                                  className={`w-3 h-3 ${star <= review.rating ? 'text-gold-500 fill-gold-500' : 'text-charcoal/15'}`}
                                />
                              ))}
                            </div>

                            <h4 className="font-sans text-sm font-medium text-charcoal mb-1">{review.title}</h4>
                            <p className="font-sans text-xs text-charcoal/50 leading-relaxed">{review.body}</p>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* DELIVERY TAB */}
                  {activeTab === 'delivery' && (
                    <motion.div
                      key="delivery"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <h3 className="font-serif text-lg font-bold text-charcoal mb-2">
                        Delivery Estimation
                      </h3>
                      <p className="font-sans text-sm text-charcoal/50 mb-6">
                        Enter your PIN/ZIP code to check delivery availability and estimated timeline.
                      </p>

                      {/* ZIP Input */}
                      <div className="flex gap-2 mb-6">
                        <div className="flex-1 relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/30" />
                          <input
                            type="text"
                            value={zipCode}
                            onChange={(e) => {
                              setZipCode(e.target.value.replace(/\D/g, '').substring(0, 6));
                              setDeliveryEstimate(null);
                            }}
                            placeholder="Enter PIN / ZIP Code"
                            className="w-full pl-10 pr-4 py-3 bg-charcoal/[0.02] border border-charcoal/10 font-mono text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:border-gold-500/40 transition-colors"
                            onKeyDown={(e) => e.key === 'Enter' && estimateDelivery()}
                          />
                        </div>
                        <button
                          onClick={estimateDelivery}
                          disabled={estimating || zipCode.length < 5}
                          className="px-6 py-3 bg-charcoal text-warmwhite hover:bg-gold-500 hover:text-charcoal font-mono text-[10px] tracking-widest uppercase transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          {estimating ? 'Checking...' : 'Check'}
                        </button>
                      </div>

                      {/* Delivery Result */}
                      <AnimatePresence>
                        {deliveryEstimate && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="p-5 border border-gold-500/20 bg-gold-50/30 mb-6"
                          >
                            <div className="flex items-center gap-2 mb-4">
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                              <span className="font-sans text-sm font-semibold text-charcoal">
                                Delivery available to {zipCode}
                              </span>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                              <div className="p-3 bg-warmwhite border border-charcoal/5">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <Clock className="w-3.5 h-3.5 text-gold-600" />
                                  <span className="font-mono text-[8px] tracking-[0.3em] uppercase text-charcoal/40">
                                    EST. DELIVERY
                                  </span>
                                </div>
                                <p className="font-serif text-lg font-bold text-charcoal">
                                  {deliveryEstimate.days} Days
                                </p>
                              </div>

                              <div className="p-3 bg-warmwhite border border-charcoal/5">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <Truck className="w-3.5 h-3.5 text-gold-600" />
                                  <span className="font-mono text-[8px] tracking-[0.3em] uppercase text-charcoal/40">
                                    SHIPPING COST
                                  </span>
                                </div>
                                <p className="font-serif text-sm font-bold text-charcoal">
                                  {deliveryEstimate.cost}
                                </p>
                              </div>

                              <div className="p-3 bg-warmwhite border border-charcoal/5">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <Shield className="w-3.5 h-3.5 text-gold-600" />
                                  <span className="font-mono text-[8px] tracking-[0.3em] uppercase text-charcoal/40">
                                    PARTNER
                                  </span>
                                </div>
                                <p className="font-mono text-[10px] font-semibold text-charcoal leading-tight mt-1">
                                  {deliveryEstimate.partner}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Shipping Info */}
                      <div className="space-y-3">
                        <h4 className="font-mono text-[10px] tracking-[0.3em] uppercase text-charcoal/50 mb-2">
                          SHIPPING INFORMATION
                        </h4>
                        {[
                          { icon: <Package className="w-4 h-4" />, text: 'All tiles are professionally packed in reinforced cartons with foam cushioning.' },
                          { icon: <Shield className="w-4 h-4" />, text: 'Transit insurance included for all orders. Damaged tiles are replaced at no cost.' },
                          { icon: <Truck className="w-4 h-4" />, text: 'Metro cities: 3-5 business days. Other locations: 5-10 business days.' },
                          { icon: <MapPin className="w-4 h-4" />, text: 'Curbside delivery standard. Premium white-glove service available at extra cost.' },
                        ].map((info, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-charcoal/[0.02] border border-charcoal/5">
                            <span className="text-gold-600 flex-shrink-0 mt-0.5">{info.icon}</span>
                            <p className="font-sans text-xs text-charcoal/60 leading-relaxed">{info.text}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
