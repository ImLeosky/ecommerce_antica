import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { cormorantGaramond, montserrat, abrilFatface } from "../fonts";
import "../globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { getCmsMedia } from "@/lib/cms";

import { Toaster } from "@repo/ui/toast";

export default async function LocaleLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { children } = props;
  const { locale } = await props.params;
  const messages = await getMessages();

  // Fetch CMS Global Media
  // @cms-group "Identidad Visual" @cms-label "Logo de la Marca (Header)"
  const logoUrl = (await getCmsMedia("site_logo", "")) as string;
  // @cms-group "Identidad Visual" @cms-label "Favicon / Icono del sitio"
  const faviconUrl = (await getCmsMedia(
    "site_favicon",
    "/favicon/favicon.ico?v=1",
  )) as string;

  return (
    <html
      lang={locale}
      className={`${cormorantGaramond.variable} ${montserrat.variable} ${abrilFatface.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Favicon dinámico desde CMS */}
        <link rel="icon" type="image/x-icon" href={faviconUrl} />
        {faviconUrl === "/favicon/favicon.ico?v=1" && (
          <>
            <link
              rel="icon"
              type="image/png"
              sizes="32x32"
              href="/favicon/favicon-32x32.png?v=1"
            />
            <link
              rel="icon"
              type="image/png"
              sizes="16x16"
              href="/favicon/favicon-16x16.png?v=1"
            />
            <link
              rel="apple-touch-icon"
              sizes="180x180"
              href="/favicon/apple-touch-icon.png?v=1"
            />
          </>
        )}
        <link rel="manifest" href="/favicon/site.webmanifest?v=1" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Antica M&M - Café de Especialidad" />
        <meta
          property="og:description"
          content="Descubre el mejor café del sur de Colombia en Antica M&M"
        />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta
          property="twitter:title"
          content="Antica M&M - Café de Especialidad"
        />
        <meta
          property="twitter:description"
          content="Descubre el mejor café del sur de Colombia en Antica M&M"
        />
      </head>
      <body>
        <ThemeProvider>
          <NextIntlClientProvider messages={messages} locale={locale}>
            <Header logoUrl={logoUrl} />
            {children}
            <Footer locale={locale} />
            <Toaster position="bottom-right" expand={false} richColors />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
