"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import axios from "axios";
import toast from "react-hot-toast";
import config from "@/config";
import { createRipple } from "@/libs/ripple";

function SupportContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [prayerId, setPrayerId] = useState(null);
  const [prayerName, setPrayerName] = useState("");
  const [loadingPrayer, setLoadingPrayer] = useState(false);
  
  const [donationAmount, setDonationAmount] = useState("15");
  const [customDonation, setCustomDonation] = useState("");
  const [submittingDonation, setSubmittingDonation] = useState(false);
  const [submittingCandle, setSubmittingCandle] = useState(false);
  const [submittingPremium, setSubmittingPremium] = useState(false);
  const [submittingChurch, setSubmittingChurch] = useState(false);

  useEffect(() => {
    const pId = searchParams.get("prayerId");
    if (pId) {
      setPrayerId(pId);
      fetchPrayerDetails(pId);
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

  const fetchPrayerDetails = async (id) => {
    setLoadingPrayer(true);
    try {
      const response = await axios.get("/api/prayers");
      const found = response.data.find((p) => p.id === id);
      if (found) {
        setPrayerName(found.userName || "Petición Anónima");
      }
    } catch (error) {
      console.error("Error fetching prayer details:", error);
    } finally {
      setLoadingPrayer(false);
    }
  };

  const handleDonation = async (e) => {
    e.preventDefault();
    setSubmittingDonation(true);
    
    const amount = customDonation || donationAmount;
    
    setTimeout(() => {
      toast.success(`¡Gracias por tu generosa donación de $${amount} USD! Tu amor sostiene este santuario.`);
      setSubmittingDonation(false);
      setCustomDonation("");
    }, 1500);
  };

  const handleCandlePurchase = async (e) => {
    if (e) e.preventDefault();
    if (!prayerId) {
      toast.error("Para encender una vela, por favor hazlo desde una petición en el Muro de Oración.");
      router.push("/muro");
      return;
    }

    setSubmittingCandle(true);
    try {
      await axios.post(`/api/prayers/${prayerId}/candle`);
      toast.success("¡Vela Encendida! Tu vela brillará en el muro de oración durante 24 horas.");
      setTimeout(() => {
        router.push("/muro");
      }, 2000);
    } catch (error) {
      console.error("Error purchasing candle:", error);
      toast.error("Error al encender la vela digital");
    } finally {
      setSubmittingCandle(false);
    }
  };

  const handleCheckout = async (priceId, type) => {
    if (type === "premium") setSubmittingPremium(true);
    if (type === "church") setSubmittingChurch(true);

    try {
      const response = await axios.post("/api/stripe/create-checkout", {
        priceId,
        mode: "subscription",
        successUrl: window.location.origin + "/comunidad?checkout=success",
        cancelUrl: window.location.href,
      });

      if (response.data.url) {
        window.location.href = response.data.url;
      } else {
        toast.error("No se pudo iniciar la sesión de Stripe");
      }
    } catch (error) {
      console.error("Stripe checkout error:", error);
      toast.error("Inicia sesión primero para realizar la suscripción.");
    } finally {
      setSubmittingPremium(false);
      setSubmittingChurch(false);
    }
  };

  return (
    <main className="pt-12 pb-24 font-sans">
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-6 text-center mb-20">
        <h1 className="font-display text-4xl md:text-6xl text-primary mb-6 leading-tight">
          Apoya nuestra misión de conectar corazones
        </h1>
        <p className="text-base-content/70 max-w-2xl mx-auto text-sm md:text-base leading-relaxed italic">
          Elige la forma que mejor se adapte a tu necesidad de conexión y apoyo espiritual. Cada gesto ayuda a mantener este santuario digital abierto para todos.
        </p>
      </section>

      {/* Dynamic Digital Candle Info Widget */}
      {prayerId && (
        <section className="max-w-3xl mx-auto px-6 mb-16">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-center gap-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 animate-pulse">
                <span className="material-symbols-outlined text-2xl">light_mode</span>
              </div>
              <div>
                <h3 className="font-bold text-amber-800 text-sm">Encender Vela Digital</h3>
                <p className="text-xs text-amber-700 mt-0.5">
                  {loadingPrayer
                    ? "Cargando detalles..."
                    : `Vas a destacar e iluminar la petición de: ${prayerName}`}
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                createRipple(e, e.currentTarget, "rgba(255, 191, 0, 0.4)");
                handleCandlePurchase(e);
              }}
              disabled={submittingCandle}
              className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-full font-bold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer whitespace-nowrap"
            >
              {submittingCandle ? "Encendiendo..." : "Confirmar Vela"}
            </button>
          </div>
        </section>
      )}

      {/* Contribution Blocks */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
        {/* Voluntary Donation */}
        <div className="bg-base-100/60 p-10 rounded-3xl flex flex-col justify-between items-start border border-primary/10 shadow-sm">
          <div className="w-full">
            <span className="material-symbols-outlined text-primary text-4xl mb-4">favorite</span>
            <h3 className="font-display text-2xl text-primary mb-4 font-medium">Donación Voluntaria</h3>
            <p className="text-sm text-base-content/70 mb-8 leading-relaxed">
              Si Oremos te ha ayudado, considera apoyar la plataforma. Tu contribución permite que sigamos ofreciendo un espacio de paz y calma sin publicidad invasiva.
            </p>

            {/* Donation selection form */}
            <form onSubmit={handleDonation} className="w-full mb-8">
              <div className="grid grid-cols-3 gap-3 mb-4">
                {["5", "15", "50"].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={(e) => {
                      createRipple(e, e.currentTarget, "rgba(61, 95, 124, 0.2)");
                      setDonationAmount(val);
                      setCustomDonation("");
                    }}
                    className={`py-3 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                      donationAmount === val && !customDonation
                        ? "bg-primary text-primary-content border-primary"
                        : "border-base-content/10 hover:bg-base-200/50"
                    }`}
                  >
                    ${val} USD
                  </button>
                ))}
              </div>
              <input
                type="number"
                placeholder="Otro monto (USD)"
                value={customDonation}
                onChange={(e) => setCustomDonation(e.target.value)}
                className="input input-bordered w-full rounded-xl text-sm font-sans"
              />
              <button
                type="submit"
                disabled={submittingDonation}
                onClick={(e) => createRipple(e, e.currentTarget, "rgba(61, 95, 124, 0.4)")}
                className="w-full bg-primary text-primary-content hover:bg-primary/95 py-3.5 rounded-full text-xs font-bold shadow-md cursor-pointer mt-6 flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                {submittingDonation ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <>
                    <span>Donar ahora</span>
                    <span className="material-symbols-outlined text-sm">volunteer_activism</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Digital Candles */}
        <div className="relative overflow-hidden bg-base-100/60 p-10 rounded-3xl flex flex-col justify-between items-start border border-secondary/10 shadow-sm animate-pulse">
          <div className="absolute -right-10 -top-10 opacity-10 pointer-events-none">
            <span className="material-symbols-outlined text-[180px] text-secondary">mode_fan</span>
          </div>
          <div>
            <span className="material-symbols-outlined text-secondary text-4xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>
              light_mode
            </span>
            <h3 className="font-display text-2xl text-secondary mb-4 font-medium">Velas Digitales</h3>
            <p className="text-sm text-base-content/70 mb-4 leading-relaxed">
              Un acto simbólico para iluminar tus peticiones. Enciende una vela virtual que permanecerá brillante en el muro de oración durante 24 horas.
            </p>
          </div>
          <button
            onClick={(e) => {
              createRipple(e, e.currentTarget, "rgba(107, 85, 132, 0.4)");
              toast.info("Por favor, selecciona la petición específica en el Muro de Oración para encender su vela.");
              setTimeout(() => {
                router.push("/muro");
              }, 400);
            }}
            className="w-full md:w-auto px-8 py-3.5 bg-secondary text-on-secondary hover:bg-secondary/95 rounded-full text-xs font-bold hover:scale-[1.01] transition-all flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer"
          >
            Encender una Vela
            <span className="material-symbols-outlined text-sm">auto_awesome</span>
          </button>
        </div>
      </section>

      {/* Plans Grid */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 mb-16">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl text-primary font-medium">Planes de Membresía</h2>
          <div className="h-1 w-24 bg-primary/20 mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch font-sans">
          {/* Plan Gratuito */}
          <div className="bg-base-100 p-8 rounded-2xl border border-base-content/10 flex flex-col hover:shadow-lg transition-shadow">
            <div className="mb-8">
              <h4 className="font-display text-2xl text-primary mb-2">Plan Gratuito</h4>
              <p className="text-xs text-base-content/60 italic mb-6">Para empezar tu camino</p>
              <div className="font-display text-3xl text-primary">Gratis</div>
            </div>
            <ul className="flex-grow space-y-4 mb-10 text-sm">
              <li className="flex items-start gap-3 text-base-content/80">
                <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                <span>Muro público de oraciones</span>
              </li>
              <li className="flex items-start gap-3 text-base-content/80">
                <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                <span>Acceso a grupos abiertos</span>
              </li>
              <li className="flex items-start gap-3 text-base-content/40 italic">
                <span className="material-symbols-outlined text-lg">radio_button_unchecked</span>
                <span>Peticiones privadas</span>
              </li>
            </ul>
            <Link
              href="/muro"
              onClick={(e) => createRipple(e, e.currentTarget, "rgba(61, 95, 124, 0.2)")}
              className="w-full py-3 border-2 border-primary text-primary rounded-full font-bold hover:bg-primary/5 transition-all text-center text-xs"
            >
              Comenzar ahora
            </Link>
          </div>

          {/* Plan Premium */}
          <div className="bg-base-200 p-8 rounded-2xl border-2 border-secondary/20 flex flex-col relative shadow-md scale-105 z-10">
            <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-secondary text-on-secondary px-4 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider">
              Recomendado
            </div>
            <div className="mb-8 mt-4">
              <h4 className="font-display text-2xl text-secondary mb-2">Plan Premium</h4>
              <p className="text-xs text-base-content/60 italic mb-6">Conexión más profunda</p>
              <div className="font-display text-3xl text-secondary">
                $3.99 <span className="text-sm opacity-60">/ mes</span>
              </div>
            </div>
            <ul className="flex-grow space-y-4 mb-10 text-sm">
              <li className="flex items-start gap-3 text-base-content">
                <span className="material-symbols-outlined text-secondary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
                <span>Peticiones privadas ilimitadas</span>
              </li>
              <li className="flex items-start gap-3 text-base-content">
                <span className="material-symbols-outlined text-secondary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
                <span>Creación de grupos propios</span>
              </li>
              <li className="flex items-start gap-3 text-base-content">
                <span className="material-symbols-outlined text-secondary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
                <span>Historial completo de fe</span>
              </li>
              <li className="flex items-start gap-3 text-base-content">
                <span className="material-symbols-outlined text-secondary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
                <span>Insignia de benefactor</span>
              </li>
            </ul>
            <button
              onClick={(e) => {
                createRipple(e, e.currentTarget, "rgba(107, 85, 132, 0.4)");
                handleCheckout(config.stripe.plans[0].priceId, "premium");
              }}
              disabled={submittingPremium}
              className="w-full py-3 bg-secondary text-on-secondary rounded-full font-bold shadow-sm hover:opacity-95 transition-all text-xs cursor-pointer flex items-center justify-center"
            >
              {submittingPremium ? <span className="loading loading-spinner loading-xs"></span> : "Elegir Premium"}
            </button>
          </div>

          {/* Plan Iglesias */}
          <div className="bg-base-100 p-8 rounded-2xl border border-base-content/10 flex flex-col hover:shadow-lg transition-shadow">
            <div className="mb-8">
              <h4 className="font-display text-2xl text-primary mb-2">Plan Iglesias</h4>
              <p className="text-xs text-base-content/60 italic mb-6">Para comunidades</p>
              <div className="font-display text-3xl text-primary">
                $29.99 <span className="text-sm opacity-60">/ mes</span>
              </div>
            </div>
            <ul className="flex-grow space-y-4 mb-10 text-sm">
              <li className="flex items-start gap-3 text-base-content/80">
                <span className="material-symbols-outlined text-primary text-lg">church</span>
                <span>Espacio propio para la iglesia</span>
              </li>
              <li className="flex items-start gap-3 text-base-content/80">
                <span className="material-symbols-outlined text-primary text-lg">monitoring</span>
                <span>Muro privado y estadísticas</span>
              </li>
              <li className="flex items-start gap-3 text-base-content/80">
                <span className="material-symbols-outlined text-primary text-lg">branding_watermark</span>
                <span>Branding personalizado</span>
              </li>
            </ul>
            <button
              onClick={(e) => {
                createRipple(e, e.currentTarget, "rgba(61, 95, 124, 0.4)");
                handleCheckout(config.stripe.plans[1].priceId, "church");
              }}
              disabled={submittingChurch}
              className="w-full py-3 border-2 border-primary text-primary rounded-full font-bold hover:bg-primary/5 transition-all text-xs cursor-pointer flex items-center justify-center"
            >
              {submittingChurch ? <span className="loading loading-spinner loading-xs"></span> : "Saber más"}
            </button>
          </div>
        </div>
      </section>

      {/* Decorative Quote */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-8">
          <span className="material-symbols-outlined text-primary/40 text-3xl">format_quote</span>
        </div>
        <p className="font-display text-2xl text-primary italic leading-relaxed">
          {"\"Donde hay dos o tres reunidos en mi nombre, allí estoy yo en medio de ellos.\""}
        </p>
      </section>
    </main>
  );
}

export default function Apoyo() {
  return (
    <>
      <Header />
      <Suspense fallback={
        <div className="flex justify-center items-center py-24 min-h-screen">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      }>
        <SupportContent />
      </Suspense>
      <Footer />
    </>
  );
}
