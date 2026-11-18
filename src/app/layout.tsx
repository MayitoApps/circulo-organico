import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Círculo Orgánico | Programa de Lealtad Grupo Orgánico Hoteles Boutique",
  description:
    "Cada visita te da algo más. Programa de lealtad y recompensas multi-perfil para socios personales, empresas y agencias en los seis hoteles de Grupo Orgánico.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${cormorant.variable} ${jakarta.variable}`}>
      <body className="min-h-screen bg-[#FAF8F5] text-[#1C201E]">{children}</body>
    </html>
  );
}
