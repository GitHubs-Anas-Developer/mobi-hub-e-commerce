import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import "./globals.css";

import { Toaster } from "sonner";

import StoreProvider from "@/store/Provider";
import AppShell from "@/components/layout/AppShell";
import GlobalPageSkeleton from "@/components/loading/GlobalPageSkeleton";
import JsonLd from "@/components/seo/JsonLd";
import {
  BRAND_ASSETS,
  BRAND_DESCRIPTION,
  BRAND_NAME,
  BRAND_SITE_URL,
  BRAND_TAGLINE,
} from "@/config/brand";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL(BRAND_SITE_URL),
  title: {
    default: `${BRAND_NAME} | ${BRAND_TAGLINE}`,
    template: `%s | ${BRAND_NAME}`,
  },
  description: BRAND_DESCRIPTION,
  applicationName: BRAND_NAME,
  openGraph: {
    type: "website",
    siteName: BRAND_NAME,
    title: `${BRAND_NAME} | ${BRAND_TAGLINE}`,
    description: BRAND_DESCRIPTION,
    images: [
      {
        url: BRAND_ASSETS.ogImage,
        width: 1200,
        height: 630,
        alt: `${BRAND_NAME} - ${BRAND_TAGLINE}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND_NAME} | ${BRAND_TAGLINE}`,
    description: BRAND_DESCRIPTION,
    images: [BRAND_ASSETS.ogImage],
  },
  icons: {
    icon: [
      { url: BRAND_ASSETS.icon192, sizes: "192x192", type: "image/png" },
      { url: BRAND_ASSETS.icon512, sizes: "512x512", type: "image/png" },
    ],
    apple: BRAND_ASSETS.icon192,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${BRAND_SITE_URL}/#organization`,
  name: BRAND_NAME,
  url: BRAND_SITE_URL,
  logo: new URL(BRAND_ASSETS.logo, BRAND_SITE_URL).toString(),
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${BRAND_SITE_URL}/#website`,
  url: BRAND_SITE_URL,
  name: BRAND_NAME,
  publisher: { "@id": `${BRAND_SITE_URL}/#organization` },
  potentialAction: {
    "@type": "SearchAction",
    target: `${BRAND_SITE_URL}/products?search={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body>
        <JsonLd data={[organizationJsonLd, websiteJsonLd]} />
        <Suspense fallback={<GlobalPageSkeleton />}>
          <AntdRegistry>
            <StoreProvider>
              <AppShell>{children}</AppShell>

              <Toaster
                position="top-right"
                theme="light"
                richColors
                closeButton
                duration={3500}
                visibleToasts={3}
              />
            </StoreProvider>
          </AntdRegistry>
        </Suspense>
      </body>
    </html>
  );
}
