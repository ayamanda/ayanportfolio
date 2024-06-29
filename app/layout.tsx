import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ayan's Portfolio",
  description: "A piece of creativity showcasing my projects and skills",
  keywords: "portfolio, web development, projects, skills",
  openGraph: {
    title: "Ayan's Portfolio",
    description: "A piece of creativity showcasing my projects and skills",
    images: ['/og-image.jpg'],
  },
};

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