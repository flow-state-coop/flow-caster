import Providers from "@/components/providers";
import type { Metadata } from "next";
import { Archivo, Archivo_Black } from "next/font/google";
import "./globals.css";

const bodyFont = Archivo({ subsets: ["latin"], variable: "--font-body" });
const headerFont = Archivo_Black({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-header",
});

export const metadata: Metadata = {
  title: "Flow Splitter",
  description: "Flow Splitter",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${headerFont.variable} ${bodyFont.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
