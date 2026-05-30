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
  title: "AcademiaAI — AI Text Humanizer | Your work. Just better.",
  description:
    "Undetectable AI text humanizer, academic writing tool, plagiarism risk scanner, and citation generator. Make AI-generated text sound human in one click.",
  keywords: [
    "AI text humanizer",
    "undetectable AI writing",
    "academic writing tool",
    "plagiarism risk scanner",
    "citation generator",
    "AI to human text converter",
    "academic enhancer",
  ],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  openGraph: {
    title: "AcademiaAI — AI Text Humanizer | Your work. Just better.",
    description:
      "Undetectable AI text humanizer, academic writing tool, plagiarism risk scanner, and citation generator.",
    type: "website",
    siteName: "AcademiaAI",
  },
  twitter: {
    card: "summary_large_image",
    title: "AcademiaAI — AI Text Humanizer | Your work. Just better.",
    description:
      "Undetectable AI text humanizer, academic writing tool, plagiarism risk scanner, and citation generator.",
  },
  robots: { index: true, follow: true },
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
