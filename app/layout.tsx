'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import AuthGuard from "@/components/auth-guard";
import FirebaseSetupAlert from "@/components/firebase-setup-alert";

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
          <FirebaseSetupAlert />
          {children}
        </AuthGuard>
      </body>
    </html>
  );
}