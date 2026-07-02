import React, { useState, useEffect, useRef } from 'react';
import { Landmark, Layers, Layout, Clock, Award, Hammer, BookOpen } from 'lucide-react';

// Static data outside component so the useEffect can reference it without stale-closure issues
const STATS_DATA = [
  {
    id: 'm1',
    target: 4000,
    suffix: '+',
    label: 'Exquisite Tile Designs',
    subtitle: 'From hand-finished local terracotta to colossal high-load architectural porcelain.',
  },
  {
    id: 'm2',
    target: 15000,
    suffix: ' Sqft',
    label: 'Majestic Physical Showroom',
    subtitle: 'Curated galleries and bespoke mockups to explore surfaces under natural sky light.',
  },
  {
    id: 'm3',
    target: 500000,
    suffix: '+ Sqft',
    label: 'Ready Slabs in Stock',
    subtitle: 'Massive local inventory ensuring instant project logistics and zero structural delays.',
  },
  {
    id: 'm4',
    target: 100,
    suffix: '+',
    label: 'Live Showroom Mockups',
    subtitle: 'Full-scale physical living room and bath concepts configured for direct feedback.',
  },
];

export default function WhyChooseUs() {
  const icons: Record<string, React.ReactNode> = {
    m1: <Layers className="w-5 h-5 text-gold-500" />,
    m2: <Landmark className="w-5 h-5 text-gold-500" />,
    m3: <Award className="w-5 h-5 text-gold-500" />,
    m4: <Layout className="w-5 h-5 text-gold-500" />,
  };

  // Displayed count for each stat, starts at 0
  const [counts, setCounts] = useState<Record<string, number>>(
    () => Object.fromEntries(STATS_DATA.map(s => [s.id, 0]))
  );
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || hasAnimated) return;
        setHasAnimated(true);

        STATS_DATA.forEach(({ id, target }) => {
          const DURATION = 1800;
          const start = performance.now();

          const tick = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / DURATION, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const value = progress < 1 ? Math.floor(eased * target) : target;
            setCounts((prev: Record<string, number>) => ({ ...prev, [id]: value }));
            if (progress < 1) requestAnimationFrame(tick);
          };

          requestAnimationFrame(tick);
        });
      },
      { threshold: 0.25 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [hasAnimated]);

  return (
    <section
      ref={sectionRef}
      className="py-24 bg-charcoal text-warmwhite relative overflow-hidden"
      id="why-choose-us"
    >
      {/* Absolute Backdrop Details */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gold-500/5 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold-400/5 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">

        {/* Header Block */}
        <div className="max-w-3xl mb-16" id="why-choose-us-heading">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-gold-400 font-semibold animate-pulse">
              EXECUTIVE MATRIX & STRENGTHS
            </span>
            <span className="h-[1px] w-8 bg-gold-400/50"></span>
          </div>

          <h2 className="font-serif text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Showroom Capacity & Precision
          </h2>

          <p className="font-sans text-xs sm:text-sm text-gray-300 leading-relaxed max-w-xl">
            We operate at scale. We serve premium architects and custom homebuilders with immediate logistics capacity, exquisite customer custom-sizing support, and global sourcing lines.
          </p>
        </div>

        {/* Stats Grid Layout styled as luxurious Bento cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="stats-bento-grid">
          {STATS_DATA.map((stat) => (
            <div
              key={stat.id}
              className="bg-white/5 border border-white/10 p-8 flex flex-col justify-between hover:bg-white/10 hover:border-gold-500/50 transition-all duration-500 rounded-none group relative"
              id={`stat-bento-card-${stat.id}`}
            >
              {/* Abs hover trace outline */}
              <div className="absolute top-0 left-0 w-[2px] h-0 bg-gold-500 group-hover:h-full transition-all duration-500" />

              <div id={`stat-header-${stat.id}`}>
                <div className="mb-6 p-2 w-max border border-white/10 rounded-full group-hover:border-gold-500/50 group-hover:bg-gold-500/10 transition-colors duration-300">
                  {icons[stat.id]}
                </div>

                {/* Count-up number display */}
                <div className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-warmwhite tracking-tight mb-2 flex items-baseline tabular-nums">
                  <span>{counts[stat.id].toLocaleString()}</span>
                  <span className="text-gold-400 text-2xl ml-0.5">{stat.suffix}</span>
                </div>
              </div>

              <div>
                <h3 className="font-serif text-base font-semibold group-hover:text-gold-400 transition-colors duration-300 mb-2">
                  {stat.label}
                </h3>
                <p className="font-sans text-xs text-gray-300 leading-relaxed">
                  {stat.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Studio Core Standards Section row */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-white/10" id="standards-row">
          <div className="flex gap-4" id="std-logistics">
            <div className="p-3 bg-white/5 border border-white/10 shrink-0 h-max">
              <Clock className="w-5 h-5 text-gold-400" />
            </div>
            <div>
              <h4 className="font-serif text-base font-semibold mb-1 text-white">48-Hr Site Despatch</h4>
              <p className="font-sans text-xs text-gray-300 leading-relaxed">
                Our automated warehouse system means standard pallet and marble stock are dispatched inside a strict 48-hour protocol.
              </p>
            </div>
          </div>

          <div className="flex gap-4" id="std-craft">
            <div className="p-3 bg-white/5 border border-white/10 shrink-0 h-max">
              <Hammer className="w-5 h-5 text-gold-400" />
            </div>
            <div>
              <h4 className="font-serif text-base font-semibold mb-1 text-white">Millimeter Cutting</h4>
              <p className="font-sans text-xs text-gray-300 leading-relaxed">
                In-house German precision diamond cutting equipment allows customized sizing adjustments down to 0.5 millimeter tolerance.
              </p>
            </div>
          </div>

          <div className="flex gap-4" id="std-consultants">
            <div className="p-3 bg-white/5 border border-white/10 shrink-0 h-max">
              <BookOpen className="w-5 h-5 text-gold-400" />
            </div>
            <div>
              <h4 className="font-serif text-base font-semibold mb-1 text-white">Bespoke CAD Mockups</h4>
              <p className="font-sans text-xs text-gray-300 leading-relaxed">
                Provide us your floor plan and our virtual design studio will construct complete material layouts for sign-off.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
