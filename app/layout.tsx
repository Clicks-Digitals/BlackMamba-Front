import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Bebas_Neue, Cairo } from "next/font/google";
import { Toaster } from "sonner";
import { AppLoader } from "@/components/shared/app-loader";
import { NavProgress } from "@/components/shared/nav-progress";
import { ConfirmDialogProvider } from "@/components/shared/confirm-dialog-provider";
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
    <html lang={locale} dir={dir} className={`${cairo.variable} ${bebasNeue.variable}`}>
      <body dir={dir}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <NavProgress />
          <AppLoader />
          {children}
          <Toaster position="top-center" richColors theme="dark" />
          <ConfirmDialogProvider />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
