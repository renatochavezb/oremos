"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import axios from "axios";
import toast from "react-hot-toast";
import { createRipple } from "@/libs/ripple";
import { getPrivatePrayerCardClasses } from "@/libs/prayerStyles";
import PrayerPrivacyBadge from "@/components/PrayerPrivacyBadge";

const categories = ["Todas las Peticiones", "Salud", "Paz", "Gratitud", "Familia", "Otros"];

export default function MuroPrivado() {
  const [prayers, setPrayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Todas las Peticiones");

  const fetchPrayers = async (category) => {
    setLoading(true);
    try {
      const catParam = category === "Todas las Peticiones" ? "" : `?category=${category}`;
      const response = await axios.get(`/api/prayers/private${catParam}`);
      setPrayers(response.data);
    } catch (error) {
      console.error("Error fetching private prayers:", error);
      const msg = error.response?.data?.error || "Error al cargar las peticiones confidenciales";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrayers(activeCategory);
  }, [activeCategory]);

  const handleIntercede = async (id) => {
    try {
      const response = await axios.post(`/api/prayers/${id}/amen`);
      const { prayersCount } = response.data;

      setPrayers((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, prayersCount, hasUserPrayed: true } : p
        )
      );

      toast.success("Gracias por interceder. Tu oración ha sido registrada.");
    } catch (error) {
      console.error("Error registering intercession:", error);
      const msg = error.response?.data?.error || "Error al registrar la intercesión";
      toast.error(msg);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
  };

  const pendingCount = prayers.filter((p) => !p.hasUserPrayed).length;

  return (
    <>
      <Header />

      <main className="max-w-7xl mx-auto px-6 md:px-12 pt-12 pb-32 prayer-private-surface min-h-screen">
        <section className="mb-12 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full mb-6 font-sans text-xs font-bold">
            <span className="material-symbols-outlined text-sm">lock</span>
            Equipo de Intercesión
          </div>
          <h2 className="font-display text-4xl text-primary mb-4 font-medium">Muro Privado</h2>
          <p className="font-sans text-base text-base-content/70 leading-relaxed">
            Peticiones confidenciales compartidas solo con nuestro equipo. Estas oraciones no aparecen en el muro público.
          </p>
        </section>

        <section className="mb-10 font-sans">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-base-100 border border-base-content/5 rounded-2xl p-5 text-center">
              <p className="text-2xl font-bold text-primary">{prayers.length}</p>
              <p className="text-xs text-base-content/60 mt-1">Peticiones confidenciales</p>
            </div>
            <div className="bg-base-100 border border-secondary/10 rounded-2xl p-5 text-center">
              <p className="text-2xl font-bold text-secondary">{pendingCount}</p>
              <p className="text-xs text-base-content/60 mt-1">Por atender</p>
            </div>
            <div className="bg-base-100 border border-base-content/5 rounded-2xl p-5 text-center">
              <p className="text-2xl font-bold text-primary">{prayers.length - pendingCount}</p>
              <p className="text-xs text-base-content/60 mt-1">Ya atendidas por ti</p>
            </div>
          </div>
        </section>

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

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : prayers.length === 0 ? (
          <div className="text-center py-24 bg-base-100 rounded-3xl border border-base-content/5">
            <span className="material-symbols-outlined text-5xl text-base-content/30 mb-4">inbox</span>
            <p className="font-display text-xl text-primary mb-2">No hay peticiones confidenciales</p>
            <p className="text-sm text-base-content/60 max-w-md mx-auto">
              Cuando alguien solicite oración privada, aparecerá aquí para que el equipo pueda interceder.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch font-sans">
            {prayers.map((prayer) => (
              <div
                key={prayer.id}
                className={`rounded-2xl p-8 shadow-sm border flex flex-col justify-between transition-all duration-300 hover:shadow-md ${getPrivatePrayerCardClasses({ attended: prayer.hasUserPrayed })}`}
              >
                <div>
                  <div className="flex justify-between items-center mb-6 text-xs">
                    <PrayerPrivacyBadge />
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full font-bold text-[10px]">
                        {prayer.category}
                      </span>
                      <span className="text-base-content/50">{formatDate(prayer.createdAt)}</span>
                    </div>
                  </div>

                  <p className="font-bold text-secondary text-base mb-4">{prayer.userName}</p>

                  <p className="font-display text-lg text-base-content/85 italic mb-6 leading-relaxed">
                    &ldquo;{prayer.text}&rdquo;
                  </p>
                </div>

                <div className="space-y-4 pt-6 border-t border-base-content/5 mt-auto">
                  <div className="flex items-center gap-1.5 text-xs text-base-content/70">
                    <span className="material-symbols-outlined text-secondary scale-90">favorite</span>
                    <span>{prayer.prayersCount || 0} intercesiones del equipo</span>
                  </div>

                  <button
                    disabled={prayer.hasUserPrayed}
                    onClick={(e) => {
                      createRipple(e, e.currentTarget, "rgba(107, 85, 132, 0.4)");
                      handleIntercede(prayer.id);
                    }}
                    className={`w-full py-3 rounded-full font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 ${
                      prayer.hasUserPrayed
                        ? "bg-secondary text-on-secondary opacity-95"
                        : "bg-primary text-primary-content hover:opacity-95 cursor-pointer"
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {prayer.hasUserPrayed ? "check_circle" : "volunteer_activism"}
                    </span>
                    {prayer.hasUserPrayed ? "Intercedido" : "He orado por esto"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <section className="mt-12 text-center">
          <Link
            href="/muro"
            className="text-sm text-base-content/60 hover:text-primary transition-colors"
          >
            ← Volver al muro público
          </Link>
        </section>
      </main>

      <Footer />
    </>
  );
}
