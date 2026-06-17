import config from "@/config";
import { getAllSlugs } from "@/libs/oraciones";

export default function sitemap() {
  const base = `https://${config.domainName}`;
  const slugs = getAllSlugs();

  return [
    { url: base, priority: 1.0, changeFrequency: "weekly" },
    { url: `${base}/muro`, priority: 0.8, changeFrequency: "daily" },
    { url: `${base}/nueva-peticion`, priority: 0.8, changeFrequency: "weekly" },
    { url: `${base}/comunidad`, priority: 0.7, changeFrequency: "weekly" },
    { url: `${base}/oraciones`, priority: 0.9, changeFrequency: "monthly" },
    ...slugs.map((slug) => ({
      url: `${base}/oraciones/${slug}`,
      priority: 0.8,
      changeFrequency: "monthly",
    })),
  ];
}
