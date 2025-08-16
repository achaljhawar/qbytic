import "~/styles/globals.css";
import '@rainbow-me/rainbowkit/styles.css';

import { type Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Providers } from "~/components/providers";
import { PerformanceMonitor } from "~/components/ui/performance-monitor";

export const metadata: Metadata = {
  title: "Qbytic - P2P Crypto Lending",
  description: "Secure peer-to-peer cryptocurrency lending platform",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  // Performance optimizations
  other: {
    // Preload critical resources
    'link': 'preload',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-geist-sans: ${GeistSans.variable};
  --font-geist-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        <Providers>
          {children}
          <PerformanceMonitor />
        </Providers>
      </body>
    </html>
  );
}
