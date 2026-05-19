import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "DeutschPath — Practice German from A1 to C1",
    template: "%s · DeutschPath",
  },
  description:
    "Structured translation drills, real readings with instant click-to-translate, and AI conversation for serious German learners. Free. No ads. No owl.",
  metadataBase: new URL("https://deutschpath.vercel.app"),
  openGraph: {
    title: "DeutschPath — Practice German from A1 to C1",
    description:
      "Structured drills, real readings, and AI conversation for serious German learners.",
    url: "https://deutschpath.vercel.app",
    siteName: "DeutschPath",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DeutschPath",
    description:
      "Practice German A1 to C1 — drills, readings, AI conversation.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased min-h-screen flex flex-col`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
