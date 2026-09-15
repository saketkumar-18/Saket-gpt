import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Inter } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  axes: ["opsz"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "SaketGPT — your AI chat, your model",
    template: "%s · SaketGPT",
  },
  description:
    "OpenAI-compatible AI chat built by Saket Kumar. Multi-thread with local persistence, voice input, model picker, custom instructions, math and time tools.",
  keywords: [
    "SaketGPT",
    "AI chat",
    "assistant-ui",
    "Next.js",
    "OpenAI compatible",
  ],
  authors: [{ name: "Saket Kumar", url: "https://github.com/saketkumar-18" }],
  openGraph: {
    title: "SaketGPT",
    description:
      "Your own ChatGPT-style assistant — multi-thread, model-agnostic, voice-enabled.",
    url: "https://saket-gpt.vercel.app",
    siteName: "SaketGPT",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${ibmPlexMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
