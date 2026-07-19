import type { Metadata } from "next";
import { Manrope, Orbitron, Space_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const bodyFont = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

const displayFont = Orbitron({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const labelFont = Space_Mono({
  variable: "--font-label",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "NutriTrack",
  description: "Track your calories, protein, and macros with AI-powered meal analysis",
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#c8f13e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${bodyFont.variable} ${displayFont.variable} ${labelFont.variable} h-full antialiased`}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-full flex flex-col">
        <div className="app-backdrop" aria-hidden="true" />
        {children}
        <Toaster
          richColors
          closeButton
          position="top-right"
          toastOptions={{
            className: "font-body",
          }}
        />
      </body>
    </html>
  );
}
