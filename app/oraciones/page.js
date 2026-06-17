import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { oraciones } from "@/libs/oraciones";
import { getSEOTags } from "@/libs/seo";

export const metadata = getSEOTags({
  title: "Oraciones Católicas en Español | Oremos",
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
    title: "Oraciones Católicas en Español | Oremos",
    description:
      "Encuentra oraciones para cada momento y necesidad. Reza solo o pide a la comunidad que rece contigo.",
    locale: "es_MX",
    type: "website",
  },
});

export default function OracionesHub() {
  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-6 md:px-12 py-12 md:py-20 font-sans min-h-screen">
        <section className="mb-12 text-center">
          <span className="inline-block px-3 py-1 mb-4 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider rounded-full">
            Oraciones
          </span>
          <h1 className="font-display text-4xl text-primary mb-4 font-medium">
            Oraciones Católicas en Español
          </h1>
          <p className="text-base-content/70 text-sm md:text-base leading-relaxed max-w-xl mx-auto">
            Encuentra la oración que necesitas hoy. Reza solo o pide a la comunidad que rece contigo.
          </p>
        </section>

        <div className="grid gap-4">
          {oraciones.map((oracion) => (
            <Link
              key={oracion.slug}
              href={`/oraciones/${oracion.slug}`}
              className="bg-base-100 border border-base-content/5 rounded-2xl p-6 hover:shadow-md hover:border-primary/20 transition-all group"
            >
              <h2 className="font-display text-xl text-primary group-hover:text-primary/80 transition-colors">
                {oracion.titulo}
              </h2>
              <p className="text-base-content/60 text-sm mt-2 leading-relaxed">
                {oracion.descripcionSeo}
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-secondary mt-4 group-hover:underline">
                Leer oración
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </span>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
