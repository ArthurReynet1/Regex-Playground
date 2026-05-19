import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { MotionProvider } from "@/components/theme/MotionProvider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_TITLE = "Regex Playground";
const SITE_DESCRIPTION =
  "Testez, décomposez et exportez vos regex. Un playground visuel pour développeurs francophones.";
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://regex-playground.local";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_TITLE}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "regex",
    "regular expression",
    "playground",
    "tester",
    "validator",
    "decomposer",
    "JavaScript",
    "Python",
    "C#",
  ],
  authors: [{ name: "Arthur Reynet" }],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    siteName: SITE_TITLE,
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Regex Playground — Testez, décomposez et exportez vos regex",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/og.png"],
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
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <MotionProvider>
            <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
            <Toaster />
          </MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
