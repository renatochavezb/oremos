"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import axios from "axios";
import toast from "react-hot-toast";
import { createRipple } from "@/libs/ripple";
import PrayerPrivacyBadge from "@/components/PrayerPrivacyBadge";
import { ProximamenteBadge } from "@/components/Proximamente";

const categories = ["Salud", "Paz", "Gratitud", "Familia", "Otros"];

function NewPrayerRequestContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Form states
  const [name, setName] = useState("");
  const [activeCategory, setActiveCategory] = useState("Otros");
  const [text, setText] = useState("");
  const [privacyMode, setPrivacyMode] = useState("public"); // public | group | private
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [privateGroups, setPrivateGroups] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!session) return;

    const loadGroups = async () => {
      try {
        const response = await axios.get("/api/groups/private");
        setPrivateGroups(response.data.groups || []);
      } catch (error) {
        console.error("Error loading private groups:", error);
      }
    };

    loadGroups();
  }, [session]);

  // Premium privacy modes are coming soon — ignore query params for private/group
  useEffect(() => {
    const isPrivateParam = searchParams.get("private");
    const groupParam = searchParams.get("group");

    if (isPrivateParam === "true" || groupParam) {
      setPrivacyMode("public");
    }
  }, [searchParams]);

  // Scroll Reveal Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0");
            entry.target.classList.remove("opacity-0", "translate-y-4");
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll("section, .grid > div");
    elements.forEach((el) => {
      el.classList.add("transition-all", "duration-700", "opacity-0", "translate-y-4");
      observer.observe(el);
    });

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  // Sign in gate for guest users (moved below hooks to comply with React Hooks Rules)
  if (status === "unauthenticated") {
    return (
      <section className="max-w-4xl mx-auto px-6 py-24 text-center font-sans min-h-[60vh] flex items-center justify-center">
        <div className="bg-base-100 rounded-3xl p-12 shadow-sm border border-base-content/5 max-w-xl mx-auto">
          <span className="material-symbols-outlined text-[64px] text-primary mb-6">lock_open</span>
          <h2 className="font-display text-3xl text-primary mb-4 font-medium">Comparte tu Petición</h2>
          <p className="text-base-content/70 text-sm mb-8 leading-relaxed">
            Inicia sesión para publicar tu petición de oración y permitir que toda la comunidad ore contigo.
          </p>
          <button
            onClick={() =>
              signIn(undefined, {
                callbackUrl: "/nueva-peticion",
              })
            }
            className="bg-primary text-primary-content hover:bg-primary/95 px-8 py-3 rounded-full font-bold shadow-md cursor-pointer inline-flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">login</span>
            Iniciar Sesión
          </button>
        </div>
      </section>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!text.trim()) {
      toast.error("El texto de la petición es requerido");
      return;
    }

    if (privacyMode === "group" && !selectedGroupId) {
      toast.error("Selecciona un grupo privado o crea uno en Grupos Privados");
      return;
    }

    setSubmitting(true);
    try {
      const isAnonymous = name.trim() === "";
      await axios.post("/api/prayers", {
        text,
        category: activeCategory,
        isPublic: privacyMode === "public",
        isAnonymous,
        groupId: privacyMode === "group" ? selectedGroupId : undefined,
      });

      if (privacyMode === "public") {
        toast.success("Tu petición ha sido compartida. La paz sea contigo.");
        router.push("/muro");
      } else if (privacyMode === "group") {
        toast.success("Tu petición fue compartida con tu círculo privado.");
        router.push(`/grupos-privados`);
      } else {
        toast.success(
          "Tu petición confidencial fue recibida. Nuestro equipo de intercesión orará por ti."
        );
        router.push("/");
      }
    } catch (error) {
      console.error("Error creating prayer:", error);
      const msg =
        error.response?.data?.error ||
        (error.code === "ECONNABORTED"
          ? "La solicitud tardó demasiado. Verifica tu conexión e intenta de nuevo."
          : "Error al enviar la petición. Intenta de nuevo en unos segundos.");
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <main className="pt-12 pb-32 min-h-screen px-6 md:px-12 max-w-7xl mx-auto">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 bg-secondary-container/30 text-secondary rounded-full mb-6 font-sans text-xs font-bold shadow-sm">
            Santuario Seguro
          </div>
          <h2 className="font-display text-4xl md:text-5xl text-primary mb-4 font-medium">No estás solo.</h2>
          <p className="font-display text-lg md:text-2xl text-base-content/75 max-w-xl mx-auto italic">
            &ldquo;Comparte tu corazón. Cada susurro es escuchado en la quietud.&rdquo;
          </p>
        </section>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start font-sans">
          
          {/* Left Side: Visual Card */}
          <div className="hidden lg:block lg:col-span-4 sticky top-32">
            <div className="rounded-2xl overflow-hidden aspect-[3/4] shadow-lg relative border border-base-content/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="Atmósfera de paz"
                className="w-full h-full object-cover opacity-80"
                src="/atmosfera_paz.png"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent"></div>
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <p className="font-display text-xl italic mb-2">Hallando la Calma</p>
                <p className="text-xs opacity-90 leading-relaxed font-sans">
                  En la unión de los corazones, hay una fuerza que trasciende la nuestra.
                </p>
              </div>
            </div>
            
            <div className="mt-8 p-6 bg-base-200/50 rounded-xl border border-base-content/5 text-center text-xs italic text-base-content/70">
              Mantenemos este santuario libre de anuncios gracias a almas generosas.{" "}
              <Link href="/apoyo" className="text-primary font-bold underline">
                Apoya nuestra misión.
              </Link>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="lg:col-span-8">
            <div
              className={`shadow-sm hover:shadow-md border rounded-3xl p-8 md:p-12 transition-all duration-300 ${
                privacyMode === "public" ? "bg-base-100 border-base-content/5" : "prayer-form-private"
              }`}
            >
              {privacyMode === "private" && (
                <div className="mb-8 p-4 rounded-2xl prayer-private-notice flex items-start gap-3">
                  <span className="material-symbols-outlined text-secondary text-xl mt-0.5">lock</span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <PrayerPrivacyBadge size="md" />
                    </div>
                    <p className="text-sm text-base-content/75 leading-relaxed">
                      Esta petición será confidencial. Solo nuestro equipo de intercesión la recibirá; no aparecerá en el muro público.
                    </p>
                  </div>
                </div>
              )}

              {privacyMode === "group" && (
                <div className="mb-8 p-4 rounded-2xl bg-secondary/5 border border-secondary/15 flex items-start gap-3">
                  <span className="material-symbols-outlined text-secondary text-xl mt-0.5">groups</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-base-content mb-3">Compartir con tu círculo privado</p>
                    {privateGroups.length === 0 ? (
                      <Link href="/grupos-privados" className="text-sm text-primary font-bold underline">
                        Crea un grupo e invita contactos
                      </Link>
                    ) : (
                      <select
                        value={selectedGroupId}
                        onChange={(e) => setSelectedGroupId(e.target.value)}
                        className="select select-bordered select-sm w-full max-w-md"
                      >
                        {privateGroups.map((group) => (
                          <option key={group.id} value={group.id}>
                            {group.name}
                          </option>
                        ))}
                      </select>
                    )}
                    <p className="text-xs text-base-content/60 mt-2">
                      Solo los miembros invitados verán esta petición.{" "}
                      <Link href="/grupos-privados" className="text-primary font-semibold underline">
                        Gestionar grupos
                      </Link>
                    </p>
                  </div>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-10">
                
                {/* Name Input */}
                <div className="flex flex-col gap-3">
                  <label className="text-xs font-bold text-primary uppercase tracking-widest font-sans" htmlFor="name">
                    TU NOMBRE (OPCIONAL)
                  </label>
                  <input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Deja en blanco para permanecer anónimo"
                    type="text"
                    className="w-full bg-transparent border-b-2 border-base-content/10 py-3 text-lg font-display placeholder:italic placeholder:opacity-45 focus:outline-none focus:border-primary transition-colors duration-300"
                  />
                </div>

                {/* Category Selector */}
                <div className="flex flex-col gap-4">
                  <span className="text-xs font-bold text-primary uppercase tracking-widest font-sans">
                    SELECCIONA UNA CATEGORÍA
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={(e) => {
                          createRipple(e, e.currentTarget, "rgba(107, 85, 132, 0.2)");
                          setActiveCategory(cat);
                        }}
                        className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          activeCategory === cat
                            ? "bg-secondary text-on-secondary shadow-sm scale-95"
                            : "bg-secondary-container/20 text-secondary hover:bg-secondary-container/40"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Request Textarea */}
                <div className="flex flex-col gap-3">
                  <label className="text-xs font-bold text-primary uppercase tracking-widest font-sans" htmlFor="request">
                    TU PETICIÓN
                  </label>
                  <textarea
                    id="request"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Estoy pidiendo por..."
                    rows={5}
                    className="w-full bg-transparent border-b-2 border-base-content/10 py-3 text-lg font-display placeholder:italic placeholder:opacity-45 focus:outline-none focus:border-primary transition-colors duration-300 resize-none font-sans"
                    required
                  />
                </div>

                {/* Privacy Settings */}
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-primary uppercase tracking-widest font-sans">
                      AJUSTES DE PRIVACIDAD
                    </span>
                    <span className="text-secondary flex items-center gap-1 opacity-80 font-bold font-sans">
                      <span className="material-symbols-outlined text-sm animate-pulse">auto_awesome</span>
                      Funciones Premium
                    </span>
                  </div>

                  <div className="space-y-4">
                    {/* Public Option */}
                    <label className="relative flex items-center p-5 rounded-2xl border border-primary/20 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors group">
                      <input
                        checked={privacyMode === "public"}
                        onChange={() => setPrivacyMode("public")}
                        className="radio radio-primary radio-sm mr-4"
                        name="privacy"
                        type="radio"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-base-content font-sans">Muro de Oración Público</span>
                        <span className="text-xs text-base-content/60 mt-0.5 font-sans">Comparte con toda la comunidad de Oremos</span>
                      </div>
                      <span className="material-symbols-outlined ml-auto text-primary opacity-60 group-hover:opacity-100 transition-opacity">
                        public
                      </span>
                    </label>

                    {/* Premium Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Groups Option */}
                      <div
                        aria-disabled="true"
                        className="relative flex items-center p-5 rounded-2xl border border-base-content/10 bg-base-200/40 opacity-60 cursor-not-allowed"
                      >
                        <input
                          disabled
                          className="radio radio-secondary radio-sm mr-4"
                          name="privacy"
                          type="radio"
                        />
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-base-content font-sans">Grupos Privados</span>
                            <span className="bg-secondary/15 text-secondary text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider font-sans">
                              PREMIUM
                            </span>
                            <ProximamenteBadge />
                          </div>
                          <span className="text-xs text-base-content/60 mt-0.5 font-sans">Solo para tus círculos</span>
                        </div>
                        <span className="material-symbols-outlined ml-auto text-base-content/40">
                          lock
                        </span>
                      </div>

                      {/* Secret option */}
                      <div
                        aria-disabled="true"
                        className="relative flex items-center p-5 rounded-2xl border border-base-content/10 bg-base-200/40 opacity-60 cursor-not-allowed"
                      >
                        <input
                          disabled
                          className="radio radio-secondary radio-sm mr-4"
                          name="privacy"
                          type="radio"
                        />
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-base-content font-sans">Privadas Ilimitadas</span>
                            <span className="bg-secondary/15 text-secondary text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider font-sans">
                              PREMIUM
                            </span>
                            <ProximamenteBadge />
                          </div>
                          <span className="text-xs text-base-content/60 mt-0.5 font-sans">Peticiones íntimas</span>
                        </div>
                        <span className="material-symbols-outlined ml-auto text-base-content/40">
                          visibility_off
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-6 flex flex-col items-center">
                  <button
                    type="submit"
                    disabled={submitting}
                    onClick={(e) => createRipple(e, e.currentTarget, "rgba(107, 85, 132, 0.4)")}
                    className="w-full md:w-64 py-4 px-8 bg-primary hover:opacity-95 text-primary-content rounded-full font-bold text-xs tracking-widest uppercase transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer amen-glow"
                  >
                    {submitting ? (
                      <span className="loading loading-spinner loading-xs font-sans"></span>
                    ) : (
                      <>
                        <span>ENVIAR ORACIÓN</span>
                        <span className="material-symbols-outlined text-lg">church</span>
                      </>
                    )}
                  </button>
                  <p className="mt-4 text-xs text-base-content/50 italic text-center font-sans">
                    Tu petición será recibida con luz y amor.
                  </p>
                </div>

              </form>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}

export default function NuevaPeticion() {
  return (
    <>
      <Header />
      <Suspense fallback={
        <div className="flex justify-center items-center py-24 min-h-screen">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      }>
        <NewPrayerRequestContent />
      </Suspense>
      <Footer />
    </>
  );
}
