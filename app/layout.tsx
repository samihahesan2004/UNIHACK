import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mosaic",
  description: "Society event matching and group formation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}