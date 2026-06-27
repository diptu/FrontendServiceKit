import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/core/auth/AuthContext";
import { ToastProvider } from "@/components/ui";
import { MotionProvider } from "@/components/providers/MotionProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "NutraTenant IAM Web",
  description: "Multi-tenant Identity & Access Management control plane.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans text-slate-800 antialiased">
        <AuthProvider>
          <MotionProvider>
            <ToastProvider>{children}</ToastProvider>
          </MotionProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
