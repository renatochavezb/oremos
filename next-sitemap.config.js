module.exports = {
  siteUrl: process.env.SITE_URL || "https://oremos-chi.vercel.app",
  generateRobotsTxt: true,
  exclude: [
    "/twitter-image.*",
    "/opengraph-image.*",
    "/icon.*",
    "/oraciones",
    "/oraciones/*",
  ],
};
