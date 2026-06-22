import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import OracionActions from "@/components/OracionActions";
import { getOracionBySlug, getAllSlugs, oraciones } from "@/libs/oraciones";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";
import connectMongo from "@/libs/mongoose";
import CommunityPrayer from "@/models/CommunityPrayer";
import StaticPrayerCount from "@/models/StaticPrayerCount";
import { auth } from "@/libs/auth";

async function getOracion(slug) {
  // 1. Try static prayers
  const staticOracion = getOracionBySlug(slug);
  if (staticOracion) {
    let count = 0;
    try {
      await connectMongo();
      const stats = await StaticPrayerCount.findOne({ slug }).lean();
      count = stats?.count || 0;
    } catch (error) {
      console.error("Error loading static prayer count:", error);
    }
    return {
      ...staticOracion,
      prayersCount: count,
      isCommunity: false,
    };
  }

  // 2. Try community prayers from database
  try {
    await connectMongo();
    const dbOracion = await CommunityPrayer.findOne({ slug }).lean();
    if (dbOracion) {
      return {
        slug: dbOracion.slug,
        titulo: dbOracion.title,
        keyword: "oración de la comunidad",
        descripcionSeo: `Oración escrita por la comunidad: ${dbOracion.title}. Reza con nosotros en ${config.appName}.`,
        texto: dbOracion.text,
        categoria: dbOracion.category,
        userName: dbOracion.userName,
        prayersCount: dbOracion.prayersCount || 0,
        relacionadas: [],
        id: dbOracion._id.toString(),
        isCommunity: true,
        user: dbOracion.user ? dbOracion.user.toString() : null,
      };
    }
  } catch (error) {
    console.error("Error loading community prayer in page:", error);
  }
  return null;
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const oracion = await getOracion(slug);
  if (!oracion) return {};

  return getSEOTags({
    title: `${oracion.titulo || oracion.title} | ${config.appName}`,
    description: oracion.descripcionSeo,
    keywords: [oracion.keyword || "oración", "oración de la comunidad", "oraciones en español"],
    canonicalUrlRelative: `/oraciones/${oracion.slug}`,
    openGraph: {
      title: `${oracion.titulo || oracion.title} | ${config.appName}`,
      description: oracion.descripcionSeo,
      locale: "es_MX",
      type: "article",
    },
  });
}

export default async function OracionPage({ params }) {
  const { slug } = await params;
  const session = await auth();
  const oracion = await getOracion(slug);
  if (!oracion) notFound();

  const relacionadas = (oracion.relacionadas || [])
    .map((relSlug) => oraciones.find((o) => o.slug === relSlug))
    .filter(Boolean);

  const isOwner = oracion.isCommunity && session?.user && oracion.user && oracion.user === session.user.id;
  const isAdmin = session?.user?.role === "admin";
  const showDelete = oracion.isCommunity && (isOwner || isAdmin);

  let communityVersions = [];
  if (!oracion.isCommunity) {
    try {
      await connectMongo();
      communityVersions = await CommunityPrayer.find({ category: slug }).sort({ createdAt: -1 }).lean();
    } catch (error) {
      console.error("Error loading community versions in details page:", error);
    }
  }

  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-6 md:px-12 py-12 md:py-20 font-sans min-h-screen">
        {/* Main Prayer Card (Mockup style using brand colors - Glassmorphic) */}
        <div className="bg-white/40 backdrop-blur-xl rounded-3xl p-8 md:p-12 mb-8 border border-white/60 text-primary shadow-lg relative overflow-hidden">
          {/* Subtle brand glow effects */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary/5 rounded-full blur-[100px] -ml-20 -mb-20 pointer-events-none"></div>

          {/* Header containing title and author */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-8 pb-5 border-b border-primary/10 relative z-10 font-sans">
            <h1 className="text-primary/60 text-[11px] uppercase tracking-widest font-bold">
              {oracion.titulo}
            </h1>
            {oracion.isCommunity && (
              <span className="text-primary/50 text-xs">
                Escrita por <span className="font-semibold text-primary/80">{oracion.userName}</span>
              </span>
            )}
          </div>

          {/* Prayer text (upright serif, elegant) */}
          <div className="text-primary/95 font-display text-lg md:text-xl leading-relaxed mb-10 whitespace-pre-line relative z-10">
            {oracion.texto}
          </div>

          {/* Action buttons inside the card */}
          <div className="relative z-10 pt-4 border-t border-primary/5">
            <OracionActions
              titulo={oracion.titulo}
              texto={oracion.texto}
              slug={oracion.slug}
              id={oracion.id}
              isCommunity={oracion.isCommunity}
              initialPrayersCount={oracion.prayersCount}
              showDelete={showDelete}
            />
          </div>
        </div>

        <div className="bg-primary/5 border border-primary/15 rounded-2xl p-6 md:p-8 mb-10 text-center">
          <p className="text-base-content/50 text-xs uppercase tracking-wider font-bold mb-1">
            Hoy en {config.appName}
          </p>
          <p className="font-display text-3xl text-primary font-medium mb-4">
            {oracion.prayersCount || 0} personas rezaron esto
          </p>
          <p className="text-base-content/70 text-sm mb-6 leading-relaxed max-w-md mx-auto">
            ¿Tienes una intención especial? Pide a la comunidad que rece por ti.
          </p>
          <Link
            href="/nueva-peticion"
            className="btn btn-primary rounded-full font-bold px-8 shadow-md"
          >
            Pedir oración para mí
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </Link>
        </div>

        {/* Community Versions Section */}
        {communityVersions.length > 0 && (
          <section className="mb-12 border-t border-base-content/5 pt-10">
            <h2 className="font-display text-2xl text-primary font-medium mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">groups</span>
              Versiones de la Comunidad
            </h2>
            <div className="grid gap-4">
              {communityVersions.map((version) => (
                <div
                  key={version._id.toString()}
                  className="bg-base-200/40 border border-base-content/5 rounded-2xl p-6 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="font-display text-lg text-primary font-medium">
                        {version.title}
                      </h3>
                      <span className="px-2.5 py-0.5 bg-secondary/10 text-secondary text-[9px] uppercase font-bold tracking-wider rounded font-sans shrink-0">
                        Por: {version.userName || "Anónimo"}
                      </span>
                    </div>
                    <p className="text-base-content/75 text-sm mt-3 leading-relaxed whitespace-pre-line italic font-display">
                      &ldquo;{version.text}&rdquo;
                    </p>
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-base-content/5">
                    <span className="text-xs text-base-content/50 font-sans flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs text-secondary">favorite</span>
                      {version.prayersCount || 0} personas se unieron
                    </span>
                    <Link
                      href={`/oraciones/${version.slug}`}
                      className="btn btn-ghost btn-xs text-secondary hover:underline font-bold font-sans flex items-center gap-0.5"
                    >
                      Ver página dedicada
                      <span className="material-symbols-outlined text-xs">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {relacionadas.length > 0 && (
          <section>
            <h2 className="font-display text-xl text-primary font-medium mb-4">
              Oraciones relacionadas
            </h2>
            <div className="grid gap-3">
              {relacionadas.map((rel) => (
                <Link
                  key={rel.slug}
                  href={`/oraciones/${rel.slug}`}
                  className="bg-base-100 border border-base-content/5 rounded-xl p-4 hover:border-primary/20 hover:shadow-sm transition-all flex items-center justify-between group"
                >
                  <span className="font-semibold text-base-content group-hover:text-primary transition-colors">
                    {rel.titulo}
                  </span>
                  <span className="material-symbols-outlined text-primary text-lg">
                    arrow_forward
                  </span>
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
