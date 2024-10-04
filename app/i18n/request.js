import { getRequestConfig } from "next-intl/server";
import { cookies } from 'next/headers';

export default getRequestConfig(async () => {
  // Provide a default locale
  const defaultLocale = 'en';
  const supportedLocales = ['en', 'hi'];

  // Retrieve the locale from headers (sent by the client) or fallback to default
  const localeFromCookie = cookies().get('locale')?.value || defaultLocale;

  // Determine the final locale to use
  const locale = supportedLocales.includes(localeFromCookie) ? localeFromCookie : defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
