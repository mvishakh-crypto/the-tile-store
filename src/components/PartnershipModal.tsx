import React, { useState } from 'react';
import { X, Briefcase, Sparkles, Send, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { submitArchitectApplication } from '../services/bookingService';

interface PartnershipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PartnershipModal({ isOpen, onClose }: PartnershipModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    firm: '',
    designation: 'Architect',
    whatsapp: '',
    location: '',
    comments: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.whatsapp) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const result = await submitArchitectApplication({
        name: formData.name,
        email: '',
        phone: formData.whatsapp,
        firmName: formData.firm,
        city: formData.location,
        projectType: formData.designation,
        message: formData.comments,
      });
      if (result.success) {
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          setFormData({ name: '', firm: '', designation: 'Architect', whatsapp: '', location: '', comments: '' });
          onClose();
        }, 4000);
      } else {
        setSubmitError(result.error || 'Submission failed. Please try again.');
      }
    } catch {
      setSubmitError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tradeBenefits = [
    { title: 'Trade Commission', desc: 'Up to 30% private trade discounts on structural sintered slabs and imports.' },
    { title: 'Custom CAD Packs', desc: 'Complimentary high-definition seamless textures and BIM file packages.' },
    { title: 'Express Sampling', desc: 'Free dispatch of physical samples directly to your studio or site coordinates.' },
    { title: 'Atelier Priority', desc: 'Priority access to limited reserve slabs from Carrara and Castellón quarries.' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-charcoal/80 flex items-center justify-center p-4 sm:p-6" id="partnership-modal-wrapper">
          {/* Backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 cursor-pointer bg-charcoal/30 backdrop-blur-sm"
          />

          {/* Modal Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative bg-warmwhite max-w-4xl w-full border border-charcoal/10 overflow-hidden shadow-2xl flex flex-col md:flex-row z-10"
            id="partnership-modal-panel"
          >
            {/* Close trigger */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-charcoal text-warmwhite hover:bg-gold-500 hover:text-charcoal transition-all duration-300 cursor-pointer shadow-lg"
              aria-label="Close Portal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Left Side: Trade Benefits description (45%) */}
            <div className="w-full md:w-5/12 bg-charcoal p-8 text-warmwhite flex flex-col justify-between relative">
              {/* Gold light streak overlay */}
              <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-gold-500/5 to-transparent pointer-events-none" />

              <div>
                <div className="flex items-center gap-2 mb-6 text-gold-400">
                  <Briefcase className="w-5 h-5 text-gold-500" />
                  <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-gold-500 font-bold">
                    TRADE PARTNERS PROGRAM
                  </span>
                </div>
                
                <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight mb-4 text-warmwhite leading-tight">
                  Tailored For Trade Professionals
                </h3>
                
                <p className="font-sans text-[11px] text-gray-400 leading-relaxed mb-8">
                  We coordinate with leading architects, developers, and designers across India to supply premium slabs for villas, penthouses, and corporate spaces.
                </p>

                {/* Benefits grid */}
                <div className="space-y-5" id="trade-benefits-list">
                  {tradeBenefits.map((b, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="h-5 w-5 bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5 text-gold-400 text-[10px] font-mono">
                        0{i+1}
                      </div>
                      <div>
                        <h4 className="font-serif text-xs font-bold text-warmwhite">{b.title}</h4>
                        <p className="font-sans text-[10.5px] text-gray-400 leading-relaxed mt-0.5">{b.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8 border-t border-white/5 flex items-center gap-2 mt-8 text-[9px] font-mono text-gray-500 uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5 text-gold-500 animate-pulse" />
                Licensed Showrooms in Kochi & Bangalore
              </div>
            </div>

            {/* Right Side: Form registration (55%) */}
            <div className="w-full md:w-7/12 p-8 flex flex-col justify-center" id="partnership-form-area">
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="text-center py-10 flex flex-col items-center justify-center"
                    id="submit-success-box"
                  >
                    <CheckCircle className="w-12 h-12 text-emerald-600 mb-4 animate-bounce" />
                    <h4 className="font-serif text-lg font-bold text-charcoal">Trade Application Filed</h4>
                    <p className="font-sans text-xs text-charcoal/50 leading-relaxed mt-2 max-w-sm mx-auto">
                      Thank you for connecting. A relationship executive will reach out on WhatsApp within 2 hours to confirm your trade discount codes.
                    </p>
                  </motion.div>
                ) : (
                  <motion.form
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-4"
                  >
                    <h4 className="font-serif text-lg font-bold text-charcoal mb-4">
                      Register Trade Account
                    </h4>

                    <div>
                      <label className="block font-sans text-[9px] text-charcoal/50 uppercase tracking-widest font-semibold mb-1.5">Full Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Ar. Rajesh Menon"
                        className="w-full bg-white border border-charcoal/10 px-3.5 py-2.5 outline-none font-sans text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-sans text-[9px] text-charcoal/50 uppercase tracking-widest font-semibold mb-1.5">Studio / Firm</label>
                        <input
                          type="text"
                          value={formData.firm}
                          onChange={(e) => setFormData({ ...formData, firm: e.target.value })}
                          placeholder="e.g. Design Atelier"
                          className="w-full bg-white border border-charcoal/10 px-3.5 py-2.5 outline-none font-sans text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-sans text-[9px] text-charcoal/50 uppercase tracking-widest font-semibold mb-1.5">Designation</label>
                        <select
                          value={formData.designation}
                          onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                          className="w-full bg-white border border-charcoal/10 px-3.5 py-2.5 outline-none font-sans text-xs"
                        >
                          <option>Architect</option>
                          <option>Interior Designer</option>
                          <option>Dealer / Retailer</option>
                          <option>Contractor / Builder</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-sans text-[9px] text-charcoal/50 uppercase tracking-widest font-semibold mb-1.5">WhatsApp Number</label>
                        <input
                          type="tel"
                          required
                          value={formData.whatsapp}
                          onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                          placeholder="e.g. +91 98765 43210"
                          className="w-full bg-white border border-charcoal/10 px-3.5 py-2.5 outline-none font-sans text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-sans text-[9px] text-charcoal/50 uppercase tracking-widest font-semibold mb-1.5">Location / City</label>
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          placeholder="e.g. Kochi, Kerala"
                          className="w-full bg-white border border-charcoal/10 px-3.5 py-2.5 outline-none font-sans text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-sans text-[9px] text-charcoal/50 uppercase tracking-widest font-semibold mb-1.5">Current Project Sourcing Details</label>
                      <textarea
                        rows={3}
                        value={formData.comments}
                        onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                        placeholder="Detail sizes or slab codes you require quotes for..."
                        className="w-full bg-white border border-charcoal/10 px-3.5 py-2.5 outline-none font-sans text-xs resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 bg-charcoal hover:bg-gold-500 text-warmwhite hover:text-charcoal border border-charcoal hover:border-gold-500 font-mono text-[9px] tracking-widest uppercase font-bold flex items-center justify-center gap-1.5 transition-all duration-300 cursor-pointer shadow-lg disabled:opacity-50"
                    >
                      <Send className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-pulse' : ''}`} />
                      {isSubmitting ? 'Registering Atelier Portal...' : 'Request Trade Pricing'}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
