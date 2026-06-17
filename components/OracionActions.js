"use client";

import toast from "react-hot-toast";
import config from "@/config";

export default function OracionActions({ titulo, texto, slug }) {
  const shareUrl = `https://${config.domainName}/oraciones/${slug}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    `${titulo}\n\n${texto}\n\nOremos — ${shareUrl}`
  )}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(texto);
      toast.success("Oración copiada al portapapeles");
    } catch {
      toast.error("No se pudo copiar. Intenta seleccionar el texto manualmente.");
    }
  };

  return (
    <div className="flex flex-wrap gap-3 mb-10">
      <button
        type="button"
        onClick={handleCopy}
        className="btn btn-outline btn-sm rounded-full border-primary/30 text-primary hover:bg-primary/5"
      >
        <span className="material-symbols-outlined text-base">content_copy</span>
        Copiar oración
      </button>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-sm rounded-full bg-[#25D366] hover:bg-[#1da851] text-white border-none"
      >
        <span className="material-symbols-outlined text-base">share</span>
        Compartir en WhatsApp
      </a>
    </div>
  );
}
