'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import AuthGuard from "@/components/auth-guard";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthGuard>
          {children}
        </AuthGuard>
      </body>
    </html>
  );
}