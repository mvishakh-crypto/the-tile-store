import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryClient';
import { getGalleries } from '../services/blogService';
import { ProjectItem } from '../types';

export function useGalleries(filters?: { category?: string; style?: string; roomType?: string }) {
  return useQuery<ProjectItem[]>({
    queryKey: queryKeys.galleries.list(filters),
    queryFn: async () => {
      const raw = await getGalleries(filters);
      // Map service shape { imageUrl, roomType, ... } → ProjectItem shape { image, room, ... }
      return raw.map(g => ({
        id: g.id,
        title: g.title,
        subtitle: g.subtitle || '',
        category: (g.category as ProjectItem['category']) || 'Villas',
        image: g.imageUrl,
        location: g.location || '',
        size: g.size || '',
        year: g.year || '',
        description: g.description || '',
        room: (g.roomType as ProjectItem['room']) || undefined,
        style: (g.style as ProjectItem['style']) || undefined,
      }));
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
