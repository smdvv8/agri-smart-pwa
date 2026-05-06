import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "AgriSmart TJ",
    template: "%s | AgriSmart TJ",
  },
  description:
    "ИИ-помощник для фермеров Таджикистана: полив, болезни растений, погода, маркет и агро-чат.",
  applicationName: "AgriSmart TJ",
  appleWebApp: {
    capable: true,
    title: "AgriSmart TJ",
    statusBarStyle: "default",
  },
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full bg-background font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
