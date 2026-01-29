import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  UserButton,
  SignOutButton,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";
import SyncUser from "@/components/SyncUser";
import Header from "@/components/Header";
import JsonLd from "@/components/JsonLd";
import { GoogleAnalytics } from "@next/third-parties/google";


export const metadata: Metadata = {
  metadataBase: new URL("https://scribe.cv"),
  title: {
    default: "Scribe.CV | Write Tailored Cover Letters with AI Alignment",
    template: "%s | Scribe.CV"
  },
  description: "Scribe.CV mirrors your career history to job requirements with surgical precision. Generate high-quality, tailored cover letters in 15 seconds.",
  keywords: ["AI cover letter generator", "career alignment", "tailored cover letter", "job application helper", "Scribe CV"],
  authors: [{ name: "Scribe.CV Architecture" }],
  creator: "Scribe.CV",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://scribe.cv",
    siteName: "Scribe.CV",
    title: "Scribe.CV | Contextual AI Cover Letters",
    description: "Your CV + Any Job Link = One Perfect Cover Letter. Alignment in seconds.",
    images: [
      {
        url: "/og-image.png", // Recommended to add this asset later
        width: 1200,
        height: 630,
        alt: "Scribe.CV - Contextual Cover Letters",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Scribe.CV | Contextual AI Cover Letters",
    description: "Generate high-quality, tailored cover letters in seconds using AI alignment.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased min-h-screen flex flex-col bg-background-light text-charcoal" suppressHydrationWarning>
        <ClerkProvider dynamic>
          <ConvexClientProvider>
            <SyncUser />
            <JsonLd />
            {(process.env.NEXT_PUBLIC_GA_ID || "G-FSCRH2269S") && (
              <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || "G-FSCRH2269S"} />
            )}
            <Header />

            <main className="flex-grow">{children}</main>
            <footer className="border-t border-charcoal/10 px-6 md:px-20 py-12 flex flex-col md:flex-row justify-between items-center gap-8">
              <Link href="/" className="serif-heading text-xl font-bold hover:text-primary transition-colors">Scribe.CV</Link>
              <div className="flex gap-12 text-[10px] uppercase tracking-[0.2em] font-bold text-charcoal/40">
                <Link href="/privacy" className="hover:text-charcoal transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="hover:text-charcoal transition-colors">Terms of Service</Link>
                <Link href="/compare" className="hover:text-charcoal transition-colors">Compare</Link>
              </div>
              <div className="text-[10px] uppercase tracking-widest text-charcoal/40" suppressHydrationWarning>
                &copy; {new Date().getFullYear()} Scribe.CV. All rights reserved.
              </div>
            </footer>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
