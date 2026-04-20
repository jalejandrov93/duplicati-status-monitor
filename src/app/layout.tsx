import type { Metadata } from "next";
import { Fira_Code } from "next/font/google";

import "./globals.css";
import { Providers } from "@/components/providers";

const firaCode = Fira_Code({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Monitor de Respaldos Duplicati",
  description:
    "Panel de monitoreo en tiempo real para reportes de respaldos de Duplicati",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={firaCode.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
