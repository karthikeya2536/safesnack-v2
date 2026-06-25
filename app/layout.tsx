import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "SafeSnack | Guilt-Free Sugar-Free Diabetic-Friendly Keto Snacks",
  description: "Experience premium, healthy snacks by SafeSnack. Sugar-free, diabetic-friendly, and keto snack choices made with natural, nutritious ingredients.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-text font-sans relative overflow-x-hidden">
        {/* Subtle warm background glow — barely visible, supports glassmorphism depth */}
        <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none">
          <div className="absolute top-[8%] left-[5%] w-[30vw] h-[30vw] rounded-full bg-accent/[0.03] blur-[120px]"></div>
          <div className="absolute bottom-[15%] right-[8%] w-[25vw] h-[25vw] rounded-full bg-primary/[0.02] blur-[100px]"></div>
        </div>
        {children}
      </body>
    </html>
  );
}
