import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Tile Store",
  description: "Placeholder — real metadata is built per-route in Phase 5.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
