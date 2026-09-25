'use client';

import { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/queryClient';

export default function Providers({ children }: { children: React.ReactNode }) {
  // useState (not useMemo) so this is guaranteed to run exactly once per
  // component instance, even under React 19 Strict Mode's double-invoke —
  // getQueryClient() itself already returns the stable browser singleton,
  // this just avoids re-deriving it unnecessarily on re-render.
  const [queryClient] = useState(() => getQueryClient());

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
