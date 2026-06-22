import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { oraciones } from "@/libs/oraciones";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";
import connectMongo from "@/libs/mongoose";
import CommunityPrayer from "@/models/CommunityPrayer";
import StaticPrayerCount from "@/models/StaticPrayerCount";

export const metadata = getSEOTags({
  title: `Oraciones | Reza con la Comunidad | ${config.appName}`,
  description:
    "Encuentra oraciones para cada momento y necesidad. Oración de la noche, por los enfermos, por la familia y más.",
  keywords: [
    "oraciones católicas",
    "oraciones en español",
    "oración de la noche",
    "oración por los enfermos",
  ],
  canonicalUrlRelative: "/oraciones",
  openGraph: {
    title: `Oraciones | Reza con la Comunidad | ${config.appName}`,
    description:
      "Encuentra oraciones para cada momento y necesidad. Reza solo o pide a la comunidad que rece contigo.",
    locale: "es_MX",
    type: "website",
  },
});

export default async function OracionesHub() {
  let communityPrayers = [];
  let staticCounts = [];
  try {
    await connectMongo();
    communityPrayers = await CommunityPrayer.find().sort({ createdAt: -1 }).limit(20).lean();
    staticCounts = await StaticPrayerCount.find().lean();
  } catch (error) {
    console.error("Error fetching prayers for page:", error);
  }

  // Map counts to the static prayers list
  const mappedClassicPrayers = oraciones.map((oracion) => {
    const stats = staticCounts.find((sc) => sc.slug === oracion.slug);
    return {
      ...oracion,
      prayersCount: stats?.count || 0,
    };
  });

  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-6 md:px-12 py-12 md:py-20 font-sans min-h-screen">
        <section className="mb-10 text-center">
          <span className="inline-block px-3 py-1 mb-4 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider rounded-full">
            Oraciones
          </span>
          <h1 className="font-display text-4xl text-primary mb-4 font-medium">
            Oraciones | Reza con la Comunidad
          </h1>
          <p className="text-base-content/70 text-sm md:text-base leading-relaxed max-w-xl mx-auto">
            Encuentra la oración que necesitas hoy. Reza solo o explora las oraciones redactadas y compartidas por nuestra comunidad.
          </p>
        </section>

        {/* CTA to Write/Submit Prayer */}
        <div className="bg-primary/5 border border-primary/15 rounded-3xl p-6 md:p-8 mb-12 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-2xl">menu_book</span>
            </div>
            <div>
              <h3 className="font-display text-lg text-primary font-medium">Comparte tu propia oración</h3>
              <p className="text-xs text-base-content/70 mt-1">
                ¿Has escrito una oración inspiradora? Publícala para que otros miembros puedan rezar con ella.
              </p>
            </div>
          </div>
          <Link
            href="/oraciones/nueva"
            className="btn btn-primary rounded-full font-bold px-8 shadow-sm whitespace-nowrap flex items-center gap-1 text-xs tracking-wider"
          >
            Subir mi Oración
            <span className="material-symbols-outlined text-sm">publish</span>
          </Link>
        </div>

        {/* Classic Prayers */}
        <section className="mb-12">
          <h2 className="font-display text-2xl text-primary font-medium mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">auto_stories</span>
            Oraciones Clásicas
          </h2>
          <div className="grid gap-4">
            {mappedClassicPrayers.map((oracion) => (
              <Link
                key={oracion.slug}
                href={`/oraciones/${oracion.slug}`}
                className="bg-base-100 border border-base-content/5 rounded-2xl p-6 hover:shadow-md hover:border-primary/20 transition-all group"
              >
                <h3 className="font-display text-xl text-primary group-hover:text-primary/80 transition-colors">
                  {oracion.titulo}
                </h3>
                <p className="text-base-content/60 text-sm mt-2 leading-relaxed">
                  {oracion.descripcionSeo}
                </p>
                <div className="flex items-center justify-between mt-4">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-secondary group-hover:underline">
                    Leer oración
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </span>
                  <span className="text-xs text-base-content/50 font-sans flex items-center gap-1 font-semibold">
                    <span className="material-symbols-outlined text-xs text-secondary">favorite</span>
                    {oracion.prayersCount || 0} personas se unieron
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Community Prayers */}
        {communityPrayers.length > 0 && (
          <section className="border-t border-base-content/5 pt-12 mt-12">
            <h2 className="font-display text-2xl text-primary font-medium mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">groups</span>
              Oraciones de la Comunidad
            </h2>
            <div className="grid gap-4">
              {communityPrayers.map((oracion) => (
                <Link
                  key={oracion._id.toString()}
                  href={`/oraciones/${oracion.slug}`}
                  className="bg-base-100 border border-base-content/5 rounded-2xl p-6 hover:shadow-md hover:border-secondary/20 transition-all group"
                >
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="font-display text-xl text-primary group-hover:text-primary/80 transition-colors">
                      {oracion.title}
                    </h3>
                    <span className="px-2.5 py-0.5 bg-secondary/10 text-secondary text-[9px] uppercase font-bold tracking-wider rounded font-sans shrink-0">
                      Por: {oracion.userName || "Anónimo"}
                    </span>
                  </div>
                  <p className="text-base-content/65 text-sm mt-2 leading-relaxed line-clamp-2 italic font-display">
                    &ldquo;{oracion.text}&rdquo;
                  </p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-secondary group-hover:underline">
                      Leer oración
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </span>
                    <span className="text-xs text-base-content/50 font-sans flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs text-secondary">favorite</span>
                      {oracion.prayersCount || 0} personas se unieron
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}

