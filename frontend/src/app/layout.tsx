import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Complienx",
  description: "Compliance, documents and tasks management platform"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
