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
  metadataBase: new URL("https://turnamen-futsal-katar-rw03.vercel.app"),
  title: "Turnamen Futsal Karang Taruna RW 03",
  description:
    "Portal resmi Turnamen Futsal Karang Taruna RW 03. Lihat klasemen terbaru, jadwal pertandingan, dan daftar pencetak gol (top score).",
  icons: {
    icon: "/favicon-32x32.png",
    shortcut: "/favicon-32x32.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Turnamen Futsal Karang Taruna RW 03",
    description:
      "Portal resmi Turnamen Futsal Karang Taruna RW 03. Lihat klasemen terbaru, jadwal pertandingan, dan daftar pencetak gol (top score).",
    type: "website",
    images: [
      {
        url: "/android-chrome-192x192.png",
        width: 192,
        height: 192,
        alt: "Logo Turnamen Futsal Karang Taruna RW 03",
      },
    ],
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
      <body className="min-h-full flex flex-col overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
