import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { MaterialThemeProvider } from "../components/material-theme-provider";
import "./globals.css";

const bodyFont = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-body"
});

export const metadata: Metadata = {
  title: "LODO LAND",
  description: "Experiencias, tickets, rifas, quinielas y promociones en una sola plataforma."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={bodyFont.variable}>
        <MaterialThemeProvider>{children}</MaterialThemeProvider>
      </body>
    </html>
  );
}
