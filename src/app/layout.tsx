import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AcademiaAI — Academic Writing Assistant",
  description:
    "AI-powered plagiarism detection, citation generation, and academic writing enhancement. Improve your academic papers with intelligent tools.",
  keywords: ["academic writing", "plagiarism checker", "citation generator", "AI writing assistant", "essay helper"],
  openGraph: {
    title: "AcademiaAI — Academic Writing Assistant",
    description: "AI-powered tools for academic writing: plagiarism detection, citations, and content enhancement.",
    type: "website",
    siteName: "AcademiaAI",
  },
  twitter: {
    card: "summary_large_image",
    title: "AcademiaAI — Academic Writing Assistant",
    description: "AI-powered tools for academic writing: plagiarism detection, citations, and content enhancement.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
