import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Bebas_Neue, Cairo } from "next/font/google";
import { AppLoader } from "@/components/shared/app-loader";
import { NavProgress } from "@/components/shared/nav-progress";
import { ConfirmDialogProvider } from "@/components/shared/confirm-dialog-provider";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { ThemedToaster } from "@/components/shared/themed-toaster";
import "./globals.css";

/*
 * Fonts on Google → next/font/google + CSS variables on <html>.
 * Satoshi is not in that catalog; it is loaded in globals.css (Fontshare).
 */
const cairo = Cairo({ subsets: ["arabic", "latin"], variable: "--font-cairo-src" });
const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-chillax-src"
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'Black Mamba - E-Commerce',
  description: 'Black Mamba multi-language e-commerce platform',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={dir}
      className={`dark ${cairo.variable} ${bebasNeue.variable}`}
      suppressHydrationWarning
    >
      <body dir={dir} className="bg-background text-foreground antialiased">
        <ThemeProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <NavProgress />
            <AppLoader />
            {children}
            <ThemedToaster />
            <ConfirmDialogProvider />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
