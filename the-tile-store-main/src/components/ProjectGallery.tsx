import { useState, useMemo } from 'react';
import { useGalleries } from '../hooks/useGalleries';
import { ProjectItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin, Minimize2, ChevronLeft, ChevronRight, Compass, Shield, Calendar, Sparkles } from 'lucide-react';
import ProgressiveImage from './ProgressiveImage';

export default function ProjectGallery() {
  const { data: galleries, isLoading } = useGalleries();
  const [activeRoom, setActiveRoom] = useState<string>('All');
  const [activeStyle, setActiveStyle] = useState<string>('All');
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  const rooms = ['All', 'Bathroom', 'Kitchen', 'Living room', 'Outdoor', 'Commercial', 'Luxury villas'];
  const styles = ['All', 'Modern', 'Rustic', 'Classic'];

  const filteredProjects = useMemo(() => {
    const projectGallery = galleries || [];
    return projectGallery.filter(p => {
      const matchRoom = activeRoom === 'All' || p.room === activeRoom;
      const matchStyle = activeStyle === 'All' || p.style === activeStyle;
      return matchRoom && matchStyle;
    });
  }, [galleries, activeRoom, activeStyle]);

  const handleNextProject = () => {
    if (!selectedProject || filteredProjects.length <= 1) return;
    const currentIndex = filteredProjects.findIndex(p => p.id === selectedProject.id);
    if (currentIndex !== -1) {
      const nextIndex = (currentIndex + 1) % filteredProjects.length;
      setSelectedProject(filteredProjects[nextIndex]);
    }
  };

  const handlePrevProject = () => {
    if (!selectedProject || filteredProjects.length <= 1) return;
    const currentIndex = filteredProjects.findIndex(p => p.id === selectedProject.id);
    if (currentIndex !== -1) {
      const prevIndex = (currentIndex - 1 + filteredProjects.length) % filteredProjects.length;
      setSelectedProject(filteredProjects[prevIndex]);
    }
  };

  return (
    <section 
      className="py-24 bg-ivory scroll-mt-20" 
      id="projects"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-gold-600 font-semibold">
                ARCHITECTURAL SHOWCASE
              </span>
              <span className="h-[1px] w-8 bg-gold-400"></span>
            </div>
            
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-charcoal tracking-tight">
              Bespoke Spaces & Installations
            </h2>
          </div>
          
          <p className="font-sans text-xs sm:text-sm text-charcoal/60 max-w-md leading-relaxed">
            Examine real-world projects executed with ceramics and premium slabs from The Tile Store. Filter by architectural room typology and style details below.
          </p>
        </div>

        {/* Double Filter Row Setup */}
        <div className="space-y-4 mb-12">
          {/* Room-based filtering */}
          <div>
            <span className="block font-mono text-[9px] tracking-widest text-charcoal/40 uppercase mb-2">
              ROOM TYPE
            </span>
            <div className="flex items-center justify-start overflow-x-auto pb-2 gap-2.5 no-scrollbar" id="project-room-filters">
              {rooms.map((room) => (
                <button
                  key={room}
                  onClick={() => setActiveRoom(room)}
                  className={`px-5 py-2.5 rounded-none font-sans text-[10px] sm:text-xs tracking-widest uppercase transition-all duration-300 border cursor-pointer whitespace-nowrap ${
                    activeRoom === room
                      ? 'bg-gold-500 border-gold-500 text-charcoal font-medium shadow-md'
                      : 'bg-white border-charcoal/5 text-charcoal/60 hover:border-gold-300 hover:text-charcoal'
                  }`}
                  id={`project-room-filter-${room.replace(/\s+/g, '-').toLowerCase()}`}
                >
                  {room}
                </button>
              ))}
            </div>
          </div>

          {/* Style-based filtering */}
          <div>
            <span className="block font-mono text-[9px] tracking-widest text-charcoal/40 uppercase mb-2">
              DESIGN STYLE
            </span>
            <div className="flex items-center justify-start overflow-x-auto pb-2 gap-2.5 no-scrollbar" id="project-style-filters">
              {styles.map((style) => (
                <button
                  key={style}
                  onClick={() => setActiveStyle(style)}
                  className={`px-5 py-2 rounded-none font-sans text-[10px] sm:text-[11px] tracking-widest uppercase transition-all duration-300 border cursor-pointer whitespace-nowrap ${
                    activeStyle === style
                      ? 'bg-gold-500 border-[#C9A227] text-charcoal font-semibold shadow-md'
                      : 'bg-white border-charcoal/5 text-charcoal/60 hover:border-gold-300 hover:text-charcoal'
                  }`}
                  id={`project-style-filter-${style.toLowerCase()}`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Masonry-Style Grid Display */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-16 bg-white border border-charcoal/8">
            <Sparkles className="w-6 h-6 mx-auto text-charcoal/20 mb-2" />
            <h4 className="font-serif text-sm font-semibold text-charcoal">No projects match your selection</h4>
            <p className="font-sans text-xs text-charcoal/40 mt-1">Try resetting the room typology or design style filters.</p>
          </div>
        ) : (
          <motion.div 
            layout 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            id="project-masonry-grid"
          >
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project, idx) => {
                // Custom responsive height span to emulate true masonry grid aesthetics
                const isLarge = idx === 1 || idx === 4;
                
                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    className={`group relative overflow-hidden bg-charcoal border border-charcoal/5 shadow-lg flex flex-col justify-end cursor-pointer ${
                      isLarge ? 'md:row-span-2 min-h-[480px]' : 'min-h-[340px]'
                    }`}
                    style={{ contentVisibility: 'auto' }}
                    id={`project-thumb-${project.id}`}
                  >
                    {/* Background Image Layer */}
                    <div className="absolute inset-x-0 inset-y-0 z-0">
                      <ProgressiveImage
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full"
                        imgClassName="group-hover:scale-105 transition-transform duration-1000"
                        referrerPolicy="no-referrer"
                        id={`project-img-thumb-${project.id}`}
                      />
                      {/* Shadow Layer Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/40 to-transparent opacity-90 group-hover:opacity-95 transition-opacity duration-300 z-10" />
                    </div>

                    {/* Text Details Wrapper */}
                    <div className="relative z-10 p-8 flex flex-col gap-1.5" id={`project-overlay-data-${project.id}`}>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] tracking-widest text-gold-400 uppercase font-semibold">
                          {project.room || project.category}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-gold-400" />
                        <span className="font-mono text-[9px] text-gray-300 uppercase tracking-widest">
                          {project.style}
                        </span>
                      </div>

                      <h3 className="font-serif text-xl sm:text-2xl font-bold text-warmwhite leading-tight block">
                        {project.title}
                      </h3>
                      
                      <p className="font-sans text-xs text-gray-300 line-clamp-2 max-w-sm mt-1 mb-4 hidden sm:block opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2 transition-all duration-300">
                        {project.description}
                      </p>

                      <div className="flex items-center gap-1 text-[10px] text-gold-400 font-mono tracking-widest font-semibold uppercase group-hover:underline mt-2">
                        View Project Dossier
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}

      </div>

      {/* Cinematic Fullscreen Project Dossier Drawer / Lightbox */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-50 overflow-y-auto" id="gallery-dossier-overlay">
            {/* Dark glass cover */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
              className="fixed inset-0 bg-charcoal/50 backdrop-blur-md"
            />

            <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12">
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.98 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="relative bg-warmwhite max-w-5xl w-full border border-charcoal/15 shadow-2xl overflow-hidden flex flex-col md:flex-row"
                style={{ contentVisibility: 'auto' }}
                id="gallery-dossier-panel"
              >
                {/* Close toggle button */}
                <button
                  onClick={() => setSelectedProject(null)}
                  className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-charcoal/90 text-warmwhite hover:bg-gold-500 hover:text-charcoal transition-all duration-300 cursor-pointer shadow-lg"
                  aria-label="Close dossier"
                  id="close-dossier-btn"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>

                {/* Left side: Pure cinematic presentation with slide controllers */}
                <div className="w-full md:w-1/2 relative bg-charcoal aspect-[4/3] md:aspect-auto min-h-[300px] md:min-h-[550px] group/slider">
                  <ProgressiveImage
                    src={selectedProject.image}
                    alt={selectedProject.title}
                    className="w-full h-full"
                    referrerPolicy="no-referrer"
                    id="dossier-img"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 to-transparent z-10" />
                  
                  {/* Next / Prev slide buttons inside the image wrapper */}
                  {filteredProjects.length > 1 && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); handlePrevProject(); }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-charcoal/60 hover:bg-gold-500 text-warmwhite hover:text-charcoal transition-all cursor-pointer opacity-0 group-hover/slider:opacity-100"
                        title="Previous Project"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleNextProject(); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-charcoal/60 hover:bg-gold-500 text-warmwhite hover:text-charcoal transition-all cursor-pointer opacity-0 group-hover/slider:opacity-100"
                        title="Next Project"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {/* Floating specs badge */}
                  <div className="absolute bottom-6 left-6 z-10" id="dossier-geo">
                    <span className="font-mono text-[9px] tracking-widest uppercase text-gold-400 font-semibold block mb-1">
                      PROJECT CASE STUDY
                    </span>
                    <h4 className="font-serif text-2xl font-bold text-white tracking-tight">
                      {selectedProject.title}
                    </h4>
                  </div>
                </div>

                {/* Right side: Architectural Dossier Specifications */}
                <div className="w-full md:w-1/2 p-6 sm:p-10 flex flex-col justify-between bg-warmwhite" id="dossier-details-block">
                  <div>
                    <div className="flex items-center gap-2 mb-4 border-b border-charcoal/5 pb-4">
                      <span className="font-mono text-[10px] tracking-widest text-gold-600 font-bold uppercase">
                        {selectedProject.room || selectedProject.category} SPECIAL
                      </span>
                      <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
                      <span className="font-mono text-[10px] text-charcoal/40 uppercase tracking-widest">
                        DOSSIER CODE: CL-{selectedProject.id}
                      </span>
                    </div>

                    <h3 className="font-serif text-3xl font-bold text-charcoal tracking-tight mb-4 leading-tight">
                      {selectedProject.subtitle}
                    </h3>

                    <p className="font-sans text-xs sm:text-sm text-charcoal/70 leading-relaxed mb-8">
                      {selectedProject.description}
                    </p>

                    {/* Metadata specs table */}
                    <div className="grid grid-cols-2 gap-4 mb-8" id="dossier-metadata-table">
                      <div className="p-4 bg-charcoal/5 border border-charcoal/5">
                        <div className="flex items-center gap-1.5 text-charcoal/50 font-sans text-xs mb-1">
                          <Compass className="w-3.5 h-3.5 text-gold-600" />
                          <span>Spatial Location</span>
                        </div>
                        <span className="font-serif text-[13px] font-semibold text-charcoal block">{selectedProject.location}</span>
                      </div>

                      <div className="p-4 bg-charcoal/5 border border-charcoal/5">
                        <div className="flex items-center gap-1.5 text-charcoal/50 font-sans text-xs mb-1">
                          <Sparkles className="w-3.5 h-3.5 text-gold-600" />
                          <span>Scale / Sizing</span>
                        </div>
                        <span className="font-serif text-[13px] font-semibold text-charcoal block">{selectedProject.size}</span>
                      </div>

                      <div className="p-4 bg-charcoal/5 border border-charcoal/5">
                        <div className="flex items-center gap-1.5 text-charcoal/50 font-sans text-xs mb-1">
                          <Calendar className="w-3.5 h-3.5 text-gold-600" />
                          <span>Installation Year</span>
                        </div>
                        <span className="font-serif text-[13px] font-semibold text-charcoal block">{selectedProject.year}</span>
                      </div>

                      <div className="p-4 bg-charcoal/5 border border-charcoal/5">
                        <div className="flex items-center gap-1.5 text-charcoal/50 font-sans text-xs mb-1">
                          <Shield className="w-3.5 h-3.5 text-gold-600" />
                          <span>Warranty Tag</span>
                        </div>
                        <span className="font-serif text-[13px] font-semibold text-charcoal block">Lifetime Structural</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="pt-6 border-t border-charcoal/5 flex flex-col sm:flex-row items-center gap-3" id="dossier-action-buttons">
                    <button
                      onClick={() => {
                        setSelectedProject(null);
                        // Navigate to contact booking
                        const element = document.getElementById('booking');
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="w-full sm:w-auto px-6 py-3.5 bg-charcoal text-warmwhite font-sans text-xs tracking-widest uppercase font-semibold hover:bg-gold-500 hover:text-charcoal hover:border-gold-500 transition-all duration-300 text-center cursor-pointer"
                      id="dossier-inquire-btn"
                    >
                      Inquire About This Look
                    </button>
                    
                    <button
                      onClick={() => setSelectedProject(null)}
                      className="w-full sm:w-auto px-6 py-3.5 bg-transparent border border-charcoal/20 text-charcoal font-sans text-xs tracking-widest uppercase font-semibold hover:border-gold-500 hover:text-gold-600 transition-all duration-300 text-center cursor-pointer"
                      id="dossier-return-btn"
                    >
                      Return to Showcase
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
