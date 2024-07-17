import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ayan's Portfolio",
  description: "A creative showcase of my projects and skills in web development",
  keywords: "portfolio, web development, projects, skills, Ayan",
  authors: [{ name: "Ayan" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ayan-portfolio.com",
    title: "Ayan's Portfolio",
    description: "A creative showcase of my projects and skills in web development",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Ayan's Portfolio",
      },
    ],
    siteName: "Ayan's Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    site: "@ayan_handle",
    creator: "@ayan_handle",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-900 text-white`}>{children}</body>
    </html>
  );
}