const config = {
  // REQUIRED
  appName: "oremosya",
  // REQUIRED: a short description of your app for SEO tags (can be overwritten)
  appDescription:
    "Conecta tu petición con personas dispuestas a orar por ti. Únete a una comunidad global dedicada a la intercesión y el apoyo mutuo.",
  // REQUIRED (no https://, not trialing slash at the end, just the naked domain)
  domainName: "oremosya.com",
  crisp: {
    // Crisp website ID. IF YOU DON'T USE CRISP: just remove this => Then add a support email in this config file (resend.supportEmail) otherwise customer support won't work.
    id: "",
    // Hide Crisp by default, except on route "/". Crisp is toggled with <ButtonSupport/>. If you want to show Crisp on every routes, just remove this below
    onlyShowOnRoutes: ["/"],
  },
  stripe: {
    // Create multiple plans in your Stripe dashboard, then add them here. You can add as many plans as you want, just make sure to add the priceId
    plans: [
      {
        // REQUIRED — we use this to find the plan in the webhook (for instance if you want to update the user's credits based on the plan)
        priceId:
          process.env.NODE_ENV === "development"
            ? "price_premium_dev"
            : "price_premium_prod",
        isFeatured: true,
        //  REQUIRED - Name of the plan, displayed on the pricing page
        name: "Plan Premium",
        // A friendly description of the plan, displayed on the pricing page. Tip: explain why this plan and not others
        description: "Conexión más profunda y peticiones privadas ilimitadas",
        // The price you want to display, the one user will be charged on Stripe.
        price: 3.99,
        // If you have an anchor price (i.e. $29) that you want to display crossed out, put it here. Otherwise, leave it empty
        priceAnchor: 5.99,
        features: [
          { name: "Peticiones privadas ilimitadas" },
          { name: "Creación de grupos propios" },
          { name: "Historial completo de fe" },
          { name: "Insignia de benefactor" },
        ],
      },
      {
        priceId:
          process.env.NODE_ENV === "development"
            ? "price_church_dev"
            : "price_church_prod",
        name: "Plan Iglesias",
        description: "Para comunidades y congregaciones locales",
        price: 29.99,
        priceAnchor: 49.99,
        features: [
          { name: "Espacio propio para la iglesia" },
          { name: "Muro privado y estadísticas" },
          { name: "Branding personalizado" },
        ],
      },
    ],
  },
  aws: {
    // If you use AWS S3/Cloudfront, put values in here
    bucket: "bucket-name",
    bucketUrl: `https://bucket-name.s3.amazonaws.com/`,
    cdn: "https://cdn-id.cloudfront.net/",
  },
  resend: {
    // REQUIRED — Email 'From' field to be used when sending magic login links
    fromNoReply: `oremosya <noreply@resend.oremos.net>`,
    // REQUIRED — Email 'From' field to be used when sending other emails, like abandoned carts, updates etc..
    fromAdmin: `oremosya team <team@resend.oremos.net>`,
    // Email shown to customer if need support. Leave empty if not needed => if empty, set up Crisp above, otherwise you won't be able to offer customer support."
    supportEmail: "support@oremos.net",
  },
  colors: {
    // REQUIRED — The DaisyUI theme to use (added to the main layout.js). Leave blank for default (light & dark mode). If you any other theme than light/dark, you need to add it in config.tailwind.js in daisyui.themes.
    theme: "oremos",
    // REQUIRED — This color will be reflected on the whole app outside of the document (loading bar, Chrome tabs, etc..). By default it takes the primary color from your DaisyUI theme (make sure to update your the theme name after "data-theme=")
    // OR you can just do this to use a custom color: main: "#f37055". HEX only.
    main: "#3d5f7c", // Uses the primary color of Oremos
  },
  brand: {
    icon: "/brand/oremos-favicon.png",
    iconMark: "/brand/oremos-icon-mark.png",
    wordmark: "/brand/oremosya-wordmark.svg",
    logo: "/brand/oremosya-wordmark.svg",
    wordmarkGold: "#C4A35A",
  },
  auth: {
    // REQUIRED — the path to log in users. It's use to protect private routes (like /dashboard). It's used in apiClient (/libs/api.js) upon 401 errors from our API
    loginUrl: "/auth/signin",
    callbackUrl: "/comunidad",
  },
};

export default config;
