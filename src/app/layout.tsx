import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Solution360° - Plateforme de gestion de projets",
  description: "Gestion intelligente de projets avec IA",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="antialiased">{children}</body>
    </html>
  );
}
