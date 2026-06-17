import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import OracionActions from "@/components/OracionActions";
import { getOracionBySlug, getAllSlugs, oraciones } from "@/libs/oraciones";
import { getSEOTags } from "@/libs/seo";

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const oracion = getOracionBySlug(slug);
  if (!oracion) return {};

  return getSEOTags({
    title: `${oracion.titulo} | Oremos`,
    description: oracion.descripcionSeo,
    keywords: [oracion.keyword, "oración católica", "oraciones en español"],
    canonicalUrlRelative: `/oraciones/${oracion.slug}`,
    openGraph: {
      title: `${oracion.titulo} | Oremos`,
      description: oracion.descripcionSeo,
      locale: "es_MX",
      type: "article",
    },
  });
}

export default async function OracionPage({ params }) {
  const { slug } = await params;
  const oracion = getOracionBySlug(slug);
  if (!oracion) notFound();

  const relacionadas = oracion.relacionadas
    .map((relSlug) => oraciones.find((o) => o.slug === relSlug))
    .filter(Boolean);

  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-6 md:px-12 py-12 md:py-20 font-sans min-h-screen">
        <h1 className="font-display text-4xl text-primary mb-8 font-medium tracking-tight">
          {oracion.titulo}
        </h1>

        <div className="bg-base-200/60 rounded-2xl p-6 md:p-8 mb-4 whitespace-pre-line text-lg leading-relaxed font-display italic text-base-content/85 border border-base-content/5">
          {oracion.texto}
        </div>

        <OracionActions titulo={oracion.titulo} texto={oracion.texto} slug={oracion.slug} />

        <div className="bg-primary/5 border border-primary/15 rounded-2xl p-6 md:p-8 mb-10 text-center">
          <p className="text-base-content/50 text-xs uppercase tracking-wider font-bold mb-1">
            Hoy en Oremos
          </p>
          <p className="font-display text-3xl text-primary font-medium mb-4">
            347 personas rezaron esto
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

        <article className="mb-10 text-base-content/80 leading-relaxed space-y-4">
          <h2 className="font-display text-2xl text-primary font-medium">
            ¿Cuándo rezar esta oración?
          </h2>
          <p>
            La {oracion.keyword} es una de las prácticas más profundas de la fe cristiana.
            Puedes rezarla en cualquier momento, pero es especialmente poderosa cuando
            la haces con intención y en comunidad.
          </p>
          <p>
            En Oremos, miles de personas elevan esta {oracion.keyword} cada día.
            Cuando alguien más reza junto contigo, la oración se multiplica.
          </p>
        </article>

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
