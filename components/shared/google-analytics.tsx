"use client";

import * as React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { GA_ID, pageview } from "@/lib/analytics";

export function GoogleAnalytics() {
  return (
    <React.Suspense fallback={null}>
      <GoogleAnalyticsInner />
    </React.Suspense>
  );
}

function GoogleAnalyticsInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [consented, setConsented] = React.useState(false);

  React.useEffect(() => {
    if (!GA_ID) return;
    setConsented(true);
  }, []);

  React.useEffect(() => {
    if (!consented || !GA_ID) return;
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    pageview(url);
  }, [pathname, searchParams, consented]);

  if (!GA_ID) return null;

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
      />
      <Script
        id="ga-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', { page_path: window.location.pathname });
          `,
        }}
      />
    </>
  );
}
