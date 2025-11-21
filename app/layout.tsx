import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import { VERSION } from "./config/version";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Skjærvik's Ratings",
  description: "Rate and track movies, series, and anime",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main>{children}</main>
        <div className="version-badge">{VERSION}</div>
      </body>
    </html>
  );
}
