import Script from "next/script";
import { GA_MEASUREMENT_ID, META_PIXEL_ID, isGaEnabled, isPixelEnabled } from "../lib/config";

/**
 * Installs gtag.js and the Meta Pixel.
 *
 * The small stub for each vendor is a plain inline <script>, so it runs while
 * the document is parsed - before React hydrates. That matters: the trackers
 * fire from mount effects (landing page_view, and ViewContent when someone
 * lands straight on a product page), which run at hydration. A `next/script`
 * with `afterInteractive` is injected *after* hydration, so those first events
 * would find `window.gtag` / `window.fbq` undefined and be dropped silently.
 *
 * Both stubs queue commands internally, so events recorded before the real SDK
 * finishes downloading are replayed once it loads. Only the heavy SDK itself is
 * deferred, which is what keeps it off the critical path.
 *
 * GA's automatic page_view is disabled and the Meta snippet's usual
 * `fbq('track', 'PageView')` is omitted: <AnalyticsProvider> sends both, so
 * App Router client-side navigations are counted exactly once each.
 */
export function AnalyticsScripts() {
  return (
    <>
      {isGaEnabled && (
        <>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = gtag;
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });
              `,
            }}
          />
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
        </>
      )}

      {isPixelEnabled && (
        <>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window,document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${META_PIXEL_ID}');
              `,
            }}
          />
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              alt=""
              src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
            />
          </noscript>
        </>
      )}
    </>
  );
}
