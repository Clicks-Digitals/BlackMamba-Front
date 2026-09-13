import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Cairo, Inter } from "next/font/google";
import { AppLoader } from "@/components/shared/app-loader";
import { NavProgress } from "@/components/shared/nav-progress";
import { ConfirmDialogProvider } from "@/components/shared/confirm-dialog-provider";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { ThemedToaster } from "@/components/shared/themed-toaster";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter-src",
});
const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo-src",
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
      className={`${inter.variable} ${cairo.variable}`}
      suppressHydrationWarning
    >
      <body dir={dir} className="bg-background text-foreground antialiased" suppressHydrationWarning>
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
