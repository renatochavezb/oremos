import config from "@/config";

export function getSiteUrl() {
  const base =
    process.env.NODE_ENV === "development"
      ? process.env.NEXTAUTH_URL || "http://localhost:3001"
      : `https://${config.domainName}`;

  return base.replace(/\/$/, "");
}

function toAbsoluteUrl(path) {
  if (!path) return getSiteUrl();
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${getSiteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

// These are all the SEO tags you can add to your pages.
// It prefills data with default title/description/OG, etc.. and you can cusotmize it for each page.
// It's already added in the root layout.js so you don't have to add it to every pages
// But I recommend to set the canonical URL for each page (export const metadata = getSEOTags({canonicalUrlRelative: "/"});)
// See https://shipfa.st/docs/features/seo
export const getSEOTags = ({
  title,
  description,
  keywords,
  openGraph,
  canonicalUrlRelative,
  extraTags,
} = {}) => {
  return {
    // up to 50 characters (what does your app do for the user?) > your main should be here
    title: title || `${config.appName} — Comunidad de Oración en Español`,
    // up to 160 characters (how does your app help the user?)
    description:
      description ||
      "Pide oración, miles rezan por ti. Comunidad de oración católica en México y LatAm.",
    // some keywords separated by commas. by default it will be your app name
    keywords: keywords || [
      "oración",
      "orar",
      "comunidad de oración",
      "oraciones católicas",
      "peticiones de oración",
    ],
    applicationName: config.appName,
    // set a base URL prefix for other fields that require a fully qualified URL (.e.g og:image: og:image: 'https://yourdomain.com/share.png' => '/share.png')
    metadataBase: new URL(`${getSiteUrl()}/`),

    // Static favicon and icons
    icons: {
      icon: [
        { url: "/brand/oremos-favicon-16.png", sizes: "16x16", type: "image/png" },
        { url: "/brand/oremos-favicon-32.png", sizes: "32x32", type: "image/png" },
        { url: "/brand/oremos-favicon-48.png", sizes: "48x48", type: "image/png" },
        { url: "/brand/oremos-favicon.png", sizes: "512x512", type: "image/png" },
      ],
      shortcut: "/brand/oremos-favicon-32.png",
      apple: "/apple-icon.png",
    },

    openGraph: {
      title: openGraph?.title || `${config.appName} — Comunidad de Oración en Español`,
      description:
        openGraph?.description ||
        "Pide oración, miles rezan por ti. Comunidad de oración católica en México y LatAm.",
      url: openGraph?.url ? toAbsoluteUrl(openGraph.url) : `${getSiteUrl()}/`,
      siteName: config.appName,
      images: [
        {
          url: "/opengraph-image.png",
          width: 1200,
          height: 630,
        },
      ],
      locale: "es_MX",
      type: "website",
    },

    twitter: {
      title: openGraph?.title || `${config.appName} — Comunidad de Oración en Español`,
      description:
        openGraph?.description ||
        "Pide oración, miles rezan por ti. Comunidad de oración católica en México y LatAm.",
      images: ["/twitter-image.png"],
      card: "summary_large_image",
    },

    // Absolute canonical avoids www/non-www mismatches from metadataBase alone
    ...(canonicalUrlRelative && {
      alternates: { canonical: toAbsoluteUrl(canonicalUrlRelative) },
    }),

    // If you want to add extra tags, you can pass them here
    ...extraTags,
  };
};

// Strctured Data for Rich Results on Google. Learn more: https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
// Find your type here (SoftwareApp, Book...): https://developers.google.com/search/docs/appearance/structured-data/search-gallery
// Use this tool to check data is well structure: https://search.google.com/test/rich-results
// You don't have to use this component, but it increase your chances of having a rich snippet on Google.
// I recommend this one below to your /page.js for software apps: It tells Google your AppName is a Software, and it has a rating of 4.8/5 from 12 reviews.
// Fill the fields with your own data
// See https://shipfa.st/docs/features/seo
export const renderSchemaTags = () => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "http://schema.org",
          "@type": "SoftwareApplication",
          name: config.appName,
          description: config.appDescription,
          image: `${getSiteUrl()}/brand/oremos-favicon.png`,
          url: `${getSiteUrl()}/`,
          author: {
            "@type": "Person",
            name: "Marc Lou",
          },
          datePublished: "2023-08-01",
          applicationCategory: "EducationalApplication",
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.8",
            ratingCount: "12",
          },
          offers: [
            {
              "@type": "Offer",
              price: "9.00",
              priceCurrency: "USD",
            },
          ],
        }),
      }}
    ></script>
  );
};

export function getOracionSchema(oracion) {
  const pageUrl = `${getSiteUrl()}/oraciones/${oracion.slug}`;
  const titulo = oracion.titulo || oracion.title;
  const description = oracion.descripcionSeo || "";
  const texto = oracion.texto || oracion.text || "";

  const author =
    oracion.isCommunity && oracion.userName
      ? { "@type": "Person", name: oracion.userName }
      : { "@type": "Organization", name: config.appName, url: getSiteUrl() };

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${pageUrl}#article`,
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": pageUrl,
        },
        headline: titulo,
        name: titulo,
        description,
        articleBody: texto,
        inLanguage: "es-MX",
        url: pageUrl,
        image: `${getSiteUrl()}/opengraph-image.png`,
        author,
        publisher: {
          "@type": "Organization",
          name: config.appName,
          url: getSiteUrl(),
          logo: {
            "@type": "ImageObject",
            url: `${getSiteUrl()}/brand/oremos-favicon.png`,
          },
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Inicio",
            item: getSiteUrl(),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Oraciones",
            item: `${getSiteUrl()}/oraciones`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: titulo,
            item: pageUrl,
          },
        ],
      },
    ],
  };
}

export function renderOracionSchema(oracion) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(getOracionSchema(oracion)),
      }}
    />
  );
}
