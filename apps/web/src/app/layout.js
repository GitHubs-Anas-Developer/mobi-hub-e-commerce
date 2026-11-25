import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Toaster } from "sonner";

import StoreProvider from "@/store/Provider";
import AppShell from "@/components/layout/AppShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "MOBI HUB | Tech Accessories",
  description:
    "Discover premium tech accessories at MOBI HUB. Shop quality gadgets and accessories.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body>
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
      </body>
    </html>
  );
}
