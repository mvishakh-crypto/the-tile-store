import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, HelpCircle, MapPin, Calendar, Compass, ArrowDown } from 'lucide-react';

interface HeroProps {
  onExploreClick: () => void;
  onBookingClick: () => void;
}

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1920&q=90',
    tag: 'Architectural Surfaces',
    title: 'Crafting *Spaces* <br/>That Define <br/>Luxury.',
    desc: 'Curating world-class premium tiles, large-format sintered slabs, and upscale interior inspirations designed for the most discerning modern homes of Kerala.',
    accent: 'Alabaster Statuario Gold',
    location: 'Kochi Flagship Galleria, NH Bypass'
  },
  {
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=90',
    tag: 'Minimal Residential Design',
    title: 'The Art of *Living*, <br/>Sculpted with <br/>Integrity.',
    desc: 'Elevate culinary spaces, high-end kitchens, and ambient lounges with our luxury curated brands of unparalleled international acclaim.',
    accent: 'Satin Statuario Borghini',
    location: 'Ernakulam Experience Studio'
  },
  {
    image: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=1920&q=90',
    tag: 'Boundless Horizons',
    title: 'Immunity to *Elements*, <br/>Rooted in <br/>Raw Stone.',
    desc: 'Outdoor terraces, heavy-duty paving, and swimming pool claddings selected for premium endurance against moisture and elements.',
    accent: 'Silver Travertine Grigio',
    location: 'Calicut Boutique Atelier'
  }
];

export default function Hero({ onExploreClick, onBookingClick }: HeroProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Helper to parse header title into elegant JSX with normal font for asterisks and line breaks
  const renderTitle = (titleStr: string) => {
    const parts = titleStr.split('<br/>');
    return parts.map((part, idx) => {
      // split by asterisk
      const subParts = part.split('*');
      const renderedLine = subParts.map((sub, sIdx) => {
        if (sIdx % 2 === 1) {
          // Wrapped in asterisks
          return (
            <span key={sIdx} className="not-italic font-normal text-[#C9A227]">
              {sub}
            </span>
          );
        }
        return sub;
      });

      return (
        <span key={idx} className="block">
          {renderedLine}
        </span>
      );
    });
  };

  return (
    <section 
      className="relative h-screen w-full overflow-hidden bg-charcoal text-warmwhite select-none"
      id="home"
    >
      {/* Background Slides with slow scale zoom effect */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="absolute inset-0 w-full h-full"
          id={`hero-slide-${current}`}
        >
          {/* Backdrop darkened overlay */}
          <div className="absolute inset-x-0 inset-y-0 bg-gradient-to-r from-charcoal/80 via-charcoal/50 to-transparent z-10" />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-ivory via-ivory/20 to-transparent z-10" />
          
          <img
            src={slides[current].image}
            alt={slides[current].title}
            className="w-full h-full object-cover object-center scale-100"
            referrerPolicy="no-referrer"
            id={`hero-bg-img-${current}`}
          />
        </motion.div>
      </AnimatePresence>

      {/* Floating Decorative Fine Mesh Background Detail */}
      <div className="absolute inset-0 pointer-events-none z-20 mix-blend-overlay opacity-15 bg-[radial-gradient(#C9A227_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Hero Content Container */}
      <div className="relative z-30 max-w-7xl mx-auto h-full px-6 md:px-12 flex flex-col justify-between pt-32 pb-16">
        <div></div> {/* Spacing Element */}

        {/* Narrative Block */}
        <div className="max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -30, opacity: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              id={`hero-content-block-${current}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="font-mono text-xs tracking-[0.4em] uppercase text-[#C9A227] font-bold">
                  {slides[current].tag}
                </span>
                <span className="h-[1.5px] w-1.5 rounded-full bg-[#C9A227]"></span>
                <span className="font-mono text-[10px] uppercase text-warmwhite/50 tracking-widest hidden md:inline">
                  {slides[current].accent}
                </span>
              </div>

              <h1 className="font-serif italic text-4xl sm:text-5xl lg:text-7xl font-normal leading-[1.08] text-warmwhite tracking-tight mb-8">
                {renderTitle(slides[current].title)}
              </h1>

              <p className="font-sans text-sm md:text-base text-[#FCFBF8]/80 leading-relaxed max-w-md mb-10">
                {slides[current].desc}
              </p>

              {/* Action Buttons with soft luxury custom styling */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <button
                  onClick={onExploreClick}
                  className="group relative px-8 py-4 bg-charcoal text-white border border-charcoal text-[11px] uppercase tracking-widest font-semibold transition-all duration-300 hover:bg-[#C9A227] hover:border-[#C9A227] cursor-pointer text-center flex items-center justify-center gap-4"
                  id="hero-explore-btn"
                >
                  Explore Collection
                  <span className="w-4 h-[1px] bg-white group-hover:w-8 transition-all"></span>
                </button>

                <button
                  onClick={onBookingClick}
                  className="group relative px-8 py-4 bg-transparent border border-[#D6C2A1] text-warmwhite hover:text-white hover:border-white text-[11px] uppercase tracking-widest font-semibold transition-all duration-300 cursor-pointer text-center flex items-center justify-center gap-2"
                  id="hero-showroom-btn"
                >
                  Visit Showroom
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Cinematic Dashboard Row (Metrics and Navigation Indicators) */}
        <div className="flex items-end justify-between border-t border-warmwhite/10 pt-8 mt-4 z-40">
          {/* Active Detail Frame */}
          <div className="hidden md:flex items-center gap-6" id="hero-meta-detail">
            <div className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-warmwhite/50">
              <MapPin className="w-3.5 h-3.5 text-gold-500" />
              <span>{slides[current].location}</span>
            </div>
            <span className="text-warmwhite/10 font-mono">|</span>
            <div className="font-mono text-[10px] tracking-widest text-warmwhite/50">
              SURFACE DESIGN : <span className="text-gold-400">{slides[current].accent}</span>
            </div>
          </div>

          {/* Sinks down indicator */}
          <div className="flex items-center gap-2 animate-bounce cursor-pointer group" onClick={onExploreClick} id="scroll-prompt">
            <ArrowDown className="w-4 h-4 text-gold-400 group-hover:text-gold-500" />
            <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-warmwhite/40 group-hover:text-warmwhite/90 transition-colors duration-300 hidden sm:inline">
              SCROLL EXHIBITION
            </span>
          </div>

          {/* Manual Slider Navigation Arrows with exclusive minimal borders */}
          <div className="flex items-center gap-3" id="hero-arrow-nav">
            <button
              onClick={prevSlide}
              className="p-3 border border-warmwhite/10 rounded-full hover:bg-warmwhite hover:text-charcoal hover:border-warmwhite transition-all duration-300 cursor-pointer"
              aria-label="Previous slide"
              id="hero-prev-arrow"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            {/* Custom Circular Segment Indicator */}
            <span className="font-mono text-xs tracking-widest text-gold-400 font-medium">
              0{current + 1} <span className="text-warmwhite/20">/</span> 0{slides.length}
            </span>

            <button
              onClick={nextSlide}
              className="p-3 border border-warmwhite/10 rounded-full hover:bg-warmwhite hover:text-charcoal hover:border-warmwhite transition-all duration-300 cursor-pointer"
              aria-label="Next slide"
              id="hero-next-arrow"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
