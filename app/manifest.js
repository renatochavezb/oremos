import config from "@/config";

export default function manifest() {
  return {
    name: config.appName,
    short_name: config.appName,
    description: config.appDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#FDFBF7",
    theme_color: config.colors.main,
    lang: "es",
    icons: [
      {
        src: "/brand/oremos-icon-app.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/brand/oremos-favicon-48.png",
        sizes: "48x48",
        type: "image/png",
      },
    ],
  };
}
