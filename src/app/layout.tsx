import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Huella & Vínculo — Educación y acompañamiento canino",
    template: "%s | Huella & Vínculo",
  },
  description:
    "Educación canina profesional con Paula Soledad. Reactividad, educación básica, cachorros y más. Entendemos a tu perro, te enseñamos a entenderlo.",
  keywords: [
    "educación canina",
    "adiestramiento canino",
    "reactividad canina",
    "educadora canina",
    "Paula Soledad",
    "cachorros",
  ],
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "Huella & Vínculo",
    title: "Huella & Vínculo — Educación y acompañamiento canino",
    description:
      "Entendemos a tu perro, te enseñamos a entenderlo. Educación canina profesional con seguimiento personalizado.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
