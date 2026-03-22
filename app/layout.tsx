import type { Metadata } from "next";
import { Geist, Geist_Mono, PT_Sans_Narrow } from "next/font/google";
import { Suspense } from "react";
import { StoreHydrator } from "@/components/StoreHydrator";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { OfflineBanner } from "@/components/OfflineBanner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const ptSansNarrow = PT_Sans_Narrow({
  variable: "--font-pt-sans-narrow",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Sevam",
    template: "%s | Sevam",
  },
  description: "Book trusted home services — cleaning, plumbing, electrical, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${ptSansNarrow.variable} antialiased`}
      >
        <OfflineBanner />
        <StoreHydrator />
        <ErrorBoundary boundaryName="root">
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>}>
            {children}
          </Suspense>
        </ErrorBoundary>
      </body>
    </html>
  );
}
