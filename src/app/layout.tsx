import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MarkMyAnswer | Free AI marking for Edexcel GCSE Business",
  description:
    "Get instant, examiner-style marks and feedback on your Edexcel GCSE Business (1BS0) exam answers. Free for students, no sign-up.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB">
      <body>{children}</body>
    </html>
  );
}
