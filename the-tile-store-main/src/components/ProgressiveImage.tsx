import { useState, useEffect } from 'react';

interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;       // Outer container classes (aspect ratio, borders, etc.)
  imgClassName?: string;    // Inner image classes (transforms, hover shifts, etc.)
  id?: string;
  referrerPolicy?: 'no-referrer' | 'origin' | 'unsafe-url';
  onLoadFinished?: () => void;
}

export default function ProgressiveImage({
  src,
  alt,
  className = '',
  imgClassName = '',
  id,
  referrerPolicy = 'no-referrer',
  onLoadFinished
}: ProgressiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [thumbnailSrc, setThumbnailSrc] = useState<string>('');

  // Generate an ultra-lightweight thumbnail if the source is an Unsplash image
  useEffect(() => {
    if (!src) return;

    if (src.includes('images.unsplash.com') || src.includes('unsplash.com')) {
      try {
        const urlObj = new URL(src);
        const searchParams = urlObj.searchParams;
        
        // Setup lower dimensions and high compression
        searchParams.set('w', '32');
        searchParams.set('q', '15');
        searchParams.set('blur', '3'); // unsplash-native blur
        
        setThumbnailSrc(urlObj.toString());
      } catch (e) {
        // Fallback if URL parsing fails
        setThumbnailSrc(src);
      }
    } else {
      // Non-unsplash fallback starts with a soft color block skeleton
      setThumbnailSrc('');
    }
  }, [src]);

  const handleImageLoad = () => {
    setIsLoaded(true);
    onLoadFinished?.();
  };

  return (
    <div className={`relative overflow-hidden bg-ivory ${className}`} id={id ? `prog-container-${id}` : undefined}>
      {/* 1. Low-res Thumbnail (if available) / Warm luxurious shimmer skeleton */}
      {thumbnailSrc ? (
        <img
          src={thumbnailSrc}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 w-full h-full object-cover object-center filter blur-md transform scale-105 transition-opacity duration-700 pointer-events-none ${
            isLoaded ? 'opacity-0' : 'opacity-100'
          }`}
          referrerPolicy={referrerPolicy}
        />
      ) : (
        <div
          className={`absolute inset-0 w-full h-full bg-gradient-to-r from-[#F2EFE9] via-[#EAE5DC] to-[#F2EFE9] animate-pulse transition-opacity duration-700 ${
            isLoaded ? 'opacity-0' : 'opacity-100'
          }`}
        />
      )}

      {/* 2. Soft Gold-Glazed Ambient Overlay when loading to represent polished tiles */}
      {!isLoaded && (
        <div className="absolute inset-0 z-1 bg-gold-500/5 mix-blend-overlay pointer-events-none" />
      )}

      {/* 3. True High-Resolution Image Layer */}
      <img
        src={src}
        alt={alt}
        onLoad={handleImageLoad}
        className={`w-full h-full object-cover object-center transition-all duration-700 ease-out ${imgClassName} ${
          isLoaded 
            ? 'opacity-100 filter blur-0' 
            : 'opacity-0 filter blur-sm scale-102'
        }`}
        referrerPolicy={referrerPolicy}
        id={id}
      />
    </div>
  );
}
