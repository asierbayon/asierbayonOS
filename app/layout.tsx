import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ConsoleArt from "./console-art";
import "./globals.css";
import "./startup-screen.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const title = "Asier Bayon";
const description = "The interactive desktop portfolio of independent product and brand designer Asier.";

const ogImage = {
  url: "/og.png",
  width: 1200,
  height: 630,
  alt: "A terminal window running whoami, which prints Asier Bayon",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "overlays-content",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.asierbayon.com"),
  title,
  description,
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: { title, description, type: "website", images: [ogImage] },
  twitter: { card: "summary_large_image", title, description, images: [ogImage] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
        suppressHydrationWarning
      >
        <ConsoleArt />
        {children}
      </body>
    </html>
  );
}
