import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryClient';
import { getTestimonials } from '../services/blogService';
import { TestimonialItem } from '../types';

export function useTestimonials() {
  return useQuery<TestimonialItem[]>({
    queryKey: queryKeys.testimonials.featured(),
    queryFn: async () => {
      const raw = await getTestimonials();
      // Map service shape { avatarUrl, projectType, ... } → TestimonialItem shape { avatar, ... }
      return raw.map(t => ({
        id: t.id,
        clientName: t.clientName,
        role: t.role,
        company: t.company || '',
        quote: t.quote,
        rating: t.rating,
        avatar: t.avatarUrl || '',
        projectType: t.projectType || '',
      }));
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}
