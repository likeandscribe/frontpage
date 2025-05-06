import "./globals.css";
import { VercelToolbar } from "@vercel/toolbar/next";
import { Source_Sans_3, Source_Serif_4 } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "@/lib/components/ui/toaster";
import { Analytics } from "@vercel/analytics/next";
import { type Metadata } from "next";
import { ThemeProvider } from "@/lib/components/theme-provider";

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-source_serif",
  weight: ["400", "500"],
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-source_sans",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Frontpage",
  description: "A federated link aggregator. Your frontpage to the internet.",
  openGraph: {
    title: "Frontpage",
    description: "Your frontpage to the internet.",
    type: "website",
    siteName: "frontpage.fyi",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          sourceSans.variable,
          sourceSerif.variable,
          "bg-slate-50/50 dark:bg-slate-950 min-h-screen",
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          <Analytics />
        </ThemeProvider>
        <script
          defer
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "5e64b32c70b34b1583d863032b03d9ad"}'
        />
        {process.env.NODE_ENV === "development" && <VercelToolbar />}
      </body>
    </html>
  );
}
