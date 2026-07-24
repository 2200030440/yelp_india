import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/site";
import AuthProvider from "@/providers/AuthProvider";
import { ToastProvider } from "@/components/ui/toast";
import { LocationProvider } from "@/context/LocationContext";
import { FavoritesProvider } from "@/context/FavoritesContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "restaurants",
    "food",
    "reviews",
    "India",
    "dining",
    "best restaurants",
  ],
  authors: [{ name: "Yelp India Team" }],
  creator: "Yelp India",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: "@yelp_india",
  },
  icons: {
    icon: "/favicon.ico",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full bg-background font-sans antialiased">
        <LocationProvider>
          <AuthProvider>
            <FavoritesProvider>
              <ToastProvider>{children}</ToastProvider>
            </FavoritesProvider>
          </AuthProvider>
        </LocationProvider>
      </body>
    </html>
  );
}
