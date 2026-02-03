import type { Metadata } from "next";
import { Kanit, Oswald } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { SpeedInsights } from "@vercel/speed-insights/next";

const kanit = Kanit({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ["latin", "thai"],
  variable: "--font-kanit",
  display: 'swap',
});

const oswald = Oswald({
  weight: ['400', '500', '600', '700'],
  subsets: ["latin"],
  variable: "--font-oswald",
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: "RoV SN Tournament 2026",
    template: "%s | RoV SN Tournament",
  },
  description: "Official tournament management system for RoV SN Tournament 2026. View fixtures, standings, stats, and more.",
  keywords: ["RoV", "Tournament", "Arena of Valor", "Esports", "SN Tournament"],
  authors: [{ name: "RoV SN Tournament Team" }],
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "RoV SN Tournament 2026",
    description: "Official tournament management system for RoV SN Tournament 2026",
    type: "website",
    locale: "th_TH",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${kanit.variable} ${oswald.variable}`}>
      <head>
        {/* Font Awesome for icons */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}
