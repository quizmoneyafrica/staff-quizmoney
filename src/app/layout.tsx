import type { Metadata } from "next";
import { Space_Grotesk, DM_Sans } from "next/font/google";
import "./globals.css";
import AppSetup from "./appSetup";
import "@radix-ui/themes/styles.css";

const spacegrotesk = Space_Grotesk({
  variable: "--spacegrotesk",
  subsets: ["latin"],
});

const dmsans = DM_Sans({
  variable: "--dmsans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Quiz Money Admin",
    default: "Quiz Money - Rewarding Knowledge with Financial Income",
  },
  description: "Engage in quiz game and win amazing cash prices",
  generator: "Quiz Money Admin",
  applicationName: "Quiz Money Admin",
  referrer: "origin-when-cross-origin",
  alternates: {
    canonical: "https://app.quizmoney.ng",
    languages: {
      "en-US": "/en-US",
    },
  },
  openGraph: {
    title: "Quiz Money Admin",
    description: "Engage in quiz game and win amazing cash prices",
    url: "https://quizmoney.ng",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1024,
        height: 1024,
        alt: "Quiz Money",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Quiz Money - Rewarding Knowledge with Financial Income",
    description: "Engage in quiz game and win amazing cash prices",
    images: ["/opengraph-image.png"],
  },
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.3.0/font/bootstrap-icons.css"
        ></link>
        <meta name="apple-mobile-web-app-title" content="Quiz Money Admin" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0"
        />
        {/* iOS-specific */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </head>
      <body
        className={`${spacegrotesk.variable} ${dmsans.variable} antialiased`}
      >
        <AppSetup>{children}</AppSetup>
      </body>
    </html>
  );
}
