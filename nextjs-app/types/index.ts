export interface TileProduct {
  id: string;
  name: string;
  code: string;
  category: 'floor' | 'wall' | 'bathroom' | 'kitchen' | 'outdoor' | 'wood' | 'marble' | 'elevation';
  material: string;
  finish: 'Polished' | 'Matte' | 'Satin' | 'High-Gloss' | 'Structured' | 'Lappato';
  size: string;
  origin: string;
  priceCategory: 'Signature' | 'Premium' | 'Reserve';
  image: string; // Detail snapshot
  overlayImage?: string; // Larger high-res view or seamless textures if needed
  description: string;
  features: string[];
  color?: string;
  texture?: string;
  antiSkid?: boolean;
  usageArea?: string[];
  shape?: string;
  thickness?: string;
  waterAbsorption?: string;
  brand?: string;
  style?: 'Modern' | 'Classic' | 'Minimalist' | 'Industrial' | 'Rustic';
  indoorOutdoor?: 'indoor' | 'outdoor' | 'both';
  textureCategory?: 'Smooth' | 'Veined' | 'Textured' | 'Artisanal';
  clipEmbedding?: number[];
  latest?: boolean;
  popularityScore?: number;
  slug?: string;
  inStock?: boolean;
}

export interface SpaceOption {
  id: string;
  name: string;
  type: 'living' | 'kitchen' | 'bathroom' | 'lounge' | 'outdoor' | 'commercial' | 'facade';
  baseImage: string; // High-end room shot
  maskClass?: string; // For layout rendering styles
  defaultTileId: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Villas' | 'Penthouses' | 'Commercial' | 'Wellness' | 'Heritage';
  image: string;
  location: string;
  size: string;
  year: string;
  description: string;
  room?: 'Bathroom' | 'Kitchen' | 'Living room' | 'Outdoor' | 'Commercial' | 'Luxury villas';
  style?: 'Modern' | 'Rustic' | 'Classic';
}

export interface TestimonialItem {
  id: string;
  clientName: string;
  role: string;
  company: string;
  quote: string;
  rating: number;
  avatar: string;
  projectType: string;
}

export interface BrandItem {
  id: string;
  name: string;
  image: string;
  description: string;
  highlights: string[];
}
