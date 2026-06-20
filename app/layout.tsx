import type { Metadata } from "next";
import { Baloo_2, Nunito_Sans } from "next/font/google";
import "./globals.css";

const baloo2 = Baloo_2({
  variable: "--font-baloo2",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kan Elis äta detta?",
  description:
    "Hjälper familjen avgöra om en produkt är säker för Elis som har celiaki.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="sv"
      className={`${baloo2.variable} ${nunitoSans.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col font-body text-ink"
        style={{ background: "linear-gradient(160deg,#d8f0ec,#eef9f7)" }}
      >
        {children}
      </body>
    </html>
  );
}
