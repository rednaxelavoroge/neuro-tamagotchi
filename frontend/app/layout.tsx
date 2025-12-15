import type { Metadata, Viewport } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { Providers } from "./providers";
import "@/styles/globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "NeuroTamagotchi - AI Companion",
    template: "%s | NeuroTamagotchi",
  },
  description: "Create and nurture your unique AI companion. Feed, style, and chat with your virtual pet!",
  keywords: ["AI", "tamagotchi", "virtual pet", "companion", "chat", "game"],
  authors: [{ name: "NeuroTamagotchi Team" }],
  creator: "NeuroTamagotchi",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://neurotamagotchi.com",
    title: "NeuroTamagotchi - AI Companion",
    description: "Create and nurture your unique AI companion",
    siteName: "NeuroTamagotchi",
  },
  twitter: {
    card: "summary_large_image",
    title: "NeuroTamagotchi - AI Companion",
    description: "Create and nurture your unique AI companion",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#0F172A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
