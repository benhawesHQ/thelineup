import type { Metadata, Viewport } from "next"
import { Playfair_Display, DM_Sans, DM_Serif_Display } from "next/font/google"
import "./globals.css"

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "900"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-dm-sans",
})

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-dm-serif",
})

export const metadata: Metadata = {
  title: "The Lineup — 5 Opportunities. Every Monday. Built For You.",
  description:
    "Speaking gigs. Podcast guest spots. Writing opportunities. Fellowships. Networking events. Curated specifically for you — based on your goals, your topics, your ambitions.",
}

export const viewport: Viewport = {
  themeColor: "#0C0C0C",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable} ${dmSerif.variable} bg-[#faf8f5]`}>
      <body>{children}</body>
    </html>
  )
}
