import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gym Buddy AI",
  description: "Mobile-first AI workout companion tailored to recovery, goals, and equipment limits.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
