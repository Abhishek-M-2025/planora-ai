import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Planora AI — Intelligent Event Planning Studio",
  description:
    "Planora AI is an art-directed, GenAI-powered planning platform for weddings, milestones, and community celebrations with Gemini AI synthesis, budget tracking, and interactive timelines.",
  keywords: [
    "Event Planning AI",
    "Wedding Planning",
    "Birthday Planner",
    "Gemini AI Event Assistant",
    "Budget Tracker",
    "Event Timeline",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jakarta.variable} ${cormorant.variable}`}>
      <body className="antialiased selection:bg-forest-100 selection:text-forest-900">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
