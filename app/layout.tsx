import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react"

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://ayanm.vercel.app"),
  title: "Ayan's Portfolio | Web Developer & Designer",
  description: "Explore Ayan's portfolio featuring innovative web development projects, creative designs, and technical skills",
  keywords: "Ayan, portfolio, web development, frontend developer, React developer, NextJS, projects, skills, UI/UX design",
  authors: [{ name: "Ayan" }],
  creator: "Ayan",
  publisher: "Ayan",
  category: "Portfolio",
  robots: {
    index: true,
    follow: true,
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover'
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ayanm.pages.dev",
    title: "Ayan's Portfolio | Creative Web Developer",
    description: "Discover my work, projects, and expertise in modern web development and design",
    siteName: "Ayan's Portfolio",
    images: [
      {
        // This will be dynamically replaced with the profile photo from Firestore
        url: "/api/og", // Using a dynamic API route that will return the OG image with the profile photo
        width: 1200,
        height: 630,
        alt: "Ayan's Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@AyanMandal824",
    creator: "@AyanMandal824",
    title: "Ayan's Portfolio | Web Developer",
    description: "Check out my latest web development projects and skills",
    images: {
      url: "/api/og", // Using the same dynamic OG image
      alt: "Ayan's Portfolio Preview",
    },
  },
  alternates: {
    canonical: "https://ayanm.pages.dev",
  },
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png" },
    ],
  },
  verification: {
    google: "verification_token", // Replace with your Google verification token
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Ayan's Portfolio",
  },
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <html lang="en">
        <body className={`${inter.className} bg-gray-900 text-white`}>{children}</body>
      </html>
      <Analytics />
    </>
  );
}