module.exports = {
  siteUrl: process.env.SITE_URL || "https://oremos.net",
  generateRobotsTxt: true,
  exclude: [
    "/twitter-image.*",
    "/opengraph-image.*",
    "/icon.*",
    "/oraciones",
    "/oraciones/*",
  ],
};
