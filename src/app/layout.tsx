import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pili-Pinas",
  description: "Gawa ng Pilipino, Para sa Pilipino",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
        <div className="noise-overlay" />
      </body>
    </html>
  );
}
