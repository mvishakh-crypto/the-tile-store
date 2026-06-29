import { X, Filter, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdvancedFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFilters: {
    brands: string[];
    sizes: string[];
    colors: string[];
    finishes: string[];
    prices: string[];
    usages: string[];
    antiSkid: boolean | null;
    styles: string[];
    indoorOutdoors: string[];
    textures: string[];
    materials: string[];
  };
  onFilterChange: (filters: any) => void;
  onReset: () => void;
  isInline?: boolean;
}

export default function AdvancedFilterDrawer({
  isOpen,
  onClose,
  selectedFilters,
  onFilterChange,
  onReset,
  isInline = false
}: AdvancedFilterDrawerProps) {
  const brandsList = ['Kajaria', 'Somany', 'Johnson & Johnson Tiles', 'Simpolo Ceramics', 'Orientbell', 'Hindware Italian'];
  const sizesList = ['1200 x 2400 mm', '800 x 1600 mm', '100 x 100 mm', '1200 x 1200 mm', '200 x 1200 mm', '1600 x 3200 mm', '600 x 1200 mm', '300 x 900 mm', '1200 x 2800 mm', '800 x 800 mm', '1000 x 1000 mm', '75 x 300 mm', '200 x 230 mm', '400 x 400 mm', '150 x 600 mm'];
  const colorsList = ['White', 'Black', 'Beige', 'Green', 'Brown', 'Grey', 'Orange', 'Blue'];
  const finishesList = ['High-Gloss', 'Matte', 'Structured', 'Lappato', 'Satin'];
  const pricesList = ['Signature', 'Premium', 'Reserve'];
  const usagesList = ['Living Room', 'Bathroom', 'Kitchen', 'Outdoor', 'Bedroom', 'Office', 'Facade', 'Lobby', 'Kitchen Backsplash', 'Kitchen Counter'];
  
  const stylesList = ['Modern', 'Classic', 'Minimalist', 'Industrial', 'Rustic'];
  const indoorOutdoorList = [
    { label: 'Indoor', value: 'indoor' },
    { label: 'Outdoor', value: 'outdoor' },
    { label: 'Both', value: 'both' }
  ];
  const texturesList = ['Smooth', 'Veined', 'Textured', 'Artisanal'];
  const materialsList = ['Sintered', 'Porcelain', 'Ceramic', 'Vitrified', 'Quartzite'];

  const toggleFilter = (key: string, value: string) => {
    const currentList = (selectedFilters as any)[key] as string[] || [];
    const newList = currentList.includes(value)
      ? currentList.filter(item => item !== value)
      : [...currentList, value];
    
    onFilterChange({
      ...selectedFilters,
      [key]: newList
    });
  };

  const handleAntiSkidToggle = (value: boolean | null) => {
    onFilterChange({
      ...selectedFilters,
      antiSkid: value
    });
  };

  const content = (
    <div className={`flex flex-col h-full bg-warmwhite ${isInline ? 'border border-charcoal/10 p-6' : ''}`} id="filter-panel-inner">
      {/* Header (Drawer only) */}
      {!isInline && (
        <div className="p-6 border-b border-charcoal/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gold-600" />
            <span className="font-serif text-lg font-bold text-charcoal tracking-wide uppercase">
              Advanced Filters
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onReset}
              className="font-mono text-[9px] tracking-widest uppercase text-charcoal/40 hover:text-gold-600 transition-colors flex items-center gap-1 cursor-pointer"
              title="Reset all filters"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
            <button
              onClick={onClose}
              className="p-1.5 bg-charcoal/5 border border-charcoal/5 hover:border-gold-500 transition-colors rounded-none cursor-pointer"
              aria-label="Close filters"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header (Inline only) */}
      {isInline && (
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-charcoal/10">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gold-600" />
            <span className="font-mono text-[10px] tracking-widest uppercase text-charcoal font-bold">
              Filter Archive
            </span>
          </div>
          <button
            onClick={onReset}
            className="font-mono text-[9px] tracking-widest uppercase text-charcoal/40 hover:text-gold-600 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>
      )}

      {/* Scrollable Filters Body */}
      <div className={`flex-1 overflow-y-auto space-y-6 no-scrollbar ${isInline ? 'pr-1' : 'p-6'}`} id="filter-drawer-body">
        {/* Brand Filter */}
        <div>
          <h4 className="font-mono text-[9px] tracking-[0.25em] uppercase text-gold-600 font-bold mb-2.5">
            BRANDS
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {brandsList.map(brand => {
              const isSelected = selectedFilters.brands.includes(brand);
              return (
                <button
                  key={brand}
                  onClick={() => toggleFilter('brands', brand)}
                  className={`px-2.5 py-1.5 font-sans text-[10px] tracking-wider uppercase border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-charcoal border-charcoal text-warmwhite font-semibold'
                      : 'bg-white border-charcoal/5 text-charcoal/60 hover:border-gold-300'
                  }`}
                >
                  {brand.replace(' Tiles', '').replace(' Ceramics', '').replace(' Italian', '')}
                </button>
              );
            })}
          </div>
        </div>

        {/* Style Filter */}
        <div>
          <h4 className="font-mono text-[9px] tracking-[0.25em] uppercase text-gold-600 font-bold mb-2.5">
            DESIGN STYLE
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {stylesList.map(style => {
              const isSelected = selectedFilters.styles?.includes(style);
              return (
                <button
                  key={style}
                  onClick={() => toggleFilter('styles', style)}
                  className={`px-2.5 py-1.5 font-sans text-[10px] tracking-wider uppercase border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-charcoal border-charcoal text-warmwhite font-semibold'
                      : 'bg-white border-charcoal/5 text-charcoal/60 hover:border-gold-300'
                  }`}
                >
                  {style}
                </button>
              );
            })}
          </div>
        </div>

        {/* Texture Category */}
        <div>
          <h4 className="font-mono text-[9px] tracking-[0.25em] uppercase text-gold-600 font-bold mb-2.5">
            SURFACE TEXTURE
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {texturesList.map(texture => {
              const isSelected = selectedFilters.textures?.includes(texture);
              return (
                <button
                  key={texture}
                  onClick={() => toggleFilter('textures', texture)}
                  className={`px-2.5 py-1.5 font-sans text-[10px] tracking-wider uppercase border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-charcoal border-charcoal text-warmwhite font-semibold'
                      : 'bg-white border-charcoal/5 text-charcoal/60 hover:border-gold-300'
                  }`}
                >
                  {texture}
                </button>
              );
            })}
          </div>
        </div>

        {/* Material Category */}
        <div>
          <h4 className="font-mono text-[9px] tracking-[0.25em] uppercase text-gold-600 font-bold mb-2.5">
            BASE MATERIAL
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {materialsList.map(material => {
              const isSelected = selectedFilters.materials?.includes(material);
              return (
                <button
                  key={material}
                  onClick={() => toggleFilter('materials', material)}
                  className={`px-2.5 py-1.5 font-sans text-[10px] tracking-wider uppercase border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-charcoal border-charcoal text-warmwhite font-semibold'
                      : 'bg-white border-charcoal/5 text-charcoal/60 hover:border-gold-300'
                  }`}
                >
                  {material}
                </button>
              );
            })}
          </div>
        </div>

        {/* Indoor/Outdoor */}
        <div>
          <h4 className="font-mono text-[9px] tracking-[0.25em] uppercase text-gold-600 font-bold mb-2.5">
            ENVIRONMENT COMPATIBILITY
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {indoorOutdoorList.map(io => {
              const isSelected = selectedFilters.indoorOutdoors?.includes(io.value);
              return (
                <button
                  key={io.value}
                  onClick={() => toggleFilter('indoorOutdoors', io.value)}
                  className={`px-2.5 py-1.5 font-sans text-[10px] tracking-wider uppercase border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-charcoal border-charcoal text-warmwhite font-semibold'
                      : 'bg-white border-charcoal/5 text-charcoal/60 hover:border-gold-300'
                  }`}
                >
                  {io.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Price Tier */}
        <div>
          <h4 className="font-mono text-[9px] tracking-[0.25em] uppercase text-gold-600 font-bold mb-2.5">
            PRICE CLASSIFICATION
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {pricesList.map(price => {
              const isSelected = selectedFilters.prices.includes(price);
              return (
                <button
                  key={price}
                  onClick={() => toggleFilter('prices', price)}
                  className={`px-2.5 py-1.5 font-sans text-[10px] tracking-wider uppercase border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-charcoal border-charcoal text-warmwhite font-semibold'
                      : 'bg-white border-charcoal/5 text-charcoal/60 hover:border-gold-300'
                  }`}
                >
                  {price}
                </button>
              );
            })}
          </div>
        </div>

        {/* Colors Filter */}
        <div>
          <h4 className="font-mono text-[9px] tracking-[0.25em] uppercase text-gold-600 font-bold mb-2.5">
            SURFACE COLOR
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {colorsList.map(color => {
              const isSelected = selectedFilters.colors.includes(color);
              return (
                <button
                  key={color}
                  onClick={() => toggleFilter('colors', color)}
                  className={`px-2.5 py-1.5 font-sans text-[10px] tracking-wider uppercase border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-charcoal border-charcoal text-warmwhite font-semibold'
                      : 'bg-white border-charcoal/5 text-charcoal/60 hover:border-gold-300'
                  }`}
                >
                  {color}
                </button>
              );
            })}
          </div>
        </div>

        {/* Finish Type */}
        <div>
          <h4 className="font-mono text-[9px] tracking-[0.25em] uppercase text-gold-600 font-bold mb-2.5">
            SURFACE GLAZE & FINISH
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {finishesList.map(finish => {
              const isSelected = selectedFilters.finishes.includes(finish);
              return (
                <button
                  key={finish}
                  onClick={() => toggleFilter('finishes', finish)}
                  className={`px-2.5 py-1.5 font-sans text-[10px] tracking-wider uppercase border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-charcoal border-charcoal text-warmwhite font-semibold'
                      : 'bg-white border-charcoal/5 text-charcoal/60 hover:border-gold-300'
                  }`}
                >
                  {finish}
                </button>
              );
            })}
          </div>
        </div>

        {/* Anti Skid rating */}
        <div>
          <h4 className="font-mono text-[9px] tracking-[0.25em] uppercase text-gold-600 font-bold mb-2.5">
            SLIP RESISTANCE (ANTI-SKID)
          </h4>
          <div className="flex gap-2">
            <button
              onClick={() => handleAntiSkidToggle(selectedFilters.antiSkid === true ? null : true)}
              className={`px-3 py-1.5 font-sans text-[10px] tracking-wider uppercase border transition-all duration-200 cursor-pointer ${
                selectedFilters.antiSkid === true
                  ? 'bg-charcoal border-charcoal text-warmwhite font-semibold'
                  : 'bg-white border-charcoal/5 text-charcoal/60 hover:border-gold-300'
              }`}
            >
              Required (R11)
            </button>
            <button
              onClick={() => handleAntiSkidToggle(selectedFilters.antiSkid === false ? null : false)}
              className={`px-3 py-1.5 font-sans text-[10px] tracking-wider uppercase border transition-all duration-200 cursor-pointer ${
                selectedFilters.antiSkid === false
                  ? 'bg-charcoal border-charcoal text-warmwhite font-semibold'
                  : 'bg-white border-charcoal/5 text-charcoal/60 hover:border-gold-300'
              }`}
            >
              Standard Glaze
            </button>
          </div>
        </div>

        {/* Usage Areas */}
        <div>
          <h4 className="font-mono text-[9px] tracking-[0.25em] uppercase text-gold-600 font-bold mb-2.5">
            USAGE AREA
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {usagesList.map(usage => {
              const isSelected = selectedFilters.usages.includes(usage);
              return (
                <button
                  key={usage}
                  onClick={() => toggleFilter('usages', usage)}
                  className={`px-2.5 py-1.5 font-sans text-[10px] tracking-wider uppercase border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-charcoal border-charcoal text-warmwhite font-semibold'
                      : 'bg-white border-charcoal/5 text-charcoal/60 hover:border-gold-300'
                  }`}
                >
                  {usage}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dimensions */}
        <div>
          <h4 className="font-mono text-[9px] tracking-[0.25em] uppercase text-gold-600 font-bold mb-2.5">
            MODULAR SIZES
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {sizesList.map(size => {
              const isSelected = selectedFilters.sizes.includes(size);
              return (
                <button
                  key={size}
                  onClick={() => toggleFilter('sizes', size)}
                  className={`px-2.5 py-1.5 font-sans text-[10px] tracking-wider uppercase border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-charcoal border-charcoal text-warmwhite font-semibold'
                      : 'bg-white border-charcoal/5 text-charcoal/60 hover:border-gold-300'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer (Drawer only) */}
      {!isInline && (
        <div className="p-6 border-t border-charcoal/10 bg-ivory flex gap-3 shrink-0">
          <button
            onClick={onReset}
            className="flex-1 py-3 border border-charcoal/15 hover:border-charcoal hover:bg-white text-charcoal transition-all duration-300 font-sans text-[10px] tracking-widest uppercase font-semibold cursor-pointer"
          >
            Clear All
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-charcoal text-warmwhite border border-charcoal hover:bg-gold-500 hover:text-charcoal hover:border-gold-500 transition-all duration-300 font-sans text-[10px] tracking-widest uppercase font-bold cursor-pointer shadow-lg"
          >
            Apply Filters
          </button>
        </div>
      )}
    </div>
  );

  if (isInline) {
    return content;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end" id="filter-drawer-wrapper">
          {/* Backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={onClose}
            className="fixed inset-0 bg-charcoal/30 backdrop-blur-sm cursor-pointer"
            id="filter-drawer-backdrop"
          />

          {/* Drawer Container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative w-full max-w-md bg-warmwhite border-l border-charcoal/10 h-full flex flex-col shadow-2xl z-10"
            id="filter-drawer-panel"
          >
            {content}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
