import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Plus, Minus, Send, MessageSquare, Mail, ShoppingBag, StickyNote, ChevronDown, ChevronUp, Package } from 'lucide-react';
import { TileProduct } from '../types';
import type { InquiryFormData } from '../lib/validation';

export interface InquiryItem {
  product: TileProduct;
  quantity: number;
  area?: number; // sq ft
  notes: string;
}

interface InquiryCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: InquiryItem[];
  onUpdateItem: (productId: string, updates: Partial<InquiryItem>) => void;
  onRemoveItem: (productId: string) => void;
  onClearAll: () => void;
  onSubmitInquiry: (formData: InquiryFormData) => Promise<{ success: boolean; referenceNumber?: string; error?: string }>;
}

const PROJECT_TYPE_MAP: Record<string, InquiryFormData['projectType']> = {
  residential: 'Residential Villa',
  commercial:  'Commercial Office',
  hospitality: 'Hotel / Hospitality',
  architect:   'Other',
};

export default function InquiryCartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateItem,
  onRemoveItem,
  onClearAll,
  onSubmitInquiry,
}: InquiryCartDrawerProps) {
  const [expandedNotes, setExpandedNotes] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [projectType, setProjectType] = useState('residential');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const toggleNotes = (id: string) => {
    setExpandedNotes(expandedNotes === id ? null : id);
  };

  const generateInquiryMessage = () => {
    const header = `🏛️ THE TILE STORE — Product Inquiry\n━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    const customerInfo = customerName || customerPhone
      ? `👤 ${customerName}${customerPhone ? ` | ${customerPhone}` : ''}${customerEmail ? ` | ${customerEmail}` : ''}\n📐 Project Type: ${projectType.charAt(0).toUpperCase() + projectType.slice(1)}\n\n`
      : '';

    const itemsText = items.map((item, idx) => {
      const lines = [
        `${idx + 1}. ${item.product.name} (${item.product.code})`,
        `   Material: ${item.product.material} | Finish: ${item.product.finish}`,
        `   Size: ${item.product.size} | Qty: ${item.quantity} boxes`,
      ];
      if (item.area) lines.push(`   Area: ${item.area} sq ft`);
      if (item.notes) lines.push(`   Note: ${item.notes}`);
      return lines.join('\n');
    }).join('\n\n');

    return `${header}${customerInfo}${itemsText}\n\n━━━━━━━━━━━━━━━━━━━━━━━━\nPlease share pricing and availability.`;
  };

  const handleWhatsAppSubmit = () => {
    const msg = encodeURIComponent(generateInquiryMessage());
    window.open(`https://wa.me/919876543210?text=${msg}`, '_blank');
  };

  const handleEmailSubmit = () => {
    const subject = encodeURIComponent(`Product Inquiry — ${items.length} items | The Tile Store`);
    const body = encodeURIComponent(generateInquiryMessage());
    window.open(`mailto:inquiries@thetilestore.com?subject=${subject}&body=${body}`, '_blank');
  };

  const handleFormSubmit = async () => {
    setSubmitError(null);
    setSubmitting(true);
    try {
      const result = await onSubmitInquiry({
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        company: '',
        projectType: PROJECT_TYPE_MAP[projectType],
        message: '',
      });
      if (result.success) {
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 4000);
      } else {
        setSubmitError(result.error || 'Submission failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
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
            className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-lg bg-warmwhite border-l border-charcoal/10 shadow-2xl flex flex-col"
            id="inquiry-cart-drawer"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-charcoal/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-charcoal flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-gold-500" />
                </div>
                <div>
                  <h2 className="font-serif text-lg font-bold text-charcoal tracking-wide">Inquiry Cart</h2>
                  <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-charcoal/40">
                    {items.length} {items.length === 1 ? 'ITEM' : 'ITEMS'} SELECTED
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-charcoal/5 transition-colors cursor-pointer"
                aria-label="Close inquiry cart"
              >
                <X className="w-5 h-5 text-charcoal/60" />
              </button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
                  <div className="w-20 h-20 border-2 border-dashed border-charcoal/15 flex items-center justify-center">
                    <Package className="w-8 h-8 text-charcoal/20" />
                  </div>
                  <p className="font-serif text-lg text-charcoal/40">Your inquiry cart is empty</p>
                  <p className="font-mono text-[10px] tracking-widest uppercase text-charcoal/30">
                    Add tiles from the collection to begin
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-charcoal/5">
                  {items.map((item, idx) => (
                    <motion.div
                      key={item.product.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-4 hover:bg-ivory/50 transition-colors"
                    >
                      <div className="flex gap-4">
                        {/* Tile Thumbnail */}
                        <div className="w-20 h-20 flex-shrink-0 bg-charcoal/5 border border-charcoal/10 overflow-hidden">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-serif text-sm font-semibold text-charcoal truncate">{item.product.name}</h3>
                              <p className="font-mono text-[9px] tracking-widest text-charcoal/40 mt-0.5">
                                {item.product.code} • {item.product.size}
                              </p>
                            </div>
                            <button
                              onClick={() => onRemoveItem(item.product.id)}
                              className="p-1.5 text-charcoal/30 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-2 mt-2">
                            <span className="font-mono text-[9px] tracking-widest uppercase text-charcoal/40">
                              {item.product.material} • {item.product.finish}
                            </span>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-0 border border-charcoal/10">
                              <button
                                onClick={() => onUpdateItem(item.product.id, { quantity: Math.max(1, item.quantity - 1) })}
                                className="p-1.5 hover:bg-charcoal/5 transition-colors cursor-pointer"
                              >
                                <Minus className="w-3 h-3 text-charcoal/60" />
                              </button>
                              <span className="px-3 py-1 font-mono text-xs font-semibold text-charcoal min-w-[32px] text-center border-x border-charcoal/10">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => onUpdateItem(item.product.id, { quantity: item.quantity + 1 })}
                                className="p-1.5 hover:bg-charcoal/5 transition-colors cursor-pointer"
                              >
                                <Plus className="w-3 h-3 text-charcoal/60" />
                              </button>
                            </div>

                            <span className="px-2 py-0.5 bg-gold-50 text-gold-700 font-mono text-[9px] tracking-widest uppercase font-bold">
                              {item.product.priceCategory}
                            </span>
                          </div>

                          {/* Notes Toggle */}
                          <button
                            onClick={() => toggleNotes(item.product.id)}
                            className="flex items-center gap-1.5 mt-2.5 text-charcoal/40 hover:text-gold-600 transition-colors cursor-pointer"
                          >
                            <StickyNote className="w-3 h-3" />
                            <span className="font-mono text-[9px] tracking-widest uppercase">
                              {item.notes ? 'Edit Note' : 'Add Note'}
                            </span>
                            {expandedNotes === item.product.id
                              ? <ChevronUp className="w-3 h-3" />
                              : <ChevronDown className="w-3 h-3" />
                            }
                          </button>

                          <AnimatePresence>
                            {expandedNotes === item.product.id && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <textarea
                                  value={item.notes}
                                  onChange={(e) => onUpdateItem(item.product.id, { notes: e.target.value })}
                                  placeholder="E.g., Need for master bedroom, prefer warm tones..."
                                  className="w-full mt-2 px-3 py-2 bg-charcoal/[0.03] border border-charcoal/10 font-mono text-[11px] text-charcoal placeholder:text-charcoal/30 resize-none focus:outline-none focus:border-gold-500/30 transition-colors"
                                  rows={2}
                                />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer — Customer Info & Submit */}
            {items.length > 0 && (
              <div className="border-t border-charcoal/10 bg-ivory/50">
                {/* Customer Details Compact Form */}
                <div className="p-4 space-y-2.5">
                  <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-charcoal/40 mb-2">
                    YOUR DETAILS (OPTIONAL)
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Full Name"
                      className="px-3 py-2 bg-warmwhite border border-charcoal/10 font-mono text-[11px] text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:border-gold-500/30 transition-colors"
                    />
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Phone Number"
                      className="px-3 py-2 bg-warmwhite border border-charcoal/10 font-mono text-[11px] text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:border-gold-500/30 transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="Email Address"
                      className="px-3 py-2 bg-warmwhite border border-charcoal/10 font-mono text-[11px] text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:border-gold-500/30 transition-colors"
                    />
                    <select
                      value={projectType}
                      onChange={(e) => setProjectType(e.target.value)}
                      className="px-3 py-2 bg-warmwhite border border-charcoal/10 font-mono text-[11px] text-charcoal focus:outline-none focus:border-gold-500/30 transition-colors cursor-pointer"
                    >
                      <option value="residential">Residential</option>
                      <option value="commercial">Commercial</option>
                      <option value="hospitality">Hospitality</option>
                      <option value="architect">Architect / Designer</option>
                    </select>
                  </div>
                </div>

                {/* Summary */}
                <div className="px-4 pb-3 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-[9px] tracking-widest uppercase text-charcoal/40">
                      Total: {items.reduce((sum, i) => sum + i.quantity, 0)} boxes across {items.length} products
                    </span>
                  </div>
                  <button
                    onClick={onClearAll}
                    className="font-mono text-[9px] tracking-widest uppercase text-charcoal/30 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>

                {/* Submission error */}
                {submitError && (
                  <p className="px-4 pb-2 font-mono text-[10px] text-red-500 tracking-wide">{submitError}</p>
                )}

                {/* Submit Actions */}
                <div className="px-4 pb-5 grid grid-cols-3 gap-2">
                  <button
                    onClick={handleWhatsAppSubmit}
                    className="flex items-center justify-center gap-2 py-3 bg-charcoal text-warmwhite hover:bg-gold-500 hover:text-charcoal font-mono text-[9px] tracking-widest uppercase transition-all duration-300 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    WhatsApp
                  </button>
                  <button
                    onClick={handleEmailSubmit}
                    className="flex items-center justify-center gap-2 py-3 bg-charcoal text-warmwhite hover:bg-gold-500 hover:text-charcoal font-mono text-[9px] tracking-widest uppercase transition-all duration-300 cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    Email
                  </button>
                  <button
                    onClick={handleFormSubmit}
                    disabled={submitting}
                    className="flex items-center justify-center gap-2 py-3 bg-gold-500 text-charcoal hover:bg-gold-600 font-mono text-[9px] tracking-widest uppercase transition-all duration-300 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        className="inline-block w-3.5 h-3.5 border-2 border-charcoal/30 border-t-charcoal rounded-full"
                      />
                    ) : submitted ? (
                      '✓ Sent!'
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Submit
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
