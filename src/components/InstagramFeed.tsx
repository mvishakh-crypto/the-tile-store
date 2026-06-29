import React, { useState, useEffect } from 'react';
import { motion, useInView } from 'motion/react';
import { Instagram, Play, Heart, MessageCircle, Eye, ExternalLink, ArrowRight } from 'lucide-react';

interface SocialPost {
  id: string;
  type: 'image' | 'reel';
  thumbnail: string;
  caption: string;
  likes: number;
  comments: number;
  views?: number;
  hashtags: string[];
}

const SOCIAL_POSTS: SocialPost[] = [
  {
    id: 's1',
    type: 'image',
    thumbnail: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600',
    caption: 'Italian marble meets modern minimalism — Our Calacatta Prestige in a penthouse bathroom.',
    likes: 1243,
    comments: 87,
    hashtags: ['#LuxuryTiles', '#InteriorDesign', '#BathroomGoals'],
  },
  {
    id: 's2',
    type: 'reel',
    thumbnail: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c0?w=600',
    caption: 'Watch our expert craftsmen lay herringbone Venetian porcelain in real time.',
    likes: 3892,
    comments: 215,
    views: 47200,
    hashtags: ['#TileInstallation', '#Herringbone', '#Craftsmanship'],
  },
  {
    id: 's3',
    type: 'image',
    thumbnail: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600',
    caption: 'Nordic Ash wood-effect tiles — when luxury meets durability.',
    likes: 2105,
    comments: 143,
    hashtags: ['#WoodLook', '#FloorTiles', '#HomeDesign'],
  },
  {
    id: 's4',
    type: 'reel',
    thumbnail: 'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=600',
    caption: 'From showroom to dream kitchen — A client transformation using Emperador Dark.',
    likes: 5430,
    comments: 321,
    views: 89100,
    hashtags: ['#KitchenDesign', '#Transformation', '#MarbleTiles'],
  },
  {
    id: 's5',
    type: 'image',
    thumbnail: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=600',
    caption: 'Our curated palette wall at the flagship showroom — each slab tells a story.',
    likes: 1876,
    comments: 92,
    hashtags: ['#Showroom', '#TileDesign', '#LuxuryInteriors'],
  },
  {
    id: 's6',
    type: 'reel',
    thumbnail: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=600',
    caption: 'Behind the scenes: How we source rare Statuario marble from Carrara, Italy.',
    likes: 7215,
    comments: 456,
    views: 124000,
    hashtags: ['#Carrara', '#Marble', '#BehindTheScenes'],
  },
];

const formatNumber = (num: number): string => {
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

export default function InstagramFeed() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });
  const [hoveredPost, setHoveredPost] = useState<string | null>(null);

  return (
    <section
      ref={containerRef}
      className="relative py-24 md:py-32 bg-charcoal overflow-hidden"
      id="social-feed"
    >
      {/* Subtle grain overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
      }} />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16"
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-[1px] w-10 bg-gold-500" />
              <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-gold-500 font-semibold">
                @THETILESTORE
              </span>
            </div>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-warmwhite tracking-wide">
              From Our Studio
            </h2>
            <p className="font-sans text-sm text-warmwhite/50 mt-3 max-w-md leading-relaxed">
              Follow our creative journey — installations, sourcing trips, and design inspiration shared in real time.
            </p>
          </div>

          <motion.a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 px-6 py-3 border border-warmwhite/15 hover:border-gold-500 transition-all duration-300"
            whileHover={{ scale: 1.02 }}
          >
            <Instagram className="w-4 h-4 text-gold-500" />
            <span className="font-mono text-[10px] tracking-widest uppercase text-warmwhite/70 group-hover:text-gold-500 transition-colors">
              Follow on Instagram
            </span>
            <ArrowRight className="w-3 h-3 text-warmwhite/40 group-hover:text-gold-500 group-hover:translate-x-1 transition-all" />
          </motion.a>
        </motion.div>

        {/* Instagram Grid — Bento Layout */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3">
          {SOCIAL_POSTS.map((post, idx) => {
            const isLarge = idx === 0 || idx === 3;
            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className={`relative group cursor-pointer overflow-hidden ${
                  isLarge
                    ? 'col-span-2 row-span-2 aspect-square'
                    : 'col-span-1 aspect-square'
                }`}
                onMouseEnter={() => setHoveredPost(post.id)}
                onMouseLeave={() => setHoveredPost(null)}
              >
                {/* Image */}
                <img
                  src={post.thumbnail}
                  alt={post.caption}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />

                {/* Reel Play Icon */}
                {post.type === 'reel' && (
                  <div className="absolute top-3 right-3 z-10">
                    <div className="w-8 h-8 bg-warmwhite/20 backdrop-blur-sm flex items-center justify-center">
                      <Play className="w-3.5 h-3.5 text-warmwhite fill-warmwhite" />
                    </div>
                  </div>
                )}

                {/* Hover Overlay */}
                <motion.div
                  initial={false}
                  animate={{
                    opacity: hoveredPost === post.id ? 1 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 bg-charcoal/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3 p-4"
                >
                  {/* Stats */}
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-1.5">
                      <Heart className="w-4 h-4 text-warmwhite fill-warmwhite" />
                      <span className="font-mono text-xs font-bold text-warmwhite">
                        {formatNumber(post.likes)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MessageCircle className="w-4 h-4 text-warmwhite" />
                      <span className="font-mono text-xs font-bold text-warmwhite">
                        {formatNumber(post.comments)}
                      </span>
                    </div>
                    {post.views && (
                      <div className="flex items-center gap-1.5">
                        <Eye className="w-4 h-4 text-warmwhite" />
                        <span className="font-mono text-xs font-bold text-warmwhite">
                          {formatNumber(post.views)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Caption (large cards only) */}
                  {isLarge && (
                    <p className="text-center font-sans text-xs text-warmwhite/70 max-w-[200px] leading-relaxed mt-1">
                      {post.caption.substring(0, 80)}...
                    </p>
                  )}

                  {/* Hashtags (large cards only) */}
                  {isLarge && (
                    <div className="flex flex-wrap justify-center gap-1.5 mt-1">
                      {post.hashtags.map(tag => (
                        <span key={tag} className="font-mono text-[8px] tracking-widest text-gold-400 uppercase">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>

                {/* Gold corner accent */}
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-gold-500/0 group-hover:border-gold-500/80 transition-all duration-500" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-gold-500/0 group-hover:border-gold-500/80 transition-all duration-500" />
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Live Stats Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-8 md:gap-16 py-6 border-t border-warmwhite/10"
        >
          {[
            { label: 'Followers', value: '24.8K' },
            { label: 'Posts', value: '1,247' },
            { label: 'Projects Shared', value: '340+' },
            { label: 'Countries Reached', value: '18' },
          ].map((stat, idx) => (
            <div key={idx} className="text-center">
              <p className="font-serif text-xl md:text-2xl font-bold text-gold-500">{stat.value}</p>
              <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-warmwhite/40 mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
