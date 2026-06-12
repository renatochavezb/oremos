"use client";

import { useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createRipple } from "@/libs/ripple";

export default function Page() {
  const handleCandleClick = () => {
    window.location.href = "/apoyo";
  };

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("opacity-100", "translate-y-0");
          entry.target.classList.remove("opacity-0", "translate-y-10");
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll("section > div");
    elements.forEach((el) => {
      el.classList.add("transition-all", "duration-1000", "opacity-0", "translate-y-10");
      observer.observe(el);
    });

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <>
      <Header />

      {/* Top Banner */}
      <div className="bg-primary/5 py-3 px-6 text-center border-b border-primary/10">
        <p className="text-xs text-primary/80 font-sans">
          Si Oremos te ha ayudado,{" "}
          <Link href="/apoyo" className="font-bold underline underline-offset-2 hover:text-primary">
            considera apoyar la plataforma
          </Link>
          .
        </p>
      </div>

      {/* Side Widget: Digital Candle (Desktop only) */}
      <div className="fixed right-6 bottom-24 z-[90] hidden lg:block">
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
            setTimeout(handleCandleClick, 300);
          }}
          className="flex flex-col items-center gap-2 group cursor-pointer"
          id="side-candle-btn"
        >
          <div className="bg-base-100/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-base-content/10 transition-all duration-300 group-hover:shadow-primary/20 group-hover:-translate-y-1 text-center">
            <div className="relative w-8 h-8 mx-auto flex items-center justify-center">
              <span className="material-symbols-outlined text-amber-500 text-3xl candle-glow animate-flicker absolute">
                light_mode
              </span>
              <span className="material-symbols-outlined text-amber-600 text-2xl opacity-50 absolute top-1 left-1">
                mode_fan
              </span>
            </div>
            <p className="font-sans text-[10px] font-bold mt-2 text-primary uppercase tracking-widest leading-tight">
              Encender
              <br />
              Vela
            </p>
          </div>
          <span className="bg-secondary text-on-secondary px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-sm">
            $0.99
          </span>
        </button>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden py-24 bg-cream-bg">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-base-100/40 to-base-100 z-10"></div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Naturaleza serena"
            className="w-full h-full object-cover opacity-80"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA8kmBFCWFptFliiABha-l9d3EInEa4PmIFiIsPjCY57VzakGeMlEM_uSjkNfDgGlXJcaiqg_hrVLF_ntXarCCh2rMbZ6Me4ImrwNMXYr1OuG9263ERxR-VA_642ik8foSKYMwtJtHlE5dz-mFpmOK3mJsBZf-ktlLnuQQskwwYgY981SCNX2dG2ixfqIY9A-VfzoffXV7kAoJGhYXggQBBhAnYbvuFlOuCpOFT60-skPCBip6jUgZ97d9AHw0rEX3C8cAnJi7-vaU"
          />
        </div>
        <div className="relative z-20 max-w-4xl mx-auto px-6 text-center">
          <span className="inline-block px-4 py-1.5 mb-8 bg-secondary-container text-on-secondary-container rounded-full font-sans text-xs font-semibold shadow-sm">
            Tu refugio de oración
          </span>
          <h1 className="font-display text-4xl md:text-6xl leading-tight text-primary mb-6 tracking-tight">
            Conecta tu petición con personas dispuestas a orar por ti
          </h1>
          <p className="font-sans text-base md:text-lg text-base-content/80 mb-12 max-w-2xl mx-auto leading-relaxed">
            Únete a una comunidad global dedicada a la intercesión y el apoyo mutuo. Juntos, creamos un espacio de calma y esperanza en medio de la tempestad.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center font-sans">
            <Link
              href="/nueva-peticion"
              onClick={(e) => createRipple(e, e.currentTarget)}
              className="bg-primary text-primary-content hover:bg-primary-container px-10 py-4 rounded-full font-bold shadow-lg hover:scale-[1.02] transition-all duration-300 flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <span className="material-symbols-outlined text-[20px]">rebase_edit</span>
              Pedir Oración
            </Link>
            <Link
              href="/muro"
              onClick={(e) => createRipple(e, e.currentTarget)}
              className="border-2 border-primary text-primary hover:bg-primary/5 px-10 py-4 rounded-full font-bold transition-all duration-300 flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              Empezar a Orar
              <span className="material-symbols-outlined text-[20px]">volunteer_activism</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Stats */}
      <section className="py-20 bg-base-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="space-y-4">
              <div className="text-secondary mb-2">
                <span className="material-symbols-outlined text-[48px]">auto_awesome</span>
              </div>
              <h3 className="font-display text-xl md:text-2xl text-base-content font-medium">Paz Colectiva</h3>
              <p className="font-sans text-sm text-base-content/70 leading-relaxed">
                Siente el respaldo de cientos de almas orando al unísono por tu bienestar.
              </p>
            </div>
            <div className="space-y-4">
              <div className="text-secondary mb-2">
                <span className="material-symbols-outlined text-[48px]">filter_vintage</span>
              </div>
              <h3 className="font-display text-xl md:text-2xl text-base-content font-medium">Santuario Digital</h3>
              <p className="font-sans text-sm text-base-content/70 leading-relaxed">
                Un espacio libre de ruido, diseñado para la reflexión y la conexión profunda.
              </p>
            </div>
            <div className="space-y-4">
              <div className="text-secondary mb-2">
                <span className="material-symbols-outlined text-[48px]">all_inclusive</span>
              </div>
              <h3 className="font-display text-xl md:text-2xl text-base-content font-medium">Impacto Real</h3>
              <p className="font-sans text-sm text-base-content/70 leading-relaxed">
                Miles de testimonios de oraciones contestadas y vidas transformadas por la fe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Digital Candles & Testimonials */}
      <section className="py-24 bg-base-200/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-16 text-center">
            <h2 className="font-display text-3xl md:text-4xl text-primary mb-4 font-medium">Oraciones Contestadas</h2>
            <div className="w-24 h-1 bg-secondary-container mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch font-sans">
            {/* Large Featured Testimonial */}
            <div className="lg:col-span-8 bg-base-100 p-8 md:p-12 rounded-[2rem] shadow-sm flex flex-col justify-between border border-base-content/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                  <span className="inline-block px-4 py-1.5 bg-secondary/10 text-secondary rounded-full font-sans text-xs italic font-medium">
                    Testimonio de Sanidad
                  </span>
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
                      setTimeout(handleCandleClick, 300);
                    }}
                    className="flex items-center gap-2 text-amber-600 hover:text-amber-700 transition-colors px-4 py-1.5 rounded-full border border-amber-200/50 bg-amber-50/50 group cursor-pointer candle-buy-btn"
                  >
                    <span className="material-symbols-outlined text-sm animate-flicker">light_mode</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider font-sans">
                      Encender Vela ($0.99)
                    </span>
                  </button>
                </div>
                <blockquote className="font-display text-xl md:text-3xl text-primary leading-relaxed mb-8 italic">
                  &ldquo;Después de meses de incertidumbre, la comunidad de Oremos se unió en oración por mi madre. Ayer recibimos los resultados: todo está bien. La paz que sentí sabiendo que no estaba sola fue el milagro inicial.&rdquo;
                </blockquote>
              </div>
              <div className="flex items-center gap-4 relative z-10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Elena R."
                  className="w-12 h-12 rounded-full object-cover shadow-inner"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCp13i_Cxl-RSPp5XxSDER8a-dE3ZGN9BtEfF752d2vSYJnV1dbPR-gtF-ZMQPExHm3_QzRG7QVCYXF2Gm39sDO0RfVmn6uK1fG4hZmqhYgW5YzhHIdgQj5dZiIL7eQ1u0Rn5wNJ7kRPsxJz4VtgClZxDXOcGWcPPDLWtgsQd1xJGRDMHjWGnQuEyAkwJu8kUXbLsASD-ojYb0hCJ0ZpdUFW7QQGE-Roxle8FAqhjxAnVQpq3mKdyRbdaf56sCA8oC-NbUSerIctdI"
                />
                <div>
                  <p className="font-sans text-sm font-bold text-base-content">Elena Rodríguez</p>
                  <p className="font-sans text-xs text-base-content/60">Hace 2 días</p>
                </div>
              </div>
            </div>

            {/* Small Card 1 */}
            <div className="lg:col-span-4 bg-base-100 p-8 rounded-[2rem] shadow-sm flex flex-col justify-between border border-base-content/5">
              <div>
                <div className="mb-6 flex justify-between items-center">
                  <span className="material-symbols-outlined text-secondary text-3xl">format_quote</span>
                  <span className="flex items-center gap-1 text-amber-500 text-xs font-semibold font-sans">
                    <span className="material-symbols-outlined text-sm">light_mode</span>
                    12 Velas
                  </span>
                </div>
                <p className="font-sans text-sm md:text-base text-base-content/80 leading-relaxed mb-8">
                  &ldquo;Encontré consuelo cuando más lo necesitaba. Oremos es más que una app, es una familia espiritual.&rdquo;
                </p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt="Mateo S."
                    className="w-8 h-8 rounded-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVQvvTQU1B7uaGOPON1z-1kpKS0LS5WQ1BepCPg5QFHsD_eqGOjPoHZsYMZHTv9NYi26guzcATbO6rJOsoUciBlGWcuC4GjV_P2R4PqiCHN_InkIO2t6Q6XP5LImx8eXOoWNbsV8_KDctC_UGJb4CWRuh9BIiQ20Mn5JjXOCtrBq9PkXqtX-AQ455a1hmnA-rtzJNMBP0JpnsWd7yG9GmAlynlUkY_UbT-GEtIMEXYaRlfHpphnMuXQYvmtRmd8kQDcqmYsp3S9cY"
                  />
                  <span className="font-sans text-xs font-bold text-primary">Mateo Santos</span>
                </div>
                <button
                  onClick={(e) => {
                    createRipple(e, e.currentTarget, "rgba(255, 191, 0, 0.4)");
                    setTimeout(handleCandleClick, 300);
                  }}
                  className="p-2 text-amber-600 hover:bg-amber-50 rounded-full transition-colors cursor-pointer candle-buy-btn"
                >
                  <span className="material-symbols-outlined">light_mode</span>
                </button>
              </div>
            </div>

            {/* Small Card 2 */}
            <div className="lg:col-span-4 bg-base-100 p-8 rounded-[2rem] shadow-sm flex flex-col justify-between border border-base-content/5">
              <div>
                <div className="mb-6 flex justify-between items-center">
                  <span className="material-symbols-outlined text-secondary text-3xl">format_quote</span>
                  <span className="flex items-center gap-1 text-amber-500 text-xs font-semibold font-sans">
                    <span className="material-symbols-outlined text-sm">light_mode</span>
                    8 Velas
                  </span>
                </div>
                <p className="font-sans text-sm md:text-base text-base-content/80 leading-relaxed mb-8">
                  &ldquo;Publiqué mi petición de trabajo y en menos de una hora ya tenía 50 personas diciendo &apos;Amén&apos;. Conseguí el empleo esa misma semana.&rdquo;
                </p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt="Lucía V."
                    className="w-8 h-8 rounded-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDCwE-QfhykUWvDFfQEj_aC_KFVa8-7W5umLUsVyCwCYoPWecSyGWOE4ZEAX5GeO-QWl0CdsuL-FBC-j3O290OLNcB0grYLIjGS4FN0D_BLfOzhhLSGSO4Ve9JkyzybQkUCaL6XNRnrPgdgS83Hwh5FjMR3Js-a1mbvmCN_eN0Nrc9gskv_G1Sh8ED1eHQ6RxDcFsK6Jv2mF43fTRwrR3g35Dx5aOAV1wtqZIzEVaCGlbL4JCuvKvJkXntNJoarQpaoV9Fa2X7umU4"
                  />
                  <span className="font-sans text-xs font-bold text-primary">Lucía Varela</span>
                </div>
                <button
                  onClick={(e) => {
                    createRipple(e, e.currentTarget, "rgba(255, 191, 0, 0.4)");
                    setTimeout(handleCandleClick, 300);
                  }}
                  className="p-2 text-amber-600 hover:bg-amber-50 rounded-full transition-colors cursor-pointer candle-buy-btn"
                >
                  <span className="material-symbols-outlined">light_mode</span>
                </button>
              </div>
            </div>

            {/* Medium Image Card */}
            <div className="lg:col-span-8 relative rounded-[2rem] overflow-hidden group min-h-[300px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="Luz a través de las manos"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJBd0EX6ySXzc4lvBqkCSEdgk6RQkHcapNb8n_rbGwkyd2d4IN0vv-F5cvGe69fCkRnY0cyuB-j-hRC07K6sBlypCwh-KCiGjwPv9BG6FpyCYrf7LjsJXDE7h3g8sNJ8cmRCdVsjmBESqsIkdrpCbbWZ1wVdT-uZT4ULos4asCrmkOeeuYyxrOFVsrUhNur5JPMGsmYxCAo0Z4BXt-NY0s4hr1CrA5KvEub2B0sQ52ukTkgqJSvN3cjWSoHATfdHOoDX0nbrZN5hk"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent flex items-end p-8 md:p-12 z-10">
                <div className="text-white relative z-20">
                  <h4 className="font-display text-xl md:text-3xl mb-2 font-medium">Únete a la Cadena</h4>
                  <p className="font-sans text-sm opacity-90">Más de 500,000 oraciones elevadas este mes.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing / Membership Plans */}
      <section className="py-24 bg-base-100" id="planes">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-16 text-center">
            <h2 className="font-display text-3xl md:text-4xl text-primary mb-4 font-medium">
              Apoya nuestra misión de conectar corazones
            </h2>
            <p className="font-sans text-sm md:text-base text-base-content/70 max-w-xl mx-auto">
              Elige la forma que mejor se adapte a tu necesidad de conexión y apoyo espiritual.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch font-sans">
            {/* Plan Gratuito */}
            <div className="bg-base-200/50 p-8 rounded-[2rem] border border-base-content/5 flex flex-col justify-between hover:shadow-lg transition-shadow">
              <div>
                <h3 className="font-display text-xl md:text-2xl text-primary mb-2">Plan Gratuito</h3>
                <p className="text-xs text-base-content/70 mb-6">Para empezar tu camino</p>
                <div className="text-3xl md:text-4xl font-display text-base-content mb-8">Gratis</div>
                <ul className="space-y-4 mb-10 text-sm">
                  <li className="flex items-center gap-3 text-base-content/80">
                    <span className="material-symbols-outlined text-secondary text-base">check_circle</span>
                    Muro público de oraciones
                  </li>
                  <li className="flex items-center gap-3 text-base-content/80">
                    <span className="material-symbols-outlined text-secondary text-base">check_circle</span>
                    Acceso a grupos abiertos
                  </li>
                </ul>
              </div>
              <Link
                href="/muro"
                onClick={(e) => createRipple(e, e.currentTarget)}
                className="w-full py-3 rounded-full bg-primary text-primary-content font-bold shadow-md hover:bg-primary/95 text-center text-sm"
              >
                Comenzar ahora
              </Link>
            </div>

            {/* Plan Premium */}
            <div className="bg-primary/10 text-primary p-8 rounded-[2rem] border border-primary/20 flex flex-col justify-between relative overflow-hidden z-10 hover:shadow-lg transition-all scale-105">
              <div className="absolute top-4 right-6 bg-secondary text-on-secondary px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider">
                Recomendado
              </div>
              <div>
                <h3 className="font-display text-xl md:text-2xl mb-2 text-primary">Plan Premium</h3>
                <p className="text-xs text-base-content/70 mb-6">Conexión más profunda</p>
                <div className="text-3xl md:text-4xl font-display mb-8">
                  $3.99 <span className="text-xs opacity-80">/ mes</span>
                </div>
                <ul className="space-y-4 mb-10 text-sm">
                  <li className="flex items-center gap-3 text-base-content/90">
                    <span className="material-symbols-outlined text-secondary text-base">check_circle</span>
                    Peticiones privadas ilimitadas
                  </li>
                  <li className="flex items-center gap-3 text-base-content/90">
                    <span className="material-symbols-outlined text-secondary text-base">check_circle</span>
                    Creación de grupos propios
                  </li>
                  <li className="flex items-center gap-3 text-base-content/90">
                    <span className="material-symbols-outlined text-secondary text-base">check_circle</span>
                    Historial completo de fe
                  </li>
                  <li className="flex items-center gap-3 text-base-content/90">
                    <span className="material-symbols-outlined text-secondary text-base">check_circle</span>
                    Insignia de benefactor
                  </li>
                </ul>
              </div>
              <Link
                href="/apoyo"
                onClick={(e) => createRipple(e, e.currentTarget)}
                className="w-full py-3 rounded-full bg-primary text-primary-content font-bold shadow-md hover:bg-primary/95 text-center text-sm"
              >
                Obtener Premium
              </Link>
            </div>

            {/* Plan Iglesias */}
            <div className="bg-base-200/50 p-8 rounded-[2rem] border border-base-content/5 flex flex-col justify-between hover:shadow-lg transition-shadow">
              <div>
                <h3 className="font-display text-xl md:text-2xl text-primary mb-2">Plan Iglesias</h3>
                <p className="text-xs text-base-content/70 mb-6">Para comunidades</p>
                <div className="text-3xl md:text-4xl font-display text-base-content mb-8">
                  $29.99 <span className="text-xs opacity-80">/ mes</span>
                </div>
                <ul className="space-y-4 mb-10 text-sm">
                  <li className="flex items-center gap-3 text-base-content/80">
                    <span className="material-symbols-outlined text-secondary text-base">check_circle</span>
                    Espacio propio para la iglesia
                  </li>
                  <li className="flex items-center gap-3 text-base-content/80">
                    <span className="material-symbols-outlined text-secondary text-base">check_circle</span>
                    Muro privado y estadísticas
                  </li>
                  <li className="flex items-center gap-3 text-base-content/80">
                    <span className="material-symbols-outlined text-secondary text-base">check_circle</span>
                    Branding personalizado
                  </li>
                </ul>
              </div>
              <Link
                href="/apoyo"
                onClick={(e) => createRipple(e, e.currentTarget)}
                className="w-full py-3 rounded-full bg-primary text-primary-content font-bold shadow-md hover:bg-primary/95 text-center text-sm"
              >
                Apoyar como Comunidad
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-24 bg-secondary/5">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="bg-base-100/80 backdrop-blur-md max-w-3xl mx-auto rounded-[3rem] p-10 md:p-16 border border-base-content/5 shadow-xl relative overflow-hidden">
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-secondary/10 blur-[100px] rounded-full"></div>
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/10 blur-[100px] rounded-full"></div>
            
            <h2 className="font-display text-3xl md:text-4xl text-primary mb-6 relative z-10 font-medium">
              ¿Deseas que oremos por ti hoy?
            </h2>
            <p className="font-sans text-sm md:text-base text-base-content/80 mb-12 relative z-10 max-w-xl mx-auto leading-relaxed">
              No importa cuán grande o pequeña sea tu carga. Nuestra comunidad está aquí para escucharte y elevar tu voz al cielo.
            </p>
            
            <Link
              href="/nueva-peticion"
              onClick={(e) => createRipple(e, e.currentTarget, "rgba(107, 85, 132, 0.4)")}
              className="bg-secondary text-on-secondary px-12 py-5 rounded-full font-display text-lg shadow-lg hover:shadow-secondary/20 hover:scale-[1.02] transition-all duration-300 relative z-10 inline-flex items-center justify-center gap-3 amen-glow"
              id="amen-cta"
            >
              <span className="material-symbols-outlined">auto_awesome</span>
              Pedir Oración Ahora
            </Link>
            
            <p className="mt-8 font-sans text-xs text-base-content/60 italic relative z-10">
              &ldquo;Donde dos o tres se reúnen en mi nombre, allí estoy yo en medio de ellos.&rdquo;
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
