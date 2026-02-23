import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ArchiSuite",
  description: "Inteligência Artificial em cada etapa do seu projeto",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
