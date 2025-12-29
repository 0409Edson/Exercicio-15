import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppLayout from "@/components/layout/AppLayout";
import { AuthProvider } from "@/contexts/AuthContext";
import AIChatWidget from "@/components/ai/AIChatWidget";
import VoiceAssistant from "@/components/ai/VoiceAssistant";
import ProactiveNotifications from "@/components/ai/ProactiveNotifications";
import SuggestionsWidget from "@/components/ai/SuggestionsWidget";
import { GlobalSearchButton } from "@/components/search";
import { AuthGuard } from "@/components/auth";
import Script from "next/script";
import AppInitializer from "@/components/AppInitializer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#14b8a6",
};

export const metadata: Metadata = {
  title: "Life Matriz - Sistema Operacional da Vida",
  description: "Seu sistema operacional pessoal com IA para gestão integral da vida: objetivos, finanças, saúde, carreira e rotina.",
  keywords: ["life matriz", "produtividade", "gestão de vida", "IA", "objetivos", "finanças", "saúde"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Life Matriz",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "application-name": "Life Matriz",
    "apple-mobile-web-app-title": "Life Matriz",
    "msapplication-TileColor": "#14b8a6",
    "msapplication-tap-highlight": "no",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AuthProvider>
          <AppInitializer />
          <AuthGuard>
            <AppLayout>{children}</AppLayout>
            <GlobalSearchButton />
            <VoiceAssistant />
            <ProactiveNotifications />
          </AuthGuard>
        </AuthProvider>

        {/* Service Worker Registration */}
        <Script id="sw-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(
                  function(registration) {
                    console.log('ServiceWorker registration successful');
                  },
                  function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  }
                );
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
