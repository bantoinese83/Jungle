import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AIChatbot from "@/components/chatbot/AIChatbot";
import Script from "next/script";

// Validate environment variables on server startup
if (typeof window === 'undefined') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { validateEnvironment } = require('@/lib/env-validation');
    const validation = validateEnvironment();
    if (!validation.valid) {
      console.warn('Environment validation warnings:', validation.errors);
      // In production, this should throw, but in development we allow gradual setup
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Environment validation failed');
      }
    }
  } catch (error) {
    // Ignore if module not found (during build)
    if (error instanceof Error && !error.message.includes('Cannot find module')) {
      console.error('Environment validation error:', error);
    }
  }
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Jungle - Speed to Lead AI Calling',
  description: 'Automatically call leads within minutes using AI. Connect your CRM and never miss a lead again.',
  keywords: [
    'speed to lead',
    'AI sales caller',
    'lead qualification automation',
    'AI calling',
    'automated lead follow-up',
    'GoHighLevel AI integration',
    'CRM automation',
    'sales automation',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://jungle.app',
    siteName: 'Jungle',
    title: 'Jungle - Speed to Lead AI Calling',
    description: 'Automatically call leads within minutes using AI. Connect your CRM and never miss a lead again.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jungle - Speed to Lead AI Calling',
    description: 'Automatically call leads within minutes using AI. Connect your CRM and never miss a lead again.',
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL || 'https://jungle.app',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
              `}
            </Script>
          </>
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-emerald-600 focus:text-white focus:rounded-md"
        >
          Skip to main content
        </a>
        <Header />
        <main id="main-content" className="flex-grow">{children}</main>
        {/* Organization Schema for SEO/AEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Jungle',
              url: process.env.NEXT_PUBLIC_APP_URL || 'https://jungle.app',
              logo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://jungle.app'}/logo.png`,
              description: 'AI-powered speed to lead automation. Automatically call leads within minutes using AI.',
              sameAs: [
                'https://twitter.com/jungle',
                'https://linkedin.com/company/jungle',
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'Customer Service',
                email: 'support@jungle.app',
              },
            }),
          }}
        />
        <Footer />
        <AIChatbot />
      </body>
    </html>
  );
}
