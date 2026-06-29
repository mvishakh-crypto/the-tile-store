-- ============================================================
-- THE TILE STORE — Seed Data
-- Migration: 004_seed_data.sql
-- Seeds all 20 existing tile products, 6 brands, testimonials,
-- galleries, and blog categories
-- ============================================================

-- ============================================================
-- BRANDS
-- ============================================================
INSERT INTO brands (id, name, slug, image_url, description, highlights, country) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'Kajaria', 'kajaria',
   'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=300&h=150&q=80',
   'India''s No. 1 ceramic and vitrified tile manufacturer, renowned for avant-garde designs, global standards, and immaculate glazing craftsmanship.',
   ARRAY['Vitrified Splendor', 'Nanotech Polishing', 'Zero Water Absorption'],
   'India'),

  ('b2000000-0000-0000-0000-000000000002', 'Somany', 'somany',
   'https://images.unsplash.com/photo-1550684847-75bdda21cc95?auto=format&fit=crop&w=300&h=150&q=80',
   'A global leader in design innovation, offering patented Slip-Shield tech, high-end marble slabs, and avant-garde architectural surfaces.',
   ARRAY['Patented Slip-Shield', 'Italian Glazes', 'Eco-Sustainable Slabs'],
   'India'),

  ('b3000000-0000-0000-0000-000000000003', 'Johnson & Johnson Tiles', 'johnson-johnson-tiles',
   'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=300&h=150&q=80',
   'With over 60 years of heritage, delivering pristine sanitaryware, heavy-duty industrial vitrified surfaces, and fine porcelain art.',
   ARRAY['60+ Years Heritage', 'Anti-Microbial Germ-Free', 'High Modulus Strength'],
   'India'),

  ('b4000000-0000-0000-0000-000000000004', 'Simpolo Ceramics', 'simpolo-ceramics',
   'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=300&h=150&q=80',
   'An elite luxury brand representing ultra-slim sintered stone slabs, elegant large format designs, and modern European aesthetics.',
   ARRAY['Sintered Stone Tech', 'Ultra-Slim Slabs (15mm)', 'European Certifications'],
   'India'),

  ('b5000000-0000-0000-0000-000000000005', 'Orientbell', 'orientbell',
   'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=300&h=150&q=80',
   'Pioneers of digital design visualization, delivering specialized diagnostic anti-static tiles, cooling roofs, and high-gloss vitrified collection.',
   ARRAY['Cool Roof Surface', 'Anti-Static Protection', 'Digital Print Precision'],
   'India'),

  ('b6000000-0000-0000-0000-000000000006', 'Hindware Italian', 'hindware-italian',
   'https://images.unsplash.com/photo-1542744095-291853a069FC?auto=format&fit=crop&w=300&h=150&q=80',
   'Sophisticated architectural collection blending structural engineering with refined Italian motifs, high-density porcelain, and gold glaze overlay.',
   ARRAY['Italian Styling', 'Superior Load Distribution', 'High-Density Composition'],
   'India');

-- ============================================================
-- PRODUCT CATEGORIES
-- ============================================================
INSERT INTO product_categories (id, name, slug, sort_order) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Marble Slabs', 'marble', 1),
  ('c2000000-0000-0000-0000-000000000002', 'Floor Tiles', 'floor', 2),
  ('c3000000-0000-0000-0000-000000000003', 'Wall Tiles', 'wall', 3),
  ('c4000000-0000-0000-0000-000000000004', 'Bathroom', 'bathroom', 4),
  ('c5000000-0000-0000-0000-000000000005', 'Kitchen', 'kitchen', 5),
  ('c6000000-0000-0000-0000-000000000006', 'Outdoor', 'outdoor', 6),
  ('c7000000-0000-0000-0000-000000000007', 'Wood Replicate', 'wood', 7),
  ('c8000000-0000-0000-0000-000000000008', 'Elevation & Facade', 'elevation', 8);

-- ============================================================
-- PRODUCTS (all 20 existing tiles)
-- ============================================================
INSERT INTO products (
  id, name, code, slug, category_id, material, finish, size, origin,
  price_category, description, features, color, texture, anti_skid,
  usage_areas, shape, thickness, water_absorption, brand_id,
  style, indoor_outdoor, texture_category, latest, popularity_score, in_stock
) VALUES

  -- t1: Statuario Imperial Gold
  ('t1000000-0000-0000-0000-000000000001',
   'Statuario Imperial Gold', 'TS-SL-0129', 'statuario-imperial-gold',
   'c1000000-0000-0000-0000-000000000001',
   'Full-Body Sintered Vitrified', 'High-Gloss', '1200 x 2400 mm', 'Carrara Region, Italy',
   'Signature',
   'A masterpiece of geological design, replicating the rare Statuario marble. Bold, charcoal veins are illuminated by spectacular flecks of dynamic gold underlight, radiating rich architectural luxury.',
   ARRAY['High scratch-resistance', 'Acid & stain repellent', 'Seamless joint booking', 'Bookmatch layout ready'],
   'White', 'Veined', FALSE,
   ARRAY['Living Room', 'Bathroom', 'Kitchen'],
   'Rectangle', '15mm', '0.02%',
   'b1000000-0000-0000-0000-000000000001',
   'Classic', 'indoor', 'Veined', TRUE, 98, TRUE),

  -- t2: Nero Laurent Matte
  ('t2000000-0000-0000-0000-000000000002',
   'Nero Laurent Matte', 'TS-SL-8841', 'nero-laurent-matte',
   'c2000000-0000-0000-0000-000000000002',
   'Vitrified Glazed Porcelain', 'Matte', '800 x 1600 mm', 'Castellón, Spain',
   'Premium',
   'A deep, silent matte black surface cut by sharp, geometric white and bronze structural lines. Creates a majestic modern foundation for luxury living zones and minimalist high-end lounges.',
   ARRAY['Ultra-matte non-slip surface', 'Resistant to deep abrasion', 'Zero light reflection', 'Premium raw mineral feel'],
   'Black', 'Veined', TRUE,
   ARRAY['Living Room', 'Office', 'Lobby'],
   'Rectangle', '12mm', '0.05%',
   'b2000000-0000-0000-0000-000000000002',
   'Modern', 'both', 'Veined', FALSE, 92, TRUE),

  -- t3: Moroccan Emerald Zellige
  ('t3000000-0000-0000-0000-000000000003',
   'Moroccan Emerald Zellige', 'TS-WL-4424', 'moroccan-emerald-zellige',
   'c3000000-0000-0000-0000-000000000003',
   'Double-Fired Ceramic Art', 'Structured', '100 x 100 mm', 'Fez, Morocco',
   'Reserve',
   'An artisanal luxury wall tile. The undulating structured surfaces capture natural light, reflecting an oceanic spectrum of deep emeralds, forest greens, and glassy mint hues.',
   ARRAY['Unique organic edge', 'Vibrant light refraction', 'Handcrafted tile texture', 'V3 high color variation'],
   'Green', 'Glossy Undulating', FALSE,
   ARRAY['Kitchen Backsplash', 'Bathroom Wall'],
   'Square', '8mm', '10%',
   'b3000000-0000-0000-0000-000000000003',
   'Rustic', 'indoor', 'Artisanal', TRUE, 89, TRUE),

  -- t4: Onyx Pearl Lumina
  ('t4000000-0000-0000-0000-000000000004',
   'Onyx Pearl Lumina', 'TS-SL-0155', 'onyx-pearl-lumina',
   'c4000000-0000-0000-0000-000000000004',
   'Onyx Vitrified Porcelain', 'Lappato', '1200 x 1200 mm', 'Karaman, Turkey',
   'Signature',
   'Recreating the semi-translucent properties of pure Persian Onyx. Soft, undulating waves of alabaster, warm cream, and crystalline pearl breathe light and timeless serenity into master bathrooms.',
   ARRAY['Mild mirror polish (Lappato)', 'Vitreous high density', 'Hypoallergenic raw body', 'Backlight-mimic layer'],
   'Beige', 'Translucent Wave', FALSE,
   ARRAY['Bathroom', 'Living Room'],
   'Square', '10mm', '0.03%',
   'b4000000-0000-0000-0000-000000000004',
   'Minimalist', 'indoor', 'Smooth', FALSE, 95, TRUE),

  -- t5: Smoked Rovere Walnut
  ('t5000000-0000-0000-0000-000000000005',
   'Smoked Rovere Walnut', 'TS-WD-7711', 'smoked-rovere-walnut',
   'c7000000-0000-0000-0000-000000000007',
   'Extruded Porcelain Plank', 'Structured', '200 x 1200 mm', 'Black Forest, Germany',
   'Premium',
   'Premium wood replicate capturing the organic texture, rugged knots, and tactile warmth of ancient smoked German oak, matched with the bulletproof durability of high-density porcelain.',
   ARRAY['RealGrain™ tactile texture', 'Moisture & warp immunity', 'Underfloor heating compatible', 'Fade-proof under UV'],
   'Brown', 'Wood Grain', TRUE,
   ARRAY['Living Room', 'Bedroom', 'Balcony'],
   'Plank', '10mm', '0.1%',
   'b5000000-0000-0000-0000-000000000005',
   'Rustic', 'both', 'Textured', FALSE, 84, TRUE),

  -- t6: Statuario Borghini Satin
  ('t6000000-0000-0000-0000-000000000006',
   'Statuario Borghini Satin', 'TS-K-8120', 'statuario-borghini-satin',
   'c5000000-0000-0000-0000-000000000005',
   'Sintered Stone Countertop', 'Satin', '1600 x 3200 mm', 'Apuan Alps, Italy',
   'Signature',
   'An architectural titan engineered specifically for luxury kitchen islands and heavy-duty splashbacks. Features a buttery satin texture with broad, theatrical grey ribbons and warm quartz highlights.',
   ARRAY['Food-grade hygienic surface', 'Thermal shock barrier (up to 900°C)', 'Stain-resistant non-porous', 'Bookmatched slab system'],
   'White', 'Satin Smooth', FALSE,
   ARRAY['Kitchen Counter', 'Tabletop'],
   'Slab', '15mm', '0.01%',
   'b4000000-0000-0000-0000-000000000004',
   'Modern', 'indoor', 'Smooth', TRUE, 97, TRUE),

  -- t7: Silver Travertine Grigio
  ('t7000000-0000-0000-0000-000000000007',
   'Silver Travertine Grigio', 'TS-OT-5591', 'silver-travertine-grigio',
   'c6000000-0000-0000-0000-000000000006',
   'Rough-Hewn Quartzite Vitrified', 'Structured', '600 x 1200 mm', 'Tivoli, Italy',
   'Premium',
   'Robust, structural exterior cladding with a rich, mineral-striped horizontal grain. Simulates natural petrified travertine with organic pore depressions, optimized for outdoor decks, patios, and pools.',
   ARRAY['R11 non-slip certification', 'Frost & salt crystallization immunity', 'High break-load strength (2000N)', 'Algae-resistant glaze'],
   'Grey', 'Travertine Striated', TRUE,
   ARRAY['Outdoor Deck', 'Poolside', 'Cladding'],
   'Rectangle', '20mm', '0.08%',
   'b1000000-0000-0000-0000-000000000001',
   'Industrial', 'outdoor', 'Textured', FALSE, 91, TRUE),

  -- t8: Chambord Fluted Basalt
  ('t8000000-0000-0000-0000-000000000008',
   'Chambord Fluted Basalt', 'TS-EL-2290', 'chambord-fluted-basalt',
   'c8000000-0000-0000-0000-000000000008',
   'Sculpted Ceramic Facade', 'Structured', '300 x 900 mm', 'Auvergne-Rhône-Alpes, France',
   'Reserve',
   'Sculptural fluted architectural columns designed for exterior frontages and fireplace highlights. Instantly generates dramatic play of vertical light and deep architectural shadows.',
   ARRAY['Fluted sculptural relief', 'Self-cleaning coating', 'Weatherproof thermal barrier', 'Interlocking alignment system'],
   'Black', 'Fluted Relief', FALSE,
   ARRAY['Facade Cladding', 'Feature Wall'],
   'Rectangle', '18mm', '0.5%',
   'b6000000-0000-0000-0000-000000000006',
   'Industrial', 'outdoor', 'Textured', TRUE, 78, TRUE),

  -- t9: Calacatta Oro Polished
  ('t9000000-0000-0000-0000-000000000009',
   'Calacatta Oro Polished', 'TS-SL-0391', 'calacatta-oro-polished',
   'c1000000-0000-0000-0000-000000000001',
   'Vitrified Sinter Slabs', 'High-Gloss', '1200 x 2800 mm', 'Massa-Carrara, Italy',
   'Signature',
   'Exclusive marble texture combining crisp, alabaster white backdrops with premium linear gold veins and subtle shadows. Perfect for vertical bookmatching in massive lobbies.',
   ARRAY['Extraordinary light reflectivity (95%+)', 'Extremely low porosity (<0.05%)', 'Resistant to impact', 'Endless joint consistency'],
   'White', 'Veined', FALSE,
   ARRAY['Lobby', 'Living Room', 'Wall'],
   'Slab', '15mm', '0.02%',
   'b6000000-0000-0000-0000-000000000006',
   'Classic', 'indoor', 'Veined', FALSE, 93, TRUE),

  -- t10: Venetian Ivory Terrazzo
  ('t10a0000-0000-0000-0000-000000000010',
   'Venetian Ivory Terrazzo', 'TS-SL-0453', 'venetian-ivory-terrazzo',
   'c2000000-0000-0000-0000-000000000002',
   'Recycled Vitrified Composite', 'Satin', '800 x 800 mm', 'Veneto, Italy',
   'Premium',
   'A classic Venetian mosaic style updated for modern luxury. Suspends beautiful large chips of crystalline marble and warm amber glass inside an ultra-smooth silk-soft warm ivory concrete matrix.',
   ARRAY['High architectural durability', 'Silky satin touch', 'Eco-friendly product', 'Anti-stain nanotechnology'],
   'Beige', 'Terrazzo Flakes', FALSE,
   ARRAY['Living Room', 'Kitchen', 'Cafe'],
   'Square', '12mm', '0.04%',
   'b2000000-0000-0000-0000-000000000002',
   'Minimalist', 'indoor', 'Artisanal', TRUE, 86, TRUE),

  -- t11: Armani Charcoal Gold Slab
  ('t11b0000-0000-0000-0000-000000000011',
   'Armani Charcoal Gold Slab', 'TS-SL-0914', 'armani-charcoal-gold-slab',
   'c1000000-0000-0000-0000-000000000001',
   'Vitrified Sinter Slabs', 'High-Gloss', '1200 x 2400 mm', 'Apuan Alps, Italy',
   'Signature',
   'Deep, dramatic slate-charcoal background decorated with gorgeous flowing rivers of active amber-gold. A breathtaking feature wall choice to create focal points in high-ceiling dining areas or premium lounges.',
   ARRAY['95%+ light reflectivity', 'Heat and thermal shock repellent', 'Bookmatch layout capable', 'Extremely low porosity'],
   'Black', 'Veined', FALSE,
   ARRAY['Feature Wall', 'Living Room'],
   'Rectangle', '15mm', '0.02%',
   'b2000000-0000-0000-0000-000000000002',
   'Modern', 'indoor', 'Veined', FALSE, 94, TRUE),

  -- t12: Vatican Ochre Subway
  ('t12c0000-0000-0000-0000-000000000012',
   'Vatican Ochre Subway', 'TS-WL-0311', 'vatican-ochre-subway',
   'c3000000-0000-0000-0000-000000000003',
   'Single-Fired Glazed Ceramic', 'Structured', '75 x 300 mm', 'Castellón, Spain',
   'Premium',
   'A classic handmade-style Spanish subway tile with organic, glassy crackle effects. Imparts timeless, vintage character for high-end kitchen backsplashes, vanity walls and bar borders.',
   ARRAY['Crackle glaze details', 'High-relief organic edging', 'Highly hygienic single-firing', 'V2 moderate color variation'],
   'Orange', 'Crackle Glaze', FALSE,
   ARRAY['Kitchen Backsplash', 'Bar Wall'],
   'Subway', '8mm', '8%',
   'b3000000-0000-0000-0000-000000000003',
   'Classic', 'indoor', 'Artisanal', FALSE, 82, TRUE),

  -- t13: Belgian Metallic Hexagon
  ('t13d0000-0000-0000-0000-000000000013',
   'Belgian Metallic Hexagon', 'TS-WL-4428', 'belgian-metallic-hexagon',
   'c3000000-0000-0000-0000-000000000003',
   'Double-Fired Ceramic Art', 'Structured', '200 x 230 mm', 'Flanders, Belgium',
   'Reserve',
   'Modern geometric hexagon tile utilizing subtle metallic luster glazes. Reflects beautiful natural light patterns, adding industrial-retro premium style to fireplace surrounds or wash basin highlights.',
   ARRAY['Sleek hexagon layout', 'Refined satin-lustre finish', 'Stain-resistant composition', 'Handcrafted organic touch'],
   'Black', 'Metallic Luster', FALSE,
   ARRAY['Feature Wall', 'Bathroom Wall'],
   'Hexagon', '9mm', '6%',
   'b5000000-0000-0000-0000-000000000005',
   'Industrial', 'indoor', 'Artisanal', TRUE, 87, TRUE),

  -- t14: Himalayan Teak Planks
  ('t14e0000-0000-0000-0000-000000000014',
   'Himalayan Teak Planks', 'TS-WD-7744', 'himalayan-teak-planks',
   'c7000000-0000-0000-0000-000000000007',
   'Vitrified Glazed wood-replicate', 'Matte', '200 x 1200 mm', 'Dehradun, India',
   'Premium',
   'Superb wood grain replication utilizing multi-depth 3D structural glazing. Evokes the warmth of premium mountain teakwood planks with zero risk of humidity swelling, scratching, or maintenance burden.',
   ARRAY['Scratch-resistant glaze', 'TrueWood™ textured tactile feel', 'Zero moisture absorption', 'Underfloor heating safe'],
   'Brown', 'Wood Grain', TRUE,
   ARRAY['Living Room', 'Bedroom', 'Kitchen'],
   'Plank', '10mm', '0.1%',
   'b1000000-0000-0000-0000-000000000001',
   'Rustic', 'both', 'Textured', FALSE, 83, TRUE),

  -- t15: Tuscan Cotto Terracotta
  ('t15f0000-0000-0000-0000-000000000015',
   'Tuscan Cotto Terracotta', 'TS-OT-9901', 'tuscan-cotto-terracotta',
   'c6000000-0000-0000-0000-000000000006',
   'Extruded Porcelain Terracotta', 'Structured', '400 x 400 mm', 'Tuscany, Italy',
   'Premium',
   'Warm, rustic cotto tiles replicating hand-pressed Tuscan clayware. High thermal properties and anti-slip structures make it exceptionally ideal for Kerala''s open verandas, courtyards, and sunlit patios.',
   ARRAY['High Slip-Resistance R12', 'Excellent thermal insulator', 'Frost & mold resistant', 'Natural earthy clay tone'],
   'Orange', 'Earthy Clay', TRUE,
   ARRAY['Outdoor Patio', 'Courtyard'],
   'Square', '15mm', '3%',
   'b3000000-0000-0000-0000-000000000003',
   'Rustic', 'outdoor', 'Textured', FALSE, 81, TRUE),

  -- t16: Crema Marfil Premium
  ('t16g0000-0000-0000-0000-000000000016',
   'Crema Marfil Premium', 'TS-SL-0341', 'crema-marfil-premium',
   'c2000000-0000-0000-0000-000000000002',
   'Vitrified Glazed Porcelain', 'Polished', '800 x 1600 mm', 'Alicante, Spain',
   'Premium',
   'The golden benchmark of architectural warmth. Creamy Spanish marble texture lined with soft calcite veins, providing a continuous, mirror-finished grand platform for premium home floorings.',
   ARRAY['Polished glassy finish (90%+)', 'Extremely low porosity', 'Scratch resistant coat', 'Acid & grease immune'],
   'Beige', 'Calcite Veins', FALSE,
   ARRAY['Living Room', 'Hotel Floor'],
   'Rectangle', '12mm', '0.03%',
   'b2000000-0000-0000-0000-000000000002',
   'Classic', 'indoor', 'Smooth', FALSE, 90, TRUE),

  -- t17: Dyna Royal Classic
  ('t17h0000-0000-0000-0000-000000000017',
   'Dyna Royal Classic', 'TS-SL-0178', 'dyna-royal-classic',
   'c2000000-0000-0000-0000-000000000002',
   'Full-Body Vitrified Slabs', 'High-Gloss', '1000 x 1000 mm', 'Brescia, Italy',
   'Premium',
   'A deeply beloved Italian classic characterized by parallel soft beige and amber veins. Infuses grand luxury and bright volumetric depth into massive living-dining spaces and high-traffic lobbies.',
   ARRAY['Nano-polished body', 'Stain-resistant nanoshield', 'Ultra-flat zero-grout look', 'Impact-absorption technology'],
   'Beige', 'Linear Wave', FALSE,
   ARRAY['Living Room', 'Lobby'],
   'Square', '12mm', '0.03%',
   'b1000000-0000-0000-0000-000000000001',
   'Classic', 'indoor', 'Veined', TRUE, 96, TRUE),

  -- t18: Onyx Royal Emerald Blue
  ('t18i0000-0000-0000-0000-000000000018',
   'Onyx Royal Emerald Blue', 'TS-SL-0994', 'onyx-royal-emerald-blue',
   'c4000000-0000-0000-0000-000000000004',
   'Vitrified Sintered Porcelain', 'Lappato', '1200 x 2400 mm', 'Karaman, Turkey',
   'Signature',
   'A design wonder mimicking luxurious translucent onyx stone. Swirling fields of royal turquoise-blue, ocean-teal, and soft quartz gold crystals create a magnificent architectural master bath wash zone.',
   ARRAY['Lappato semi-gloss finish', 'Backlight reflectance layer', 'Hygienic bacterial barrier', 'Anti-abrasive glaze'],
   'Blue', 'Translucent Onyx', FALSE,
   ARRAY['Bathroom Wall', 'Feature Wall'],
   'Slab', '15mm', '0.02%',
   'b4000000-0000-0000-0000-000000000004',
   'Modern', 'indoor', 'Veined', TRUE, 99, TRUE),

  -- t19: Porto Black Nero Sintered
  ('t19j0000-0000-0000-0000-000000000019',
   'Porto Black Nero Sintered', 'TS-K-8145', 'porto-black-nero-sintered',
   'c5000000-0000-0000-0000-000000000005',
   'Sintered Stone Countertop', 'Satin', '1600 x 3200 mm', 'Basque Country, Spain',
   'Signature',
   'Ultra-advanced black sintered countertop slabs streaked with dramatic white crystalline bolts. Completely flame-immune, chemical-proof, and certified non-porous for food preparation areas.',
   ARRAY['Food-contact safe certified', 'Zero heat deformation (900°C)', 'Stain & chemical proof', 'Scratch resistant surface'],
   'Black', 'Veined', FALSE,
   ARRAY['Kitchen Counter', 'Bathroom Wall'],
   'Slab', '15mm', '0.01%',
   'b6000000-0000-0000-0000-000000000006',
   'Minimalist', 'indoor', 'Smooth', FALSE, 91, TRUE),

  -- t20: Andesite Split-Face Ledger
  ('t20k0000-0000-0000-0000-000000000020',
   'Andesite Split-Face Ledger', 'TS-EL-2244', 'andesite-split-face-ledger',
   'c8000000-0000-0000-0000-000000000008',
   'Sculptured Quartzite Facade', 'Structured', '150 x 600 mm', 'Rajasthan, India',
   'Premium',
   'Hand-sculpted natural quartzite panels with alternating rugged projections. Adds strong structural presence and beautiful vertical shadows on exterior home elevations and compound entry walls.',
   ARRAY['Highly weatherproof grade', 'UV radiation guard', 'Simple interlocking structure', 'Natural mineral sheen'],
   'Grey', 'Ledger Stone', TRUE,
   ARRAY['Exterior Wall', 'Facade'],
   'Ledger', '25mm', '0.8%',
   'b5000000-0000-0000-0000-000000000005',
   'Industrial', 'outdoor', 'Textured', FALSE, 79, TRUE);

-- ============================================================
-- PRODUCT IMAGES (primary images for all 20 products)
-- ============================================================
INSERT INTO product_images (product_id, url, is_primary, sort_order) VALUES
  ('t1000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80', TRUE, 0),
  ('t2000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80', TRUE, 0),
  ('t3000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1523413651479-797eb2e2adac?auto=format&fit=crop&w=800&q=80', TRUE, 0),
  ('t4000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1501183007986-d0d080b147f9?auto=format&fit=crop&w=800&q=80', TRUE, 0),
  ('t5000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80', TRUE, 0),
  ('t6000000-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80', TRUE, 0),
  ('t7000000-0000-0000-0000-000000000007', 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=800&q=80', TRUE, 0),
  ('t8000000-0000-0000-0000-000000000008', 'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=800&q=80', TRUE, 0),
  ('t9000000-0000-0000-0000-000000000009', 'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=800&q=80', TRUE, 0),
  ('t10a0000-0000-0000-0000-000000000010', 'https://images.unsplash.com/photo-1590725121839-892b458a74ec?auto=format&fit=crop&w=800&q=80', TRUE, 0),
  ('t11b0000-0000-0000-0000-000000000011', 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80', TRUE, 0),
  ('t12c0000-0000-0000-0000-000000000012', 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=800&q=80', TRUE, 0),
  ('t13d0000-0000-0000-0000-000000000013', 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80', TRUE, 0),
  ('t14e0000-0000-0000-0000-000000000014', 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80', TRUE, 0),
  ('t15f0000-0000-0000-0000-000000000015', 'https://images.unsplash.com/photo-1621886292650-520f76c747d6?auto=format&fit=crop&w=800&q=80', TRUE, 0),
  ('t16g0000-0000-0000-0000-000000000016', 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=800&q=80', TRUE, 0),
  ('t17h0000-0000-0000-0000-000000000017', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80', TRUE, 0),
  ('t18i0000-0000-0000-0000-000000000018', 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80', TRUE, 0),
  ('t19j0000-0000-0000-0000-000000000019', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80', TRUE, 0),
  ('t20k0000-0000-0000-0000-000000000020', 'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?auto=format&fit=crop&w=800&q=80', TRUE, 0);

-- ============================================================
-- TESTIMONIALS
-- ============================================================
INSERT INTO testimonials (client_name, role, company, quote, rating, avatar_url, project_type, is_featured) VALUES
  ('Marcello Moretti', 'Principal Architect', 'Moretti & Partners, Milan',
   'The Tile Store has completely redefined how we source surfaces. Their raw sintered stone slabs deliver an unmatched purity, and the structural dimensional consistency allows us to execute flawless millimeter-perfect zero-joint spaces.',
   5, 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80',
   'Monaco Private Villa', TRUE),

  ('Aurelia Vance', 'Editorial Director', 'Luxe Interiors Magazine',
   'The Statuario Imperiale series installed in the Aurelia Penthouse is nothing short of majestic. Under morning side-lighting, the subtle gold veins generate a rich depth that is simply absent from lesser materials. It is art first, and structural surface second.',
   5, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80',
   'Bespoke Manhattan Penthouse', TRUE),

  ('Devansh Singhania', 'Managing Director', 'Singhania Luxury Estates',
   'We sourced over 500,000 sqft of vitrified slabs for our premium housing towers. The Tile Store provided flawless supply coordination and immaculate consistency. Their mockups and visualization support made our procurement exceptionally smooth.',
   5, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
   'Imperial Towers Residential Area', TRUE);

-- ============================================================
-- PROJECT GALLERIES
-- ============================================================
INSERT INTO galleries (title, subtitle, category, image_url, location, size, year, description, room_type, style) VALUES
  ('The Alabaster Villa', 'Luxury Seaside Residence', 'Villas',
   'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
   'Monaco Riviera', '8,500 Sqft', '2025',
   'A masterpiece of coastal brutalism. Features endless floors of bookmatched Statuario Imperial Slabs blending seamlessly with glass facades overlooking the Mediterranean Sea.',
   'Luxury villas', 'Modern'),

  ('Onyx Sanctuary Spa', 'High-End Wellness Club', 'Wellness',
   'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
   'Zurich, Switzerland', '12,000 Sqft', '2024',
   'An immersive sanctuary. Semi-translucent Persian Onyx tiles line the therapeutic steam rooms and central thermal pool, creating deep architectural focus and ambient backlit glows.',
   'Bathroom', 'Classic'),

  ('St. Regis Royal Penthouse', 'Sky Mansion Residence', 'Penthouses',
   'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
   'New York City, USA', '6,200 Sqft', '2025',
   'A sky-high minimalist masterpiece. Warm Smoked Walnut porcelain planks flow throughout the open layouts, matched with dramatic Nero Laurent black marble feature walls.',
   'Living room', 'Modern'),

  ('Atelier Aurelia Corporate HQ', 'Vanguard Headquarters', 'Commercial',
   'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
   'Munich, Germany', '34,000 Sqft', '2025',
   'High-performance commercial architecture. Clad in heavy-duty Silver Travertine stone cladding and high-reflection Venetian terrazzo tiles to resist intense footfall while carrying premium corporate style.',
   'Commercial', 'Modern'),

  ('Heritage Palazzo Restorations', 'Classic Renaissance Estate', 'Heritage',
   'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
   'Florence, Italy', '15,000 Sqft', '2023',
   'Restoration of an 18th-century noble residency. Melded hand-fired Moroccan Zellige art tiles and rustic tumbled travertine floor works to preserve original historical scale with modern durability.',
   'Living room', 'Rustic'),

  ('The Obsidian Pavilion', 'Contemporary Brutalist Pavilion', 'Commercial',
   'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
   'Kyoto, Japan', '4,000 Sqft', '2026',
   'A striking structural pavilion utilizing premium matte basalt slates and monolithic dark porcelain flooring to merge the architectural boundary between physical landscape and interior living.',
   'Outdoor', 'Modern');

-- ============================================================
-- BLOG CATEGORIES
-- ============================================================
INSERT INTO blog_categories (name, slug, description) VALUES
  ('Design Trends', 'design-trends', 'Latest trends in luxury tile and interior design'),
  ('Material Science', 'material-science', 'Technical deep-dives into tile materials and specifications'),
  ('Project Spotlights', 'project-spotlights', 'Featured installations and architectural case studies'),
  ('Buying Guides', 'buying-guides', 'Expert advice for selecting the right surfaces'),
  ('Care & Maintenance', 'care-maintenance', 'How to maintain and protect your investment');

-- ============================================================
-- AI RECOMMENDATIONS (pre-computed similarity pairs)
-- ============================================================
INSERT INTO ai_recommendations (source_product_id, recommended_product_id, score, reason) VALUES
  -- Statuario Imperial Gold → related marble slabs
  ('t1000000-0000-0000-0000-000000000001', 't9000000-0000-0000-0000-000000000009', 0.9200, 'Same marble category, similar white veined aesthetic'),
  ('t1000000-0000-0000-0000-000000000001', 't11b0000-0000-0000-0000-000000000011', 0.7800, 'Same slab category, dramatic vein contrast'),
  ('t1000000-0000-0000-0000-000000000001', 't6000000-0000-0000-0000-000000000006', 0.7200, 'Companion kitchen/counter slab for white marble spaces'),
  -- Nero Laurent → dark modern tiles
  ('t2000000-0000-0000-0000-000000000002', 't11b0000-0000-0000-0000-000000000011', 0.8800, 'Same black/charcoal palette, modern style'),
  ('t2000000-0000-0000-0000-000000000002', 't8000000-0000-0000-0000-000000000008', 0.7400, 'Same dark industrial aesthetic'),
  ('t2000000-0000-0000-0000-000000000002', 't19j0000-0000-0000-0000-000000000019', 0.7000, 'Black surface family, kitchen/feature pairing'),
  -- Calacatta Oro → premium white marble
  ('t9000000-0000-0000-0000-000000000009', 't1000000-0000-0000-0000-000000000001', 0.9200, 'Sister marble slab in same category'),
  ('t9000000-0000-0000-0000-000000000009', 't6000000-0000-0000-0000-000000000006', 0.7600, 'White marble + white kitchen countertop pairing'),
  -- Smoked Rovere → wood replicates
  ('t5000000-0000-0000-0000-000000000005', 't14e0000-0000-0000-0000-000000000014', 0.9400, 'Same wood replicate category, warm tones'),
  -- Onyx Pearl Lumina → bathroom tiles
  ('t4000000-0000-0000-0000-000000000004', 't18i0000-0000-0000-0000-000000000018', 0.8600, 'Same onyx/lappato bathroom category');
