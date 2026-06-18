"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import axios from "axios";
import toast from "react-hot-toast";
import { oraciones } from "@/libs/oraciones";

const categoriesList = [
  { value: "comunidad", label: "Nueva Sección (Crear una Oración Diferente)" },
  ...oraciones.map((o) => ({ value: o.slug, label: o.titulo })),
];

export default function NuevaOracion() {
  const { data: session } = useSession();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [category, setCategory] = useState("comunidad");
  const [userName, setUserName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("El título de la oración es requerido");
      return;
    }
    if (!text.trim()) {
      toast.error("El texto de la oración es requerido");
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post("/api/community-prayers", {
        title,
        text,
        category,
        userName: userName.trim() || undefined,
      });

      toast.success("¡Tu oración ha sido publicada con éxito!");
      router.push(`/oraciones/${response.data.slug}`);
    } catch (error) {
      console.error("Error creating prayer:", error);
      const msg = error.response?.data?.error || "Ocurrió un error al publicar la oración";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-6 md:px-12 py-12 md:py-20 font-sans min-h-screen">
        <section className="mb-10 text-center">
          <Link
            href="/oraciones"
            className="inline-flex items-center gap-1.5 text-xs text-base-content/60 hover:text-primary transition-colors font-bold uppercase tracking-wider mb-4"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Volver a Oraciones
          </Link>
          <h1 className="font-display text-4xl text-primary mb-4 font-medium tracking-tight">
            Escribe una Oración
          </h1>
          <p className="text-base-content/70 text-sm md:text-base leading-relaxed max-w-xl mx-auto">
            Comparte tus palabras de fe con el mundo. Tu oración quedará publicada de manera abierta y permanente para que otros creyentes puedan rezar con ella.
          </p>
        </section>

        <div className="bg-base-100 border border-base-content/5 rounded-3xl p-8 md:p-12 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Title */}
            <div className="flex flex-col gap-2">
              <label htmlFor="title" className="text-xs font-bold text-primary uppercase tracking-widest font-sans">
                Título de la Oración
              </label>
              <input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Oración de fortaleza para las mañanas difíciles"
                type="text"
                className="w-full bg-transparent border-b-2 border-base-content/10 py-3 text-lg font-display placeholder:italic placeholder:opacity-45 focus:outline-none focus:border-primary transition-colors duration-300"
                required
              />
            </div>

            {/* Category */}
            <div className="flex flex-col gap-2">
              <label htmlFor="category" className="text-xs font-bold text-primary uppercase tracking-widest font-sans">
                Categoría / Sección
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="select select-bordered w-full rounded-2xl bg-base-100 border-base-content/15 focus:outline-none focus:border-primary text-sm font-sans"
              >
                {categoriesList.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Text */}
            <div className="flex flex-col gap-2">
              <label htmlFor="text" className="text-xs font-bold text-primary uppercase tracking-widest font-sans">
                Texto de tu Oración
              </label>
              <textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Escribe el texto de tu oración aquí..."
                rows={8}
                className="w-full bg-transparent border-b-2 border-base-content/10 py-3 text-lg font-display placeholder:italic placeholder:opacity-45 focus:outline-none focus:border-primary transition-colors duration-300 resize-none font-sans"
                required
              />
            </div>

            {/* User Name */}
            <div className="flex flex-col gap-2">
              <label htmlFor="userName" className="text-xs font-bold text-primary uppercase tracking-widest font-sans">
                Tu Nombre (Opcional)
              </label>
              <input
                id="userName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder={session?.user?.name ? session.user.name : "Deja en blanco para publicar de forma anónima"}
                type="text"
                className="w-full bg-transparent border-b-2 border-base-content/10 py-3 text-base font-display placeholder:italic placeholder:opacity-45 focus:outline-none focus:border-primary transition-colors duration-300"
              />
              {!session?.user && (
                <p className="text-[10px] text-base-content/50 italic mt-1 font-sans">
                  No has iniciado sesión. Puedes publicar con un alias arriba o iniciar sesión en el menú para vincularlo a tu perfil.
                </p>
              )}
            </div>

            {/* Submit */}
            <div className="pt-4 flex flex-col items-center">
              <button
                type="submit"
                disabled={submitting}
                className="w-full md:w-64 py-4 px-8 bg-primary hover:opacity-95 text-primary-content rounded-full font-bold text-xs tracking-widest uppercase transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <>
                    <span>PUBLICAR ORACIÓN</span>
                    <span className="material-symbols-outlined text-lg">publish</span>
                  </>
                )}
              </button>
              <p className="mt-3 text-xs text-base-content/50 italic text-center font-sans">
                Una vez publicada, tu oración tendrá su propia página web indexable por buscadores.
              </p>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
