"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import axios from "axios";
import toast from "react-hot-toast";
import { createRipple } from "@/libs/ripple";

const categories = ["Todas las Peticiones", "Salud", "Paz", "Gratitud", "Familia", "Otros"];

export default function Muro() {
  const { data: session } = useSession();
  const [prayers, setPrayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Todas las Peticiones");

  // Thanks notes modal state
  const [activeThanksId, setActiveThanksId] = useState(null);
  const [thanksText, setThanksText] = useState("");

  const fetchPrayers = async (category) => {
    setLoading(true);
    try {
      const catParam = category === "Todas las Peticiones" ? "" : `?category=${category}`;
      const response = await axios.get(`/api/prayers${catParam}`);
      setPrayers(response.data);
    } catch (error) {
      console.error("Error fetching prayers:", error);
      toast.error("Error al cargar las peticiones");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = useCallback(async () => {
    if (session) {
      try {
        await axios.get("/api/user/stats");
      } catch (error) {
        console.error("Error fetching user stats:", error);
      }
    }
  }, [session]);

  useEffect(() => {
    fetchPrayers(activeCategory);
  }, [activeCategory]);

  useEffect(() => {
    fetchUserStats();
  }, [fetchUserStats]);

  // Scroll Reveal Observer
  useEffect(() => {
    if (loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0");
            entry.target.classList.remove("opacity-0", "translate-y-4");
          }
        });
      },
      { threshold: 0.05 }
    );

    const elements = document.querySelectorAll("section, .grid > div");
    elements.forEach((el) => {
      el.classList.add("transition-all", "duration-700", "opacity-0", "translate-y-4");
      observer.observe(el);
    });

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, [prayers, loading]);

  const handleAmen = async (id) => {
    if (!session) {
      toast.error("Debes iniciar sesión para unirte en oración");
      setTimeout(() => {
        signIn(undefined, { callbackUrl: "/muro" });
      }, 1000);
      return;
    }
    try {
      const response = await axios.post(`/api/prayers/${id}/amen`);
      const { prayersCount } = response.data;
      
      setPrayers((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, prayersCount, hasUserPrayed: true } : p
        )
      );
      
      toast.success("Amén. Te has unido en oración.");
    } catch (error) {
      console.error("Error sending Amen:", error);
      const msg = error.response?.data?.error || "Error al registrar oración";
      toast.error(msg);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta petición de oración?")) return;

    try {
      await axios.delete(`/api/prayers/${id}`);
      setPrayers((prev) => prev.filter((p) => p.id !== id));
      toast.success("Petición de oración eliminada con éxito");
    } catch (error) {
      console.error("Error deleting prayer:", error);
      const msg = error.response?.data?.error || "Error al eliminar la petición";
      toast.error(msg);
    }
  };

  const handleIgniteCandle = async (id) => {
    toast.success("Redirigiendo a la compra de Vela Digital ($0.99)...");
    setTimeout(() => {
      window.location.href = `/apoyo?prayerId=${id}`;
    }, 1000);
  };

  const handleThanksSubmit = async (e, id) => {
    e.preventDefault();
    if (!thanksText.trim()) return;

    try {
      await axios.post(`/api/prayers/${id}/thanks`, { thanksText });
      setPrayers((prev) =>
        prev.map((p) => (p.id === id ? { ...p, thanksText } : p))
      );
      toast.success("Nota de agradecimiento compartida");
      setActiveThanksId(null);
      setThanksText("");
    } catch (error) {
      console.error("Error updating thanks note:", error);
      toast.error("Error al enviar el agradecimiento");
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <>
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 md:px-12 pt-12 pb-32">
        {/* Intro Section */}
        <section className="mb-12 text-center max-w-2xl mx-auto">
          <h2 className="font-display text-4xl text-primary mb-4 font-medium">Muro de Oración</h2>
          <p className="font-sans text-base text-base-content/70 leading-relaxed">
            Únete a nuestra comunidad en un momento de quietud. Carguen con las cargas de los demás a través del poder de la oración colectiva.
          </p>
        </section>

        {/* Premium CTA Banner */}
        <section className="mb-12 font-sans">
          <div className="bg-base-200/60 border border-base-content/5 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">lock</span>
              </div>
              <div>
                <h3 className="font-bold text-base-content text-base">Peticiones Privadas</h3>
                <p className="text-xs text-base-content/70">Comparte tu carga solo con nuestro equipo de intercesores dedicados.</p>
              </div>
            </div>
            <Link
              href="/nueva-peticion?private=true"
              onClick={(e) => createRipple(e, e.currentTarget)}
              className="whitespace-nowrap px-6 py-3 bg-secondary text-on-secondary hover:bg-secondary/95 rounded-full text-xs font-bold shadow-md flex items-center gap-2"
            >
              Solicitar Oración Privada
              <span className="material-symbols-outlined text-sm">verified</span>
            </Link>
          </div>
        </section>

        {/* Category Filters */}
        <section className="mb-12 overflow-x-auto pb-4 font-sans">
          <div className="flex items-center gap-3 justify-start md:justify-center min-w-max">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={(e) => {
                  createRipple(e, e.currentTarget, "rgba(107, 85, 132, 0.2)");
                  setActiveCategory(cat);
                }}
                className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeCategory === cat
                    ? "bg-primary text-primary-content shadow-sm"
                    : "bg-secondary-container/30 text-secondary hover:bg-secondary-container/50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch font-sans">
            {/* Cards Feed */}
            {prayers.map((prayer) => {
              const isOwner = session?.user && prayer.user?._id?.toString() === session.user.id;
              
              return (
                <div
                  key={prayer.id}
                  className={`bg-base-100 rounded-2xl p-8 shadow-sm border flex flex-col justify-between group hover:shadow-md transition-all duration-300 ${
                    prayer.hasActiveCandle
                      ? "border-amber-300 ring-2 ring-amber-100/50 bg-gradient-to-b from-base-100 to-amber-50/10"
                      : "border-base-content/5"
                  }`}
                >
                  <div>
                    {/* Header: Candle badge, category & date */}
                    <div className="flex justify-between items-center mb-6 text-xs">
                      {prayer.hasActiveCandle ? (
                        <span className="flex items-center gap-1 px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] rounded uppercase font-bold">
                          <span className="material-symbols-outlined text-xs text-amber-500 candle-glow candle-flicker">
                            local_fire_department
                          </span>
                          {prayer.activeCandlesCount} vela{prayer.activeCandlesCount > 1 ? "s" : ""}
                        </span>
                      ) : (
                        <span className="text-base-content/40 italic">Muro Público</span>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full font-bold text-[10px]">
                          {prayer.category}
                        </span>
                        <span className="text-base-content/50">{formatDate(prayer.createdAt)}</span>
                        {isOwner && (
                          <button
                            onClick={(e) => {
                              createRipple(e, e.currentTarget, "rgba(239, 68, 68, 0.2)");
                              handleDelete(prayer.id);
                            }}
                            className="text-error hover:text-error/80 ml-2 cursor-pointer flex items-center justify-center"
                            title="Eliminar petición"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Author Name */}
                    <p className="font-bold text-primary text-base mb-4">{prayer.userName}</p>
                    
                    {/* Prayer Text */}
                    <p className="font-display text-lg text-base-content/85 italic mb-6 leading-relaxed">
                      &ldquo;{prayer.text}&rdquo;
                    </p>

                    {/* Thanks display */}
                    {prayer.thanksText && (
                      <div className="bg-secondary/5 rounded-xl p-4 border border-secondary/10 mb-6 text-xs text-secondary leading-relaxed">
                        <p className="font-bold uppercase tracking-wider text-[9px] mb-1">Agradecimiento:</p>
                        <p className="italic">&ldquo;{prayer.thanksText}&rdquo;</p>
                      </div>
                    )}
                  </div>

                  {/* Actions Area */}
                  <div className="space-y-4 pt-6 border-t border-base-content/5 mt-auto">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-base-content/70">
                        <span className="material-symbols-outlined text-secondary scale-90">favorite</span>
                        <span>{prayer.prayersCount || 0} orando</span>
                      </div>
                      
                      {prayer.hasActiveCandle ? (
                        <span className="flex items-center gap-1 text-amber-600 font-bold">
                          <span className="material-symbols-outlined text-sm candle-glow candle-flicker">light_mode</span>
                          Vela Encendida
                        </span>
                      ) : (
                        <button
                          onClick={(e) => {
                            createRipple(e, e.currentTarget, "rgba(255, 191, 0, 0.4)");
                            const icon = e.currentTarget.querySelector(".material-symbols-outlined");
                            if (icon) {
                              icon.style.transform = "scale(1.5)";
                              setTimeout(() => {
                                icon.style.transform = "";
                              }, 300);
                            }
                            handleIgniteCandle(prayer.id);
                          }}
                          className="flex items-center gap-1 text-base-content/50 hover:text-amber-500 transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">light_mode</span>
                          Encender Vela
                        </button>
                      )}
                    </div>

                    {/* Amen Button */}
                    <button
                      disabled={prayer.hasUserPrayed}
                      onClick={(e) => {
                        createRipple(e, e.currentTarget, "rgba(107, 85, 132, 0.4)");
                        handleAmen(prayer.id);
                      }}
                      className={`w-full py-3 rounded-full font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 amen-glow ${
                        prayer.hasUserPrayed
                          ? "bg-secondary text-on-secondary opacity-95"
                          : "bg-primary text-primary-content hover:opacity-95 cursor-pointer"
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">
                        {prayer.hasUserPrayed ? "favorite" : "rebase_edit"}
                      </span>
                      {prayer.hasUserPrayed ? "Amén" : "Orar por esto"}
                    </button>

                    {/* Gratitude text box for creator */}
                    {isOwner && !prayer.thanksText && (
                      <div className="pt-2 text-center">
                        {activeThanksId === prayer.id ? (
                          <form onSubmit={(e) => handleThanksSubmit(e, prayer.id)} className="space-y-2">
                            <textarea
                              value={thanksText}
                              onChange={(e) => setThanksText(e.target.value)}
                              placeholder="Escribe tu agradecimiento..."
                              className="textarea textarea-bordered textarea-sm w-full text-xs"
                              rows={2}
                            />
                            <div className="flex gap-2 justify-end font-sans">
                              <button
                                type="button"
                                onClick={() => setActiveThanksId(null)}
                                className="btn btn-ghost btn-xs text-xs"
                              >
                                Cancelar
                              </button>
                              <button type="submit" className="btn btn-secondary btn-xs text-xs">
                                Enviar
                              </button>
                            </div>
                          </form>
                        ) : (
                          <button
                            onClick={() => setActiveThanksId(prayer.id)}
                            className="text-xs text-secondary hover:underline font-bold"
                          >
                            Dar las gracias
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* CTA / Publish request card */}
            <Link
              href="/nueva-peticion"
              onClick={(e) => createRipple(e, e.currentTarget)}
              className="rounded-2xl p-8 border-2 border-dashed border-base-content/20 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-primary/40 hover:bg-base-200/30 transition-all min-h-[350px]"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-primary">
                <span className="material-symbols-outlined text-3xl font-bold">add</span>
              </div>
              <p className="font-display text-xl text-base-content mb-2 font-medium">¿Tienes una necesidad?</p>
              <p className="font-sans text-xs text-base-content/60 mb-6 leading-relaxed max-w-[200px]">
                Publica tu petición y deja que la comunidad ore contigo.
              </p>
              <span className="px-6 py-2 border border-primary text-primary rounded-full text-xs font-bold group-hover:bg-primary group-hover:text-primary-content transition-colors">
                Publicar Petición
              </span>
            </Link>
          </div>
        )}
      </main>
      
      <Footer />
    </>
  );
}
