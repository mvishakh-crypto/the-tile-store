import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Calendar, Compass, Sparkles, MapPin, CheckCircle, Smartphone, ArrowRight, Printer, RefreshCw } from 'lucide-react';
import { createBooking } from '../services/bookingService';
import { bookingLimiter } from '../lib/rateLimiter';

export default function ConsultationBooking() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '+91 ',
    professionalType: 'Home Owner',
    interestType: 'Marble Finish Slabs',
    date: '2026-06-15',
    time: '11:00 AM',
    notes: ''
  });

  const [bookingConfirmed, setBookingConfirmed] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [ticketId, setTicketId] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

  const timeSlots = ['10:00 AM', '11:30 AM', '01:00 PM', '02:30 PM', '04:00 PM', '05:30 PM'];
  const interestOptions = ['Marble Finish Slabs', 'Wooden Planks', 'Artisanal Wall Tiles', 'Chef Countertops', 'Outdoor Claddings', 'Full Project Sourcing'];
  const designerOptions = ['Home Owner', 'Interior Designer', 'Principal Architect', 'Luxury Contractor / Builder'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      setFormError('Please fill out all contact credentials (Name, Email, and Phone).');
      return;
    }

    // Rate limit check
    if (!bookingLimiter.attempt()) {
      const cooldownMins = Math.ceil(bookingLimiter.getCooldownMs() / 60000);
      setFormError(`Too many requests. Please wait ${cooldownMins} minute(s) before booking again.`);
      return;
    }

    setFormError('');
    setSubmitting(true);

    try {
      const result = await createBooking({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        date: formData.date,
        time: formData.time,
        projectType: formData.interestType,
        notes: formData.notes,
      });

      if (result.success) {
        setTicketId(result.bookingId || `TSX-2026-${Math.floor(100000 + Math.random() * 900000)}`);
        setBookingConfirmed(true);
      } else {
        setFormError(result.error || 'Booking failed. Please try again or call us directly.');
      }
    } catch {
      setFormError('Connection error. Please try again or WhatsApp us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`Hello Tile Store Team, I am looking to schedule a private tour of your showroom in Kochi. Interest: ${formData.interestType}.`);
    window.open(`https://wa.me/919544711111?text=${text}`, '_blank');
  };

  const handleReset = () => {
    setBookingConfirmed(false);
    setFormData({
      name: '',
      email: '',
      phone: '+91 ',
      professionalType: 'Home Owner',
      interestType: 'Marble Finish Slabs',
      date: '2026-06-15',
      time: '11:00 AM',
      notes: ''
    });
  };

  return (
    <section 
      className="py-24 bg-charcoal text-warmwhite relative overflow-hidden" 
      id="booking"
    >
      {/* Decorative vectors */}
      <div className="absolute inset-0 bg-[radial-gradient(#C9A227_1px,transparent_1px)] [background-size:24px_24px] opacity-5 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gold-400/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Cinematic CTA Title Row */}
        <div className="mb-16 border-b border-white/10 pb-12" id="cta-heading-frame">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-gold-400 font-semibold">
                  BESPOKE PROJECT CONSULTATION
                </span>
                <span className="h-[1px] w-6 bg-gold-400/50"></span>
              </div>
              
              <h2 className="font-serif text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight">
                Design Starts From The Ground Up
              </h2>
            </div>

            <div className="lg:col-span-4 flex flex-wrap gap-3 lg:justify-end" id="quick-links">
              <button
                onClick={handleWhatsApp}
                className="px-6 py-3.5 bg-emerald-600 border border-emerald-600 text-white hover:bg-emerald-700 hover:border-emerald-700 font-sans text-xs font-semibold tracking-widest uppercase flex items-center gap-2 cursor-pointer shadow-md transition-all duration-300"
                id="whatsapp-cta-btn"
              >
                <MessageSquare className="w-4 h-4 fill-white" />
                WhatsApp Us
              </button>

              <a
                href="https://maps.google.com/?q=The+Tile+Store+Geethanjali+Junction+NH+Bypass+Chalikkavattom+Ernakulam+Kochi"
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3.5 bg-transparent border border-white/20 text-white hover:border-gold-500 font-sans text-xs font-semibold tracking-widest uppercase flex items-center gap-2 cursor-pointer transition-all duration-300"
                id="showroom-directions-btn"
              >
                <MapPin className="w-4 h-4 text-gold-400" />
                Get Directions
              </a>
            </div>
          </div>
        </div>

        {/* Form & Ticket Interactive Module */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start" id="booking-core-layout">
          
          {/* Left Panel: Direct scheduling or ticket render (7 Cols) */}
          <div className="lg:col-span-7" id="scheduling-engine">
            <AnimatePresence mode="wait">
              {!bookingConfirmed ? (
                // Direct Entry form
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.5 }}
                >
                  <form onSubmit={handleSubmit} className="space-y-6" id="consultation-form">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Name input */}
                      <div className="flex flex-col gap-2">
                        <label className="font-mono text-[10px] uppercase text-gray-400 tracking-widest">Full Name *</label>
                        <input
                          type="text"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Lord/Lady, Architect, Designer..."
                          className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500 transition-all duration-300 rounded-none placeholder-gray-500 font-serif"
                          id="input-name"
                        />
                      </div>

                      {/* Phone input */}
                      <div className="flex flex-col gap-2">
                        <label className="font-mono text-[10px] uppercase text-gray-400 tracking-widest">Phone Number *</label>
                        <input
                          type="tel"
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+91 98765 43210"
                          className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500 transition-all duration-300 rounded-none placeholder-gray-500 font-mono"
                          id="input-phone"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Email input */}
                      <div className="flex flex-col gap-2">
                        <label className="font-mono text-[10px] uppercase text-gray-400 tracking-widest font-medium">Email Address *</label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="design@studio.com"
                          className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500 transition-all duration-300 rounded-none placeholder-gray-500 font-sans"
                          id="input-email"
                        />
                      </div>

                      {/* Professional role */}
                      <div className="flex flex-col gap-2">
                        <label className="font-mono text-[10px] uppercase text-gray-400 tracking-widest">Profile classification</label>
                        <select
                          name="professionalType"
                          value={formData.professionalType}
                          onChange={handleInputChange}
                          className="w-full bg-charcoal border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500 transition-all duration-300 rounded-none cursor-pointer font-sans"
                          id="select-professional"
                        >
                          {designerOptions.map(opt => (
                            <option key={opt} value={opt} className="bg-charcoal text-white">{opt}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Preferred surfaces */}
                      <div className="flex flex-col gap-2">
                        <label className="font-mono text-[10px] uppercase text-gray-400 tracking-widest">Surfaces Of Interest</label>
                        <select
                          name="interestType"
                          value={formData.interestType}
                          onChange={handleInputChange}
                          className="w-full bg-charcoal border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500 transition-all duration-300 rounded-none cursor-pointer font-sans"
                          id="select-interest"
                        >
                          {interestOptions.map(opt => (
                            <option key={opt} value={opt} className="bg-charcoal text-white">{opt}</option>
                          ))}
                        </select>
                      </div>

                      {/* Date selection */}
                      <div className="flex flex-col gap-2">
                        <label className="font-mono text-[10px] uppercase text-gray-400 tracking-widest">Preferred Tour Date</label>
                        <input
                          type="date"
                          name="date"
                          required
                          value={formData.date}
                          onChange={handleInputChange}
                          className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500 transition-all duration-300 rounded-none cursor-pointer font-mono"
                          id="input-date"
                        />
                      </div>
                    </div>

                    {/* Time slot pills */}
                    <div className="flex flex-col gap-2">
                      <label className="font-mono text-[10px] uppercase text-gray-400 tracking-widest mb-1">Select Time Slot</label>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2" id="time-pills-row">
                        {timeSlots.map(time => (
                          <button
                            type="button"
                            key={time}
                            onClick={() => setFormData(p => ({ ...p, time }))}
                            className={`py-2 text-[10px] sm:text-xs font-mono tracking-wider border rounded-sm transition-all duration-300 cursor-pointer ${
                              formData.time === time
                                ? 'bg-gold-500 border-gold-500 text-charcoal font-bold'
                                : 'bg-transparent border-white/10 hover:border-gold-500/30 text-white'
                            }`}
                            id={`time-btn-${time.replace(' ', '')}`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Designer Notes */}
                    <div className="flex flex-col gap-2">
                      <label className="font-mono text-[10px] uppercase text-gray-400 tracking-widest">Special design requirements (Optional)</label>
                      <textarea
                        name="notes"
                        rows={3}
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="E.g., I am renovating a 3,000 sqft penthouse and need seamless gray marble bookmatched flooring..."
                        className="w-full bg-white/5 border border-white/10 p-4 text-xs select-auto text-white focus:outline-none focus:border-gold-500 transition-all duration-300 rounded-none placeholder-gray-500 font-sans"
                        id="textarea-notes"
                      />
                    </div>

                     {/* Form validation alert */}
                     {formError && (
                       <motion.div
                         initial={{ opacity: 0, y: -10 }}
                         animate={{ opacity: 1, y: 0 }}
                         className="p-4 bg-red-950/40 border border-red-500/30 text-red-200 text-xs sm:text-sm font-sans tracking-wide my-4 font-medium"
                         id="booking-form-validation-error"
                       >
                         {formError}
                       </motion.div>
                     )}

                     {/* Submit Consultation button */}
                     <button
                       type="submit"
                       disabled={submitting}
                       className="w-full py-4 bg-white text-charcoal font-sans text-xs tracking-widest uppercase font-bold hover:bg-gold-500 hover:text-charcoal transition-all duration-500 flex items-center justify-center gap-2 cursor-pointer shadow-lg mt-8"
                       id="submit-booking-form"
                     >
                      {submitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Securing Safe Corridor...
                        </>
                      ) : (
                        <>
                          Confirm Showroom Invitation
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              ) : (
                // Invitation Ticket design
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.6, type: 'spring' }}
                  className="p-8 border border-gold-500/30 bg-white/[0.03] backdrop-blur-xl relative"
                  id="invitation-ticket-panel"
                >
                  <div className="absolute top-0 right-0 h-24 w-24 bg-gold-500/5 blur-xl pointer-events-none" />
                  
                  {/* Ticket Header */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-6">
                    <div className="flex flex-col">
                      <span className="font-serif text-lg tracking-widest uppercase text-white font-bold">INVITATION SUCCESS</span>
                      <span className="font-mono text-[9px] tracking-widest text-gold-400 mt-1 uppercase">THE TILE STORE PRIVATE CORRIDOR</span>
                    </div>
                    <CheckCircle className="w-10 h-10 text-gold-500" />
                  </div>

                  <p className="font-sans text-sm text-gray-300 leading-relaxed mb-6">
                    Estimable <strong>{formData.name}</strong>, your private showroom tour is locked. A design manager will connect within 2 hrs to confirm project blueprint scope.
                  </p>

                  {/* Core ticket matrix details */}
                  <div className="grid grid-cols-2 gap-4 border-y border-white/10 py-6 mb-6 font-mono text-xs text-gray-300" id="invitation-ticket-fields">
                    <div>
                      <span className="block text-gray-500 text-[10px] uppercase font-sans tracking-wide">ACCESS CODE</span>
                      <span className="text-white font-bold text-sm tracking-wider">{ticketId}</span>
                    </div>
                    <div>
                      <span className="block text-gray-500 text-[10px] uppercase font-sans tracking-wide">DESIGN INTEREST</span>
                      <span className="text-gold-400 font-semibold truncate block">{formData.interestType}</span>
                    </div>

                    <div className="mt-2">
                      <span className="block text-gray-500 text-[10px] uppercase font-sans tracking-wide">DATE & TIME</span>
                      <span className="text-white font-semibold">{formData.date} at {formData.time}</span>
                    </div>
                    <div className="mt-2">
                      <span className="block text-gray-500 text-[10px] uppercase font-sans tracking-wide">LOCATION PATH</span>
                      <span className="text-white font-semibold">1st Floor West Gallery</span>
                    </div>
                  </div>

                  {/* Simulated barcode graphic representation */}
                  <div className="flex flex-col items-center gap-1.5 p-4 bg-white/[0.02] border border-white/5 mb-8" id="invitation-barcode">
                    <div className="h-10 w-full flex items-center justify-between gap-0.5 opacity-60">
                      {[1,2,1,4,1,3,2,1,2,4,1,2,3,1,2,4,1,2,1,4,1,3,2,1,2,1,3,2,1,4].map((w, idx) => (
                        <div key={idx} className="bg-white h-full" style={{ width: `${w * 1.5}px` }} />
                      ))}
                    </div>
                    <span className="font-mono text-[9px] tracking-widest text-gray-500 uppercase">INVITATION VALID FOR TWO PASSES ONLY</span>
                  </div>

                  {/* Ticket actions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="invitation-ticket-action-row">
                    <button
                      onClick={() => window.print()}
                      className="py-3 bg-white text-charcoal font-sans text-xs tracking-widest uppercase font-bold hover:bg-gold-500 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                      id="print-ticket-btn"
                    >
                      <Printer className="w-4 h-4" />
                      Print Entrance Pass
                    </button>
                    
                    <button
                      onClick={handleReset}
                      className="py-3 bg-transparent border border-white/15 text-white font-sans text-xs tracking-widest uppercase font-bold hover:border-gold-500 hover:text-gold-400 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                      id="book-another-btn"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Book Another Slot
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Panel: Immersive architectural details (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-8 bg-white/[0.02] border border-white/10 p-8" id="invitation-sidebar-perks">
            <div>
              <span className="font-serif text-lg tracking-widest text-white block uppercase font-bold mb-1">THE PRIVATE CORRIDOR EXPERIENCE</span>
              <span className="font-mono text-[9px] text-gold-400 tracking-widest uppercase block">WHY BOOK AN ADVANCED SHOWROOM TOUR?</span>
            </div>

            <div className="space-y-6" id="perks-piles">
              {/* Perk 1 */}
              <div className="flex gap-4">
                <div className="p-3 bg-white/5 border border-white/10 text-gold-500 h-max shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-serif text-base font-semibold text-white mb-1">Exclusive Surface Pre-Releases</h4>
                  <p className="font-sans text-xs text-gray-300 leading-relaxed">
                    Access our secure vault of limited edition Calacatta slabs, imported and stored specifically for landmark villa and hotel projects.
                  </p>
                </div>
              </div>

              {/* Perk 2 */}
              <div className="flex gap-4">
                <div className="p-3 bg-white/5 border border-white/10 text-gold-500 h-max shrink-0">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-serif text-base font-semibold text-white mb-1">Full-Scale Room Spatial Demos</h4>
                  <p className="font-sans text-xs text-gray-300 leading-relaxed">
                    Step inside 100+ live visual mockups configures with multiple high-angle dynamic led combinations to simulate physical lighting angles.
                  </p>
                </div>
              </div>

              {/* Perk 3 */}
              <div className="flex gap-4">
                <div className="p-3 bg-white/5 border border-white/10 text-gold-500 h-max shrink-0">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-serif text-base font-semibold text-white mb-1">1-On-1 Senior Designer Assignment</h4>
                  <p className="font-sans text-xs text-gray-300 leading-relaxed">
                    You're paired with a layout specialist who reads architectural blueprints, runs precise load/friction checks, and optimizes joints.
                  </p>
                </div>
              </div>
            </div>

            {/* Support contacts footer line */}
            <div className="pt-6 border-t border-white/10 font-mono text-[9.5px] text-gray-300 flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                <span>HOTLINE: +91 95447 11111 / +91 95441 11111</span>
              </div>
              <span className="hidden sm:inline text-white/20">|</span>
              <span>SHOWROOM DIRECT: 0484 2809999 (9:30 AM - 7:30 PM)</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
