import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Prof. AMR - Direito & Artigos",
    template: "%s | Prof. AMR",
  },
  description:
    "Blog jurídico com artigos especializados, análises de casos e uma wiki completa para estudantes e profissionais do Direito.",
  keywords: [
    "direito",
    "artigos jurídicos",
    "advocacia",
    "lei",
    "jurisprudência",
    "wiki jurídica",
  ],
  authors: [{ name: "Prof. AMR" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Prof. AMR - Direito & Artigos",
    images: [
      {
        url: "/images/prof_amr_logo.png",
        alt: "Prof. AMR - Direito & Artigos",
      },
    ],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
