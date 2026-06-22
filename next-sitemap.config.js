module.exports = {
  siteUrl: process.env.SITE_URL || "https://www.oremosya.com",
  generateRobotsTxt: true,
  exclude: [
    "/twitter-image.*",
    "/opengraph-image.*",
    "/icon.*",
    "/oraciones",
    "/oraciones/*",
  ],
};
