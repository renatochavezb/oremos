"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import axios from "axios";
import toast from "react-hot-toast";
import { createRipple } from "@/libs/ripple";
import { getPrivatePrayerCardClasses, getPublicPrayerCardClasses } from "@/libs/prayerStyles";
import PrayerPrivacyBadge from "@/components/PrayerPrivacyBadge";

const groupsData = [
  {
    id: "quietud_matinal",
    name: "Quietud Matinal",
    icon: "auto_awesome",
    members: 1240,
    description: "Un grupo dedicado a la meditación al amanecer y a la gratitud matutina.",
    color: "secondary",
  },
  {
    id: "manos_que_sanan",
    name: "Manos que Sanan",
    icon: "health_and_safety",
    members: 856,
    description: "Enfocando nuestra energía colectiva en aquellos que se recuperan de una enfermedad o pérdida.",
    color: "primary",
  },
  {
    id: "jovenes_fieles",
    name: "Jóvenes Fieles",
    icon: "diversity_3",
    members: 2102,
    description: "Navegando la vida moderna con arraigo espiritual y sabiduría colectiva.",
    color: "neutral",
  },
];

export default function Comunidad() {
  const { data: session, status } = useSession();
  
  // Stats states
  const [globalStats, setGlobalStats] = useState({
    loginsToday: 0,
    totalLogins: 0,
    communityImpact: 0,
  });
  const [userStats, setUserStats] = useState({
    streak: 0,
    joinedCount: 0,
    joinedGroups: [],
    joinedPrayers: [],
    activeChains: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("joined"); // "joined" | "active"

  const fetchStats = useCallback(async () => {
    try {
      const gStats = await axios.get("/api/stats");
      setGlobalStats(gStats.data);

      if (session) {
        const uStats = await axios.get("/api/user/stats");
        setUserStats(uStats.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Scroll Reveal Observer
  useEffect(() => {
    if (loading || status === "unauthenticated") return;

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

    const elements = document.querySelectorAll("main > section");
    elements.forEach((el) => {
      el.classList.add("transition-all", "duration-700", "opacity-0", "translate-y-4");
      observer.observe(el);
    });

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, [loading, status, activeTab]);

  const handleGroupToggle = async (groupId) => {
    if (!session) {
      toast.error("Debes iniciar sesión para unirte a grupos");
      return;
    }

    try {
      const response = await axios.post("/api/groups/toggle", { groupId });
      const { joined, joinedGroups } = response.data;
      
      setUserStats((prev) => ({ ...prev, joinedGroups }));

      if (joined) {
        toast.success("Te has unido al grupo");
      } else {
        toast.success("Has salido del grupo");
      }
    } catch (error) {
      console.error("Error toggling group:", error);
      toast.error("Error al procesar la membresía del grupo");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta petición de oración?")) return;

    try {
      await axios.delete(`/api/prayers/${id}`);
      setUserStats((prev) => ({
        ...prev,
        activeChains: prev.activeChains.filter((p) => p.id !== id),
        joinedPrayers: prev.joinedPrayers.filter((p) => p.id !== id),
        joinedCount: prev.joinedPrayers.filter((p) => p.id !== id).length,
      }));
      toast.success("Petición de oración eliminada con éxito");
    } catch (error) {
      console.error("Error deleting prayer:", error);
      const msg = error.response?.data?.error || "Error al eliminar la petición";
      toast.error(msg);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
  };

  // Sign in gate for guest users
  if (status === "unauthenticated") {
    return (
      <>
        <Header />
        <main className="max-w-4xl mx-auto px-6 py-24 text-center font-sans">
          <div className="bg-base-100 rounded-3xl p-12 shadow-sm border border-base-content/5 max-w-xl mx-auto">
            <span className="material-symbols-outlined text-[64px] text-primary mb-6">lock_open</span>
            <h2 className="font-display text-3xl text-primary mb-4 font-medium">Tu Santuario Personal</h2>
            <p className="text-base-content/70 text-sm mb-8 leading-relaxed">
              Inicia sesión para registrar tus intenciones de oración, llevar el conteo de tu racha diaria, unirte a grupos de fe y ver tu historial completo de fe.
            </p>
            <button
              onClick={() => signIn(undefined, { callbackUrl: "/comunidad" })}
              className="bg-primary text-primary-content hover:bg-primary/95 px-8 py-3 rounded-full font-bold shadow-md cursor-pointer inline-flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">login</span>
              Iniciar Sesión
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-20 font-sans">
        {/* Intro */}
        <section className="mb-16 text-center">
          <h2 className="font-display text-4xl text-primary mb-4 italic font-medium">
            El Poder de la Paz Colectiva
          </h2>
          <p className="text-base-content/70 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            Bienvenido a tu santuario. Tus oraciones contribuyen a un movimiento global de calma y compasión.
          </p>
        </section>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : (
          <>
            {/* Stats Metrics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20 items-stretch">
              <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
                {/* Total logins */}
                <div className="bg-base-100 rounded-2xl p-8 flex flex-col justify-between min-h-[180px] border border-base-content/5 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">login</span>
                    </div>
                    <span className="bg-primary/10 text-primary text-[9px] px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                      Acumulado
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-base-content/60 mb-1 font-semibold">Ingresos totales</p>
                    <h3 className="text-3xl font-display font-medium text-primary">
                      {globalStats.totalLogins.toLocaleString()}
                    </h3>
                    <p className="text-[10px] text-base-content/45 mt-2">
                      Hoy: {globalStats.loginsToday.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Lives Touched */}
                <div className="bg-base-100 rounded-2xl p-8 flex flex-col justify-between min-h-[180px] border border-base-content/5 hover:shadow-md transition-all">
                  <div className="w-10 h-10 rounded-full bg-secondary/5 flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined">volunteer_activism</span>
                  </div>
                  <div>
                    <p className="text-xs text-base-content/60 mb-1 font-semibold">Vidas tocadas</p>
                    <h3 className="text-3xl font-display font-medium text-secondary">
                      {globalStats.communityImpact.toLocaleString()}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Personal Streak */}
              <div className="lg:col-span-4 bg-primary text-primary-content rounded-2xl p-8 flex flex-col justify-center items-center text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt="Textura"
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCOG8Evf1LEGuCqYMT_3I7Slb90t00qA8jH5brqLIuvxFZu6Bapyg3AQsdoMtm_M_GxohosqqKJ1EIqzuiOw8FwKThEHNY8Ia-_5x-Q43s52f8fZr_k4LhuTdu1Lhu0GS4IoAS0U-Uz_z-Da8l_dwhvB6Gad1YU9IE2npoxGDpwFLDgBdZe1ipQblb2g9CX1otfGvzh0xGlEFbFbF7Um1Y00HnGir5M-B4cp0GfSILygdb5wQWN4F1Mj0cTMG05nCcLfZ3EZ8ytrQ0"
                  />
                </div>
                <div className="relative z-10 w-full font-sans">
                  <p className="text-xs uppercase tracking-widest opacity-80 mb-2 font-bold font-sans">Racha de Oración</p>
                  <div className="text-5xl font-display font-bold mb-4">{userStats.streak}</div>
                  <p className="text-[10px] uppercase tracking-widest opacity-80 font-bold font-sans">Días de atención plena</p>
                  
                  <div className="w-full h-1 bg-white/20 rounded-full mt-6 overflow-hidden">
                    <div
                      className="h-full bg-white transition-all duration-500"
                      style={{ width: `${Math.min((userStats.streak / 30) * 100, 100) || 5}%` }}
                    ></div>
                  </div>
                  <p className="text-[9px] opacity-60 mt-2 text-right">Objetivo: 30 días</p>
                </div>
              </div>
            </div>

            {/* Personal Activity Section */}
            <section className="mb-20">
              <div className="flex flex-wrap items-baseline gap-8 mb-8 border-b border-base-content/10">
                <button
                  onClick={(e) => {
                    createRipple(e, e.currentTarget, "rgba(107, 85, 132, 0.2)");
                    setActiveTab("joined");
                  }}
                  className={`pb-4 text-base font-bold transition-all cursor-pointer ${
                    activeTab === "joined"
                      ? "text-primary border-b-2 border-primary"
                      : "text-base-content/50 hover:text-primary"
                  }`}
                >
                  Oraciones a las que te has unido ({userStats.joinedCount})
                </button>
                <button
                  onClick={(e) => {
                    createRipple(e, e.currentTarget, "rgba(107, 85, 132, 0.2)");
                    setActiveTab("active");
                  }}
                  className={`pb-4 text-base font-bold transition-all cursor-pointer ${
                    activeTab === "active"
                      ? "text-primary border-b-2 border-primary"
                      : "text-base-content/50 hover:text-primary"
                  }`}
                >
                  Tus cadenas activas ({userStats.activeChains.length})
                </button>
              </div>

              {/* Feed lists */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {activeTab === "joined" ? (
                  userStats.joinedPrayers.length === 0 ? (
                    <div className="col-span-2 text-center py-12 bg-base-100 rounded-2xl border border-base-content/5">
                      <p className="text-sm text-base-content/50">Aún no te has unido a ninguna petición.</p>
                      <Link href="/muro" className="btn btn-primary btn-sm rounded-full mt-4 font-bold">
                        Visitar el Muro
                      </Link>
                    </div>
                  ) : (
                    userStats.joinedPrayers.map((prayer) => (
                      <div
                        key={prayer.id}
                        className={`rounded-2xl p-6 border transition-all shadow-sm flex flex-col justify-between ${
                          prayer.isPublic === false
                            ? `${getPrivatePrayerCardClasses()} hover:shadow-lg`
                            : `${getPublicPrayerCardClasses()} hover:border-secondary/35`
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-start mb-4 gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                              {prayer.isPublic === false && <PrayerPrivacyBadge />}
                              <span className="text-xs font-bold text-secondary uppercase tracking-wider">{prayer.category}</span>
                            </div>
                            <span className="text-xs text-base-content/40 italic shrink-0">{formatDate(prayer.createdAt)}</span>
                          </div>
                          <p className="font-display text-base text-base-content/85 leading-relaxed mb-6 italic">
                            &ldquo;{prayer.text}&rdquo;
                          </p>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-base-content/5">
                          <span className="text-xs font-bold text-base-content/65">por {prayer.userName}</span>
                          <button
                            disabled={true}
                            className="flex items-center gap-1.5 bg-secondary text-on-secondary px-5 py-2 rounded-full text-xs font-bold opacity-90 scale-95"
                          >
                            <span className="material-symbols-outlined text-sm">favorite</span>
                            Amén
                          </button>
                        </div>
                      </div>
                    ))
                  )
                ) : (
                  userStats.activeChains.length === 0 ? (
                    <div className="col-span-2 text-center py-12 bg-base-100 rounded-2xl border border-base-content/5">
                      <p className="text-sm text-base-content/50">No has creado peticiones de oración.</p>
                      <Link href="/nueva-peticion" className="btn btn-primary btn-sm rounded-full mt-4 font-bold">
                        Pedir Oración
                      </Link>
                    </div>
                  ) : (
                    userStats.activeChains.map((prayer) => (
                      <div
                        key={prayer.id}
                        className={`rounded-2xl p-6 border transition-all shadow-sm flex flex-col justify-between ${
                          prayer.isPublic === false
                            ? `${getPrivatePrayerCardClasses()} hover:shadow-lg`
                            : `${getPublicPrayerCardClasses()} hover:border-primary/35`
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-start mb-4 gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                              {prayer.isPublic === false && <PrayerPrivacyBadge />}
                              <span className={`text-xs font-bold uppercase tracking-wider ${prayer.isPublic === false ? "text-secondary" : "text-primary"}`}>
                                {prayer.category}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-xs text-base-content/40 italic">{formatDate(prayer.createdAt)}</span>
                              <button
                                onClick={(e) => {
                                  createRipple(e, e.currentTarget, "rgba(239, 68, 68, 0.2)");
                                  handleDelete(prayer.id);
                                }}
                                className="text-error hover:text-error/80 cursor-pointer flex items-center justify-center"
                                title="Eliminar petición"
                              >
                                <span className="material-symbols-outlined text-base">delete</span>
                              </button>
                            </div>
                          </div>
                          <p className="font-display text-base text-base-content/85 leading-relaxed mb-6 italic">
                            &ldquo;{prayer.text}&rdquo;
                          </p>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-base-content/5 text-xs text-base-content/75">
                          <span>
                            {prayer.isPublic === false
                              ? `${prayer.prayersCount || 0} intercesiones del equipo`
                              : `${prayer.prayersCount || 0} orando por esto`}
                          </span>
                          <span className={`font-bold ${prayer.isPublic === false ? "text-secondary" : "text-primary"}`}>Tú</span>
                        </div>
                      </div>
                    ))
                  )
                )}
              </div>
            </section>

            {/* Faith Communities Group List */}
            <section className="py-16 bg-base-200/50 rounded-[2rem] px-8 md:px-12 relative overflow-hidden border border-base-content/5">
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
                  <div className="max-w-xl">
                    <h2 className="font-display text-3xl text-primary mb-4 font-medium">Comunidades de Fe</h2>
                    <p className="text-sm text-base-content/70 leading-relaxed">
                      Únete a un grupo que resuene con tu camino. Las caminatas espirituales compartidas crean vínculos más profundos y paz duradera.
                    </p>
                  </div>
                  <Link href="/grupos-privados" className="px-8 py-3 bg-secondary text-secondary-content hover:bg-secondary/95 rounded-full text-xs font-bold shadow-md text-center">
                    Grupos Privados
                  </Link>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
                  {groupsData.map((group) => {
                    const isJoined = userStats.joinedGroups?.includes(group.id);
                    return (
                      <div key={group.id} className="bg-base-100 rounded-2xl p-6 border border-base-content/5 hover:shadow-md transition-all flex flex-col justify-between group">
                        <div>
                          <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary mb-6 group-hover:scale-105 transition-transform">
                            <span className="material-symbols-outlined text-2xl">{group.icon}</span>
                          </div>
                          <h4 className="font-bold text-base-content text-base mb-2">{group.name}</h4>
                          <p className="text-xs text-base-content/65 leading-relaxed mb-6">{group.description}</p>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-base-content/5 font-sans">
                          <span className="text-[10px] text-base-content/50 font-bold">
                            {(group.members + (isJoined ? 1 : 0)).toLocaleString()} Miembros
                          </span>
                          <button
                            onClick={(e) => {
                              createRipple(e, e.currentTarget, isJoined ? "rgba(107, 85, 132, 0.2)" : "rgba(61, 95, 124, 0.2)");
                              handleGroupToggle(group.id);
                            }}
                            className={`text-xs font-bold cursor-pointer hover:underline ${
                              isJoined ? "text-secondary" : "text-primary"
                            }`}
                          >
                            {isJoined ? "Salir del Grupo" : "Unirse al Grupo"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl -mr-40 -mt-40"></div>
            </section>
          </>
        )}
      </main>

      <Footer />
    </>
  );
}
