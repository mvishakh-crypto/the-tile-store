import { useState } from 'react';
import { useBrands } from '../hooks/useProducts';
import { premiumBrands as staticBrands } from '../data/tiles';
import { motion } from 'motion/react';
import { Sparkles, Trophy, Globe, Compass, ArrowRight, ShieldCheck } from 'lucide-react';

export default function BrandShowcase() {
  const { data: dynamicBrands } = useBrands();
  const premiumBrands = (dynamicBrands && dynamicBrands.length > 0) ? dynamicBrands : staticBrands;
  const [hoveredBrandId, setHoveredBrandId] = useState<string | null>(null);

  // Map icon component based on brand index for high design resolution
  const getBrandIcon = (id: string) => {
    switch (id) {
      case 'b1': return <Trophy className="w-5 h-5 text-[#C9A227]" />;
      case 'b2': return <Sparkles className="w-5 h-5 text-[#C9A227]" />;
      case 'b3': return <Globe className="w-5 h-5 text-[#C9A227]" />;
      default: return <Compass className="w-5 h-5 text-[#C9A227]" />;
    }
  };

  return (
    <section 
      className="py-24 bg-warmwhite relative overflow-hidden border-t border-[#D6C2A1]/20" 
      id="brands"
    >
      {/* Decorative Warm Sand Backdrop Light */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#D6C2A1]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 mb-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#C9A227] font-bold">
                CURATED SHIELD OF QUALITY
              </span>
              <span className="h-[1px] w-8 bg-[#C9A227]/40"></span>
            </div>
            
            <h2 className="font-serif italic text-3xl md:text-5xl font-normal text-charcoal tracking-tight">
              Authorized Premium <span className="not-italic font-medium text-[#C9A227]">Partners</span>
            </h2>
          </div>
          
          <p className="font-sans text-xs sm:text-sm text-charcoal/60 max-w-md leading-relaxed">
            We collaborate exclusively with global luxury manufacturers to secure raw mineral integrity, patented glazes, and lifetime architectural warranties.
          </p>
        </div>
      </div>

      {/* Infinite Horizontal Scrolling Ticker (Right to Left Marquee) */}
      <div className="relative w-full overflow-hidden py-6 select-none" id="brands-marquee-viewport">
        {/* Elegant Glassy Fades to blend into background */}
        <div className="absolute left-0 top-0 bottom-0 w-16 md:w-48 bg-gradient-to-r from-warmwhite via-warmwhite/85 to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 md:w-48 bg-gradient-to-l from-warmwhite via-warmwhite/85 to-transparent z-20 pointer-events-none" />

        {/* Double-buffered Track */}
        <div className="flex w-max animate-marquee hover:[animation-play-state:paused]" id="brands-marquee-track">
          
          {/* Track 1: Original Set */}
          <div className="flex gap-6 pr-6">
            {premiumBrands.map((brand, index) => (
              <div
                key={`brand-marquee-1-${brand.id}-${index}`}
                onMouseEnter={() => setHoveredBrandId(brand.id)}
                onMouseLeave={() => setHoveredBrandId(null)}
                className="w-[380px] shrink-0 bg-white border border-[#D6C2A1]/25 p-8 transition-all duration-300 hover:border-[#C9A227] hover:shadow-2xl relative flex flex-col justify-between group"
              >
                {/* Subtle Amber Glow */}
                <div className="absolute top-0 right-0 h-20 w-20 bg-[#C9A227]/5 blur-xl group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <div>
                  {/* Brand Header */}
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#D6C2A1]/10">
                    <div className="flex items-center gap-3">
                      <div className="p-2 border border-[#D6C2A1]/20 rounded-none group-hover:border-[#C9A227]/50 group-hover:bg-[#C9A227]/5 transition-all duration-300">
                        {getBrandIcon(brand.id)}
                      </div>
                      <span className="font-serif text-lg tracking-widest font-bold uppercase text-charcoal group-hover:text-[#C9A227] transition-all duration-300">
                        {brand.name}
                      </span>
                    </div>

                    <span className="font-mono text-[8px] tracking-[0.2em] uppercase text-[#C9A227] bg-[#C9A227]/5 border border-[#C9A227]/20 px-2 py-0.5 font-bold">
                      OFFICIAL
                    </span>
                  </div>

                  {/* Narrative description */}
                  <p className="font-sans text-xs text-charcoal/70 leading-relaxed mb-6">
                    {brand.description}
                  </p>
                </div>

                {/* Bullets/Highlights */}
                <div>
                  <div className="text-[9px] font-mono tracking-wider text-charcoal/45 uppercase mb-3 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#C9A227]" />
                    Architectural Specifications
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5">
                    {brand.highlights.map((highlight, idx) => (
                      <span
                        key={idx}
                        className="text-[8px] font-mono tracking-widest uppercase bg-ivory text-charcoal/70 border border-[#D6C2A1]/15 px-2.5 py-1 transition-colors duration-300 group-hover:bg-warmwhite group-hover:border-[#C9A227]/30"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Decorative border bar */}
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-charcoal/5 group-hover:bg-[#C9A227] transition-all duration-300" />
              </div>
            ))}
          </div>

          {/* Track 2: Duplicate Set for infinite continuation */}
          <div className="flex gap-6 pr-6" aria-hidden="true">
            {premiumBrands.map((brand, index) => (
              <div
                key={`brand-marquee-2-${brand.id}-${index}`}
                className="w-[380px] shrink-0 bg-white border border-[#D6C2A1]/25 p-8 transition-all duration-300 hover:border-[#C9A227] hover:shadow-2xl relative flex flex-col justify-between group"
              >
                {/* Subtle Amber Glow */}
                <div className="absolute top-0 right-0 h-20 w-20 bg-[#C9A227]/5 blur-xl group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <div>
                  {/* Brand Header */}
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#D6C2A1]/10">
                    <div className="flex items-center gap-3">
                      <div className="p-2 border border-[#D6C2A1]/20 rounded-none group-hover:border-[#C9A227]/50 group-hover:bg-[#C9A227]/5 transition-all duration-300">
                        {getBrandIcon(brand.id)}
                      </div>
                      <span className="font-serif text-lg tracking-widest font-bold uppercase text-charcoal group-hover:text-[#C9A227] transition-all duration-300">
                        {brand.name}
                      </span>
                    </div>

                    <span className="font-mono text-[8px] tracking-[0.2em] uppercase text-[#C9A227] bg-[#C9A227]/5 border border-[#C9A227]/20 px-2 py-0.5 font-bold">
                      OFFICIAL
                    </span>
                  </div>

                  {/* Narrative description */}
                  <p className="font-sans text-xs text-charcoal/70 leading-relaxed mb-6">
                    {brand.description}
                  </p>
                </div>

                {/* Bullets/Highlights */}
                <div>
                  <div className="text-[9px] font-mono tracking-wider text-charcoal/45 uppercase mb-3 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#C9A227]" />
                    Architectural Specifications
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5">
                    {brand.highlights.map((highlight, idx) => (
                      <span
                        key={idx}
                        className="text-[8px] font-mono tracking-widest uppercase bg-ivory text-charcoal/70 border border-[#D6C2A1]/15 px-2.5 py-1 transition-colors duration-300 group-hover:bg-warmwhite group-hover:border-[#C9A227]/30"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Decorative border bar */}
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-charcoal/5 group-hover:bg-[#C9A227] transition-all duration-300" />
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Partnership Standards Foot Band */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 mt-12">
        <div className="pt-10 border-t border-[#D6C2A1]/25 flex flex-col md:flex-row items-center justify-between gap-6" id="brand-partnership-foot">
          <div className="flex items-center gap-4">
            <div className="h-2 w-2 rounded-full bg-[#C9A227] animate-pulse" />
            <span className="font-mono text-[10px] tracking-widest uppercase text-charcoal/50 font-semibold">
              GLOBAL STANDARDS CERTIFICATION
            </span>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-[10px] font-mono tracking-widest text-[#C9A227] font-semibold">
            <span className="text-charcoal/50">ISO 9001:2015</span>
            <span className="text-[#D6C2A1]">•</span>
            <span>CE MARKED PORCELAIN</span>
            <span className="text-[#D6C2A1]">•</span>
            <span className="text-charcoal/50">GREEN ECO BUILD CERTIFIED</span>
            <span className="text-[#D6C2A1]">•</span>
            <span>ASME REINFORCED SLABS</span>
          </div>
        </div>
      </div>
    </section>
  );
}
