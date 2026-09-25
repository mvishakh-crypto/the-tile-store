export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <main className="flex flex-1 flex-col items-center justify-center min-h-screen bg-ivory text-charcoal">
      <h1 className="font-serif text-3xl">Product: {slug}</h1>
      <p className="mt-2 text-sm text-charcoal/60">
        Route skeleton — Phase 2. Real content + data fetching lands in Phase 4.
      </p>
    </main>
  );
}
