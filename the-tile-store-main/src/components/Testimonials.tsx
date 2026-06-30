import { useState, useEffect } from 'react';
import { useTestimonials } from '../hooks/useTestimonials';
import { premiumTestimonials as staticTestimonials } from '../data/tiles';
import { motion, AnimatePresence } from 'motion/react';
import { Quote, Star, ChevronLeft, ChevronRight, UserCheck } from 'lucide-react';

export default function Testimonials() {
  const { data: dynamicTestimonials } = useTestimonials();
  const testimonials = (dynamicTestimonials && dynamicTestimonials.length > 0)
    ? dynamicTestimonials
    : staticTestimonials;

  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  useEffect(() => {
    if (!isPlaying || testimonials.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % testimonials.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [isPlaying, testimonials.length]);

  const nextTestimonial = () => {
    setIsPlaying(false);
    setCurrentIdx((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setIsPlaying(false);
    setCurrentIdx((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  if (testimonials.length === 0) return null;

  const current = testimonials[currentIdx];

  return (
    <section 
      className="py-24 bg-white relative overflow-hidden flex flex-col justify-center" 
      id="testimonials"
    >
      {/* Decorative luxury circular vector flare */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-charcoal/5 rounded-full pointer-events-none z-0 mix-blend-multiply" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-charcoal/[0.03] rounded-full pointer-events-none z-0" />

      <div className="max-w-4xl mx-auto px-6 relative z-10 flex flex-col items-center text-center">
        
        {/* Quote Icon Detail */}
        <div className="p-4 border border-charcoal/5 rounded-full bg-ivory mb-8 shadow-sm">
          <Quote className="w-6 h-6 text-gold-500 fill-gold-500/10" />
        </div>

        {/* Dynamic Display of Testimonials with motion */}
        <div className="min-h-[260px] sm:min-h-[220px] flex items-center justify-center w-full" id="testimonial-interactive-carousel">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIdx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              className="flex flex-col items-center"
              id={`testimonial-block-${current.id}`}
            >
              <h3 className="font-serif text-lg sm:text-2xl md:text-3xl font-normal text-charcoal italic leading-relaxed max-w-3xl mb-8">
                "{current.quote}"
              </h3>

              {/* Star rating design */}
              <div className="flex items-center gap-1 mb-4" id="testimonial-stars animate-float">
                {[...Array(current.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-gold-500 fill-gold-500" />
                ))}
              </div>

              {/* User Profiling block */}
              <div className="flex items-center gap-3.5" id="testimonial-user-profile">
                <img
                  src={current.avatar}
                  alt={current.clientName}
                  className="w-12 h-12 rounded-full object-cover border border-charcoal/10"
                  referrerPolicy="no-referrer"
                  id="avatar-img"
                />
                
                <div className="text-left">
                  <h4 className="font-serif text-sm sm:text-base font-bold text-charcoal flex items-center gap-1.5 leading-snug">
                    {current.clientName}
                    <UserCheck className="w-3.5 h-3.5 text-gold-600" />
                  </h4>
                  <span className="font-mono text-[9.5px] uppercase tracking-wider text-charcoal/50 block">
                    {current.role} • <span className="text-gold-600 font-semibold">{current.company}</span>
                  </span>
                </div>
              </div>

            </motion.div>
          </AnimatePresence>
        </div>

        {/* Slide Controls Buttons */}
        <div className="flex items-center gap-8 mt-12" id="testimonial-controls">
          <button
            onClick={prevTestimonial}
            className="p-2.5 border border-charcoal/10 rounded-full hover:bg-charcoal hover:text-warmwhite hover:border-charcoal transition-all duration-300 cursor-pointer"
            aria-label="Previous review"
            id="testimonial-prev-btn"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="font-mono text-[11px] tracking-widest text-charcoal/30">
            0{currentIdx + 1} <span className="text-charcoal/10">|</span> 0{testimonials.length}
          </span>

          <button
            onClick={nextTestimonial}
            className="p-2.5 border border-charcoal/10 rounded-full hover:bg-charcoal hover:text-warmwhite hover:border-charcoal transition-all duration-300 cursor-pointer"
            aria-label="Next review"
            id="testimonial-next-btn"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Project references trace */}
        <div className="mt-8 py-2 px-4 rounded bg-ivory border border-charcoal/5 flex items-center gap-2" id="testimonial-project-reference">
          <span className="h-1.5 w-1.5 rounded-full bg-gold-500" />
          <span className="font-mono text-[9px] tracking-widest uppercase text-charcoal/50">
            SHOWROOM CASE: <span className="text-charcoal font-semibold">{current.projectType}</span>
          </span>
        </div>

      </div>
    </section>
  );
}
