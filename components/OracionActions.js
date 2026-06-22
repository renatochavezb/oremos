"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import config from "@/config";
import axios from "axios";

export default function OracionActions({ titulo, texto, slug, id, isCommunity, initialPrayersCount, showDelete }) {
  const shareUrl = `https://${config.domainName}/oraciones/${slug}`;
  
  // WhatsApp Share Message that contains the written prayer text (texto) and a link to hear/read the prayer
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    `Escucha y reza esta hermosa oración en ${config.appName}:\n\n*${titulo}*\n\n"${texto}"\n\nEscucha el audio y únete en oración aquí:\n${shareUrl}`
  )}`;

  const [prayersCount, setPrayersCount] = useState(initialPrayersCount || 0);
  const [hasPrayed, setHasPrayed] = useState(false);
  const [loading, setLoading] = useState(false);

  // Audio state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(texto);
      toast.success("Oración copiada al portapapeles");
    } catch {
      toast.error("No se pudo copiar. Intenta seleccionar el texto manualmente.");
    }
  };

  const handlePray = async () => {
    if (hasPrayed || loading) return;
    setLoading(true);
    try {
      if (isCommunity && id) {
        const res = await axios.post(`/api/community-prayers/${id}/pray`);
        setPrayersCount(res.data.prayersCount);
      } else {
        const res = await axios.post(`/api/static-prayers/${slug}/pray`);
        setPrayersCount(res.data.prayersCount);
      }
      setHasPrayed(true);
      toast.success("Amén. Te has unido en oración.");
    } catch (err) {
      console.error(err);
      toast.error("Error al registrar tu oración");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta oración de forma permanente?")) return;

    try {
      await axios.delete(`/api/community-prayers/${id}`);
      toast.success("Oración eliminada correctamente");
      window.location.href = "/oraciones";
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Error al eliminar la oración");
    }
  };

  // Text-To-Speech: Play/Pause/Resume
  const handlePlayAudio = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast.error("Tu navegador no soporta la reproducción de voz.");
      return;
    }

    const synth = window.speechSynthesis;

    if (isSpeaking) {
      if (isPaused) {
        synth.resume();
        setIsPaused(false);
      } else {
        synth.pause();
        setIsPaused(true);
      }
    } else {
      synth.cancel(); // Cancel any existing speech
      const utterance = new SpeechSynthesisUtterance(texto);
      utterance.lang = "es-MX";

      // Select a Mexican Spanish voice if available, fallback to Latin American, then generic Spanish
      const voices = synth.getVoices();
      let selectedVoice = voices.find(
        (v) => v.lang === "es-MX" || v.lang === "es_MX" || v.lang.toLowerCase().replace("_", "-") === "es-mx"
      );

      if (!selectedVoice) {
        selectedVoice = voices.find(
          (v) =>
            v.lang.startsWith("es-419") ||
            v.lang.startsWith("es-US") ||
            v.lang.startsWith("es-CO") ||
            v.lang.startsWith("es-AR")
        );
      }

      if (!selectedVoice) {
        selectedVoice = voices.find((v) => v.lang.startsWith("es"));
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };

      setIsSpeaking(true);
      setIsPaused(false);
      synth.speak(utterance);
    }
  };

  // Text-To-Speech: Stop
  const handleStopAudio = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 font-sans mt-6 font-medium">
      <div className="flex flex-wrap items-center gap-2.5 md:gap-3 w-full">
        {/* Left Button Group */}
        <div className="flex flex-wrap items-center gap-2.5 md:gap-3">
          {/* Play/Pause Button */}
          <button
            type="button"
            onClick={handlePlayAudio}
            title={isSpeaking ? (isPaused ? "Reanudar audio" : "Pausar audio") : "Escuchar oración"}
            className={`w-12 h-12 flex items-center justify-center border transition-all rounded-xl cursor-pointer ${
              isSpeaking && !isPaused
                ? "bg-amber-500/10 border-amber-500/30 text-amber-600 hover:bg-amber-500/20"
                : "bg-primary/5 border-primary/10 hover:border-primary/20 text-primary/80 hover:text-primary hover:bg-primary/10"
            }`}
          >
            <span className="material-symbols-outlined !text-[32px]">
              {isSpeaking && !isPaused ? "pause" : "play_arrow"}
            </span>
          </button>

          {/* Stop Button */}
          {isSpeaking && (
            <button
              type="button"
              onClick={handleStopAudio}
              title="Detener"
              className="w-12 h-12 flex items-center justify-center bg-primary/5 border border-primary/10 hover:border-primary/20 text-primary/80 hover:text-primary hover:bg-primary/10 rounded-xl transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined !text-[32px]">stop</span>
            </button>
          )}

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            title="Copiar oración"
            className="w-12 h-12 flex items-center justify-center bg-primary/5 border border-primary/10 hover:border-primary/20 text-primary/80 hover:text-primary hover:bg-primary/10 rounded-xl transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined !text-[32px]">content_copy</span>
          </button>

          {/* "Yo recé esta oración" Button */}
          <button
            type="button"
            onClick={handlePray}
            disabled={hasPrayed || loading}
            className={`px-5 h-12 flex items-center justify-center gap-2.5 border transition-all rounded-xl cursor-pointer text-xs md:text-sm font-semibold ${
              hasPrayed
                ? "bg-secondary/10 border-secondary/20 text-secondary hover:bg-secondary/20"
                : "bg-primary/5 border-primary/10 hover:border-primary/20 text-primary/80 hover:text-primary hover:bg-primary/10"
            }`}
          >
            <span className="material-symbols-outlined !text-2xl">
              {hasPrayed ? "favorite" : "favorite_border"}
            </span>
            <span>{hasPrayed ? "¡Ya rezaste!" : "Yo recé esta oración"}</span>
          </button>

          {/* Delete Button (shown if authorized) */}
          {showDelete && (
            <button
              type="button"
              onClick={handleDelete}
              title="Eliminar oración"
              className="w-12 h-12 flex items-center justify-center bg-red-500/5 border border-red-500/10 hover:border-red-500/20 text-red-600 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined !text-[32px]">delete</span>
            </button>
          )}
        </div>

        {/* Right Button Group: "Compartir" */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 h-12 flex items-center justify-center gap-2.5 border border-primary/10 bg-primary/5 hover:bg-primary/10 text-primary/80 hover:text-primary hover:border-primary/20 rounded-xl transition-all cursor-pointer text-xs md:text-sm font-semibold sm:ml-auto w-full sm:w-auto"
        >
          <span className="material-symbols-outlined !text-2xl">share</span>
          <span>Compartir</span>
        </a>
      </div>

      {/* Dynamic Count (small text inside the card at the bottom) */}
      <p className="text-[11px] text-primary/50 italic mt-1 font-sans">
        Esta oración ha sido rezada por <strong>{prayersCount}</strong> {prayersCount === 1 ? "persona" : "personas"} de la comunidad.
      </p>
    </div>
  );
}
