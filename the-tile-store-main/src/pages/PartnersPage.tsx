import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, ShieldCheck, Mail, Phone, MapPin, Download, Check, 
  MessageSquare, Send, Sparkles, Building, FileText, Gift 
} from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';
import { submitArchitectApplication, submitDealerApplication } from '../services/bookingService';

interface PartnersPageProps {
  onNavigate: (hash: string) => void;
}

export default function PartnersPage({ onNavigate }: PartnersPageProps) {
  const [formData, setFormData] = useState({
    businessName: '',
    repName: '',
    email: '',
    phone: '',
    role: 'architect',
    annualVolume: '10k-50k',
    address: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      let result;
      if (formData.role === 'architect' || formData.role === 'interior-designer') {
        result = await submitArchitectApplication({
          name: formData.repName,
          email: formData.email,
          phone: formData.phone,
          firmName: formData.businessName,
          city: formData.address,
          annualVolumeSqft: formData.annualVolume,
          message: formData.notes,
          projectType: formData.role,
        });
      } else {
        result = await submitDealerApplication({
          name: formData.repName,
          email: formData.email,
          phone: formData.phone,
          companyName: formData.businessName,
          city: formData.address,
          showroomSize: formData.annualVolume,
          message: formData.notes,
        });
      }

      if (result.success) {
        setSubmitted(true);
        setFormData({
          businessName: '', repName: '', email: '', phone: '',
          role: 'architect', annualVolume: '10k-50k', address: '', notes: ''
        });
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        setSubmitError(result.error || 'Submission failed. Please try again.');
      }
    } catch {
      setSubmitError('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };


  const tradeBenefits = [
    {
      icon: <Building className="w-5 h-5 text-gold-600" />,
      title: 'Commercial Price Slabs',
      desc: 'Unlock exclusive B2B wholesale pricing multipliers on large format sintered slabs and natural marbles.'
    },
    {
      icon: <FileText className="w-5 h-5 text-gold-600" />,
      title: 'CAD & BIM Integration Files',
      desc: 'Access our high-resolution texture map folders and CAD/BIM block archives for 3D modeling.'
    },
    {
      icon: <Gift className="w-5 h-5 text-gold-600" />,
      title: 'Priority Sample Dispatches',
      desc: 'Free physical sample box packages delivered straight to your studio or project site with quick turnarounds.'
    },
    {
      icon: <Briefcase className="w-5 h-5 text-gold-600" />,
      title: 'Atelier Account Manager',
      desc: 'A single technical surface manager to coordinate logistics, quality, and batch code consistency.'
    }
  ];

  return (
    <div className="min-h-screen bg-ivory pt-24 pb-16" id="partners-page">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Breadcrumb row */}
        <Breadcrumbs items={[{ label: 'Trade Partnerships' }]} onNavigate={onNavigate} />

        {/* Page Header */}
        <div className="max-w-3xl mb-16">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-gold-600 font-semibold">
              ATELIER B2B PORTAL
            </span>
            <span className="h-[1px] w-8 bg-gold-400"></span>
          </div>
          
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-charcoal tracking-tight mb-4">
            Architect & Builder Program
          </h1>
          
          <p className="font-sans text-xs sm:text-sm text-charcoal/60 leading-relaxed">
            Collaborate with The Tile Store. We supply architects, interior design studios, authorized dealers, and real estate developers with luxury surface materials, guaranteed batch runs, and commercial price allocations.
          </p>
        </div>

        {/* Core Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-16">
          
          {/* Left Panel: Program Benefits & Downloads (6 cols) */}
          <div className="lg:col-span-6 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {tradeBenefits.map((b, idx) => (
                <div key={idx} className="p-6 bg-white border border-charcoal/8 shadow-sm">
                  <div className="p-2.5 bg-gold-50 border border-gold-200/50 inline-block mb-4">
                    {b.icon}
                  </div>
                  <h3 className="font-serif text-base font-semibold text-charcoal mb-2">{b.title}</h3>
                  <p className="font-sans text-xs text-charcoal/50 leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>

            {/* Catalog Downloads Block */}
            <div className="p-6 sm:p-8 bg-charcoal text-warmwhite border border-white/5 relative">
              <div className="absolute top-0 inset-x-0 h-0.5 bg-gold-500" />
              
              <div className="flex items-center gap-2 mb-4 text-gold-400">
                <Download className="w-4 h-4" />
                <span className="font-mono text-[9px] tracking-widest uppercase font-bold">COMMERCIAL DOCK</span>
              </div>

              <h3 className="font-serif text-xl font-bold tracking-tight mb-3">Trade Catalog Downloads</h3>
              <p className="font-sans text-xs text-gray-400 leading-relaxed mb-6">
                Download current material specifications, wholesale cost schedules, and color index brochures in PDF format.
              </p>

              <div className="space-y-2">
                {[
                  { name: 'Sintered Slabs Catalog 2026', size: '18.4 MB' },
                  { name: 'Artisanal Wall Tiles Directory', size: '12.1 MB' },
                  { name: 'Technical Spec Sheet Guide', size: '4.8 MB' }
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-white/5 border border-white/10 hover:border-gold-500/30 transition-colors">
                    <div className="text-left">
                      <span className="font-sans text-xs font-semibold text-white block">{item.name}</span>
                      <span className="font-mono text-[9px] text-gray-400 mt-0.5 block">{item.size}</span>
                    </div>
                    <button className="p-2 bg-white/10 text-gold-400 hover:bg-gold-500 hover:text-charcoal transition-all cursor-pointer">
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel: Application Form (6 cols) */}
          <div className="lg:col-span-6 bg-white border border-charcoal/8 shadow-sm p-6 sm:p-8 relative">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-charcoal/5">
              <Briefcase className="w-4 h-4 text-gold-600" />
              <span className="font-serif text-base font-bold text-charcoal tracking-wide uppercase">Loyalty Program</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[9px] text-charcoal/40 uppercase tracking-widest mb-1.5">Business Name</label>
                  <input
                    type="text"
                    required
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    placeholder="e.g. Studio Aurelius"
                    className="w-full px-3 py-2.5 bg-charcoal/[0.02] border border-charcoal/10 font-sans text-xs text-charcoal focus:outline-none focus:border-gold-500/40"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[9px] text-charcoal/40 uppercase tracking-widest mb-1.5">Representative Name</label>
                  <input
                    type="text"
                    required
                    name="repName"
                    value={formData.repName}
                    onChange={handleInputChange}
                    placeholder="e.g. Vikram Singhania"
                    className="w-full px-3 py-2.5 bg-charcoal/[0.02] border border-charcoal/10 font-sans text-xs text-charcoal focus:outline-none focus:border-gold-500/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[9px] text-charcoal/40 uppercase tracking-widest mb-1.5">Work Email Address</label>
                  <input
                    type="email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="e.g. vikram@studioaurelius.com"
                    className="w-full px-3 py-2.5 bg-charcoal/[0.02] border border-charcoal/10 font-sans text-xs text-charcoal focus:outline-none focus:border-gold-500/40"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[9px] text-charcoal/40 uppercase tracking-widest mb-1.5">Contact Phone Number</label>
                  <input
                    type="tel"
                    required
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3 py-2.5 bg-charcoal/[0.02] border border-charcoal/10 font-sans text-xs text-charcoal focus:outline-none focus:border-gold-500/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[9px] text-charcoal/40 uppercase tracking-widest mb-1.5">Professional Typology</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 bg-charcoal/[0.02] border border-charcoal/10 font-sans text-xs text-charcoal focus:outline-none focus:border-gold-500/40 cursor-pointer"
                  >
                    <option value="architect">Architect</option>
                    <option value="designer">Interior Designer</option>
                    <option value="builder">Builder / Developer</option>
                    <option value="dealer">Authorized Retailer</option>
                  </select>
                </div>
                <div>
                  <label className="block font-mono text-[9px] text-charcoal/40 uppercase tracking-widest mb-1.5">Est. Annual volume (Sq Ft)</label>
                  <select
                    name="annualVolume"
                    value={formData.annualVolume}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 bg-charcoal/[0.02] border border-charcoal/10 font-sans text-xs text-charcoal focus:outline-none focus:border-gold-500/40 cursor-pointer"
                  >
                    <option value="under-10k">Under 10,000 Sq Ft</option>
                    <option value="10k-50k">10,000 — 50,000 Sq Ft</option>
                    <option value="50k-100k">50,000 — 100,000 Sq Ft</option>
                    <option value="over-100k">Over 100,000 Sq Ft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-mono text-[9px] text-charcoal/40 uppercase tracking-widest mb-1.5">Studio / Office Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Street Address, City, State"
                  className="w-full px-3 py-2.5 bg-charcoal/[0.02] border border-charcoal/10 font-sans text-xs text-charcoal focus:outline-none focus:border-gold-500/40"
                />
              </div>

              <div>
                <label className="block font-mono text-[9px] text-charcoal/40 uppercase tracking-widest mb-1.5">Partnership Requirements / Project Details</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Outline any pending project deadlines, specific tiles, or bulk quotation notes..."
                  className="w-full px-3 py-2.5 bg-charcoal/[0.02] border border-charcoal/10 font-sans text-xs text-charcoal resize-none focus:outline-none focus:border-gold-500/40"
                  rows={4}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-charcoal text-warmwhite hover:bg-gold-500 hover:text-charcoal font-mono text-[10px] tracking-widest uppercase font-bold transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <span className="inline-block w-4 h-4 border-2 border-warmwhite/30 border-t-warmwhite rounded-full animate-spin" />
                ) : submitted ? (
                  <>
                    <Check className="w-4 h-4" />
                    Application Submitted!
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Apply For Program
                  </>
                )}
              </button>
            </form>

            <AnimatePresence>
              {submitted && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-emerald-50 border border-emerald-200/50 mt-4 text-center"
                >
                  <p className="font-mono text-[9px] text-emerald-700 font-bold uppercase">SUBMISSION COMPLETE</p>
                  <p className="font-sans text-xs text-emerald-800 leading-relaxed mt-0.5">
                    Thank you. An Atelier account executive will review your registration and activate your commercial credentials within 24 hours.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
