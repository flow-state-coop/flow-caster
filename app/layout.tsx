import Providers from "@/components/providers";
import type { Metadata } from "next";
import { Archivo, Archivo_Black } from "next/font/google";
import "./globals.css";
import Header from "@/components/Shared/Header";

const bodyFont = Archivo({ subsets: ["latin"], variable: "--font-body" });
const headerFont = Archivo_Black({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-header",
});

export const metadata: Metadata = {
  title: "Flow Caster",
  description: "Flow Caster",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${headerFont.variable} ${bodyFont.variable} bg-white color-white p-4`}
      >
        <Providers>
          <Header />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
