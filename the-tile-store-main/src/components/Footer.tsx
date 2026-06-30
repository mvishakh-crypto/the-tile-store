import React, { useState } from 'react';
import { Phone, Mail, MapPin, Compass, Shield, Award, Sparkles, Instagram, Facebook, ArrowRight, CheckCircle2 } from 'lucide-react';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubscribed(true);
      setEmail('');
    }, 1200);
  };

  const exploreLinks = [
    { label: 'Signature Collections', id: 'collections' },
    { label: 'Surface Visualizer', id: 'visualizer' },
    { label: 'Premium Partners', id: 'brands' },
    { label: 'Showroom Stats', id: 'why-choose-us' },
    { label: 'Project Portfolio', id: 'projects' },
    { label: 'Book Consultation', id: 'booking' }
  ];

  const surfaceFilters = [
    { label: 'Floor Tiles / Vitrified' },
    { label: 'Moroccan Artisanal Wall' },
    { label: 'Chef Kitchen Countertops' },
    { label: 'Bathroom Porcelain Slabs' },
    { label: 'High-Load Outdoor Planks' },
    { label: 'Sculptical elevation flutes' }
  ];

  return (
    <footer 
      className="bg-charcoal text-warmwhite pt-0 pb-12 border-t border-white/5 relative overflow-hidden" 
      id="main-footer"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">

        {/* Newsletter Banner — Full Width */}
        <div className="py-16 border-b border-white/5 mb-16" id="newsletter-section">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div>
              <p className="font-mono text-[10px] tracking-[0.4em] uppercase text-gold-500 mb-2">
                ATELIER DISPATCH
              </p>
              <h3 className="font-serif text-2xl md:text-3xl font-bold text-warmwhite tracking-wide">
                Stay Ahead of Design Trends
              </h3>
              <p className="font-sans text-sm text-warmwhite/40 mt-2 max-w-md">
                Receive curated editorial drops — new collections, installation guides, and exclusive studio previews.
              </p>
            </div>

            <form
              onSubmit={handleSubscribe}
              className="flex flex-col sm:flex-row items-stretch gap-0 w-full lg:w-auto lg:min-w-[420px]"
            >
              {subscribed ? (
                <div className="flex items-center gap-3 px-6 py-4 border border-gold-500/30 bg-gold-500/10 w-full">
                  <CheckCircle2 className="w-5 h-5 text-gold-500 flex-shrink-0" />
                  <div>
                    <p className="font-sans text-sm font-semibold text-warmwhite">You're on the list!</p>
                    <p className="font-mono text-[9px] tracking-widest uppercase text-warmwhite/40 mt-0.5">
                      Welcome to the Atelier Dispatch
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your professional email"
                    required
                    className="flex-1 px-5 py-4 bg-white/5 border border-white/10 text-warmwhite placeholder:text-warmwhite/30 font-mono text-sm focus:outline-none focus:border-gold-500/40 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-4 bg-gold-500 text-charcoal font-mono text-[10px] tracking-widest uppercase font-bold hover:bg-gold-600 transition-all duration-300 flex items-center gap-2 whitespace-nowrap cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      <span className="inline-block w-4 h-4 border-2 border-charcoal/30 border-t-charcoal rounded-full animate-spin" />
                    ) : (
                      <>
                        Subscribe
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
        
        {/* Upper footer quadrant */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16" id="footer-upper">
          
          {/* Col 1 Brand Pitch (4 Cols) */}
          <div className="lg:col-span-4" id="footer-pitch">
            <span className="font-serif text-xl tracking-[0.2em] uppercase font-bold text-white block">
              The Tile Store
            </span>
            <div className="flex items-center gap-1.5 mt-2 mb-6">
              <span className="h-[1px] w-6 bg-gold-400"></span>
              <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-gold-400">
                SURFACES & INTERIORS
              </span>
            </div>

            <p className="font-sans text-xs sm:text-sm text-gray-300 leading-relaxed mb-6 max-w-sm">
              We supply landmark spaces. Our architectural vitrified slabs and precision engineered natural minerals represent the pinnacle of modern flooring development.
            </p>

            {/* Social handles with minimal gold borders */}
            <div className="flex items-center gap-3.5" id="footer-social-handles">
              <span className="font-mono text-[9px] tracking-widest text-white/40 uppercase">FOLLOW US:</span>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noreferrer" 
                className="p-2 border border-white/10 hover:border-gold-500 rounded-full text-gray-400 hover:text-gold-400 transition-all duration-300 cursor-pointer"
                aria-label="Instagram Profile Link"
                id="footer-ig-link"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noreferrer" 
                className="p-2 border border-white/10 hover:border-gold-500 rounded-full text-gray-400 hover:text-gold-400 transition-all duration-300 cursor-pointer"
                aria-label="Facebook Profile Link"
                id="footer-fb-link"
              >
                <Facebook className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Col 2 Explorations (3-Cols) */}
          <div className="lg:col-span-3" id="footer-explore-links">
            <h4 className="font-serif text-sm tracking-widest font-semibold uppercase text-gold-400 mb-6">EXPLORE SHOWROOM</h4>
            <ul className="space-y-3 font-sans text-xs text-gray-300">
              {exploreLinks.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => onNavigate(link.id)}
                    className="hover:text-gold-400 hover:underline transition-colors duration-300 cursor-pointer text-left"
                    id={`footer-nav-to-${link.id}`}
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 Architect specifications (2-Cols) */}
          <div className="lg:col-span-2" id="footer-spec-tags">
            <h4 className="font-serif text-sm tracking-widest font-semibold uppercase text-gold-400 mb-6">SPECIFICATIONS</h4>
            <ul className="space-y-3 font-sans text-[11px] text-gray-400">
              {surfaceFilters.map((link, idx) => (
                <li key={idx} className="hover:text-gold-300 transition-colors duration-300">
                  {link.label}
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 Contacts details (3-Cols) */}
          <div className="lg:col-span-3" id="footer-showroom-details">
            <h4 className="font-serif text-sm tracking-widest font-semibold uppercase text-gold-500 mb-6">SHOWROOM ATELIER</h4>
            <div className="space-y-4 font-sans text-xs text-gray-300">
              
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  33/2180 B-1, NH Bypass, Geethanjali Junction, Chalikkavattom, Ernakulam, Kochi, Kerala - 682032
                </span>
              </div>

              <div className="flex flex-col gap-1.5 justify-start">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gold-400 shrink-0" />
                  <span>+91 95447 11111</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gold-400 shrink-0" />
                  <span>+91 95441 11111</span>
                </div>
                <div className="font-mono text-[10px] text-gray-400 pl-7">
                  LL: 0484 2809999
                </div>
              </div>

              <div className="flex flex-col gap-1 border-b border-white/5 pb-4 mb-2">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gold-400 shrink-0" />
                  <span className="hover:text-gold-400 transition-colors">info@thetilestore.in</span>
                </div>
                <div className="font-mono text-[10px] text-gray-400 pl-7">
                  thetilestorekochi@gmail.com
                </div>
              </div>

              {/* Timing detail */}
              <div className="font-mono text-[9px] text-gray-500 uppercase tracking-widest">
                HOURS: MON - SAT (09:30 AM - 07:30 PM)
              </div>

            </div>
          </div>

        </div>

        {/* Lower footer row */}
        <div className="border-t border-white/10 pt-8 mt-12 flex flex-col sm:flex-row items-center justify-between gap-6" id="footer-lower">
          
          {/* Logo trace / credits */}
          <div className="flex items-center gap-4 text-[10px] font-mono text-gray-500 tracking-widest uppercase">
            <span>© {currentYear} The Tile Store. All rights reserved.</span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline hover:text-white transition-colors duration-300 cursor-pointer">Terms & Logistics</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline hover:text-white transition-colors duration-300 cursor-pointer">Designer Privacy API</span>
          </div>

          {/* Verified standard assets */}
          <div className="flex items-center gap-6" id="standard-badges">
            <div className="flex items-center gap-1.5 font-mono text-[9px] tracking-widest text-gold-500 bg-white/5 border border-white/10 px-3 py-1.5 uppercase rounded-sm">
              <Award className="w-3.5 h-3.5" />
              <span>IS: 13712 CLAY STANDARD</span>
            </div>

            <div className="flex items-center gap-1.5 font-mono text-[9px] tracking-widest text-gold-500 bg-white/5 border border-white/10 px-3 py-1.5 uppercase rounded-sm">
              <Shield className="w-3.5 h-3.5" />
              <span>LIFETIME SLAB INDEX</span>
            </div>
          </div>

        </div>

      </div>
    </footer>
  );
}
