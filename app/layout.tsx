// app/layout.tsx ✅ IMPORT RELATIF
import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import Navbar from "../components/Navbar";  // ✅ RELATIF depuis app/

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Solution360°",
  description: "GSN Expertises"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${inter.className} antialiased`}>
        <Navbar />
        <main className="pt-20 p-4">{children}</main>
      </body>
    </html>
  );
}
