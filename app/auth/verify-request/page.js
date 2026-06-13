import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";

export default function VerifyRequestPage() {
  return (
    <main className="min-h-[100dvh] bg-cream-bg flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-5 sm:mb-6">
          <BrandLogo href="/" size="md" showLink={false} className="sm:hidden" />
          <BrandLogo href="/" size="lg" showLink={false} className="hidden sm:inline-flex" />
        </div>

        <div className="bg-base-100 rounded-2xl sm:rounded-3xl border border-base-content/5 shadow-lg p-6 sm:p-8">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5 sm:mb-6">
            <span className="material-symbols-outlined text-2xl sm:text-3xl text-primary">mark_email_unread</span>
          </div>

          <h1 className="font-display text-xl sm:text-2xl text-primary mb-3 tracking-tight">
            Revisa tu correo
          </h1>
          <p className="font-sans text-sm sm:text-base text-base-content/70 leading-relaxed mb-2 px-1">
            Te enviamos un enlace mágico para iniciar sesión. Ábrelo desde el mismo dispositivo donde lo solicitaste.
          </p>
          <p className="font-sans text-xs text-base-content/50">
            Si no lo ves, revisa la carpeta de spam.
          </p>
        </div>

        <p className="text-center mt-8 font-sans text-sm text-base-content/60">
          <Link href="/auth/signin" className="link link-hover text-primary font-semibold">
            Volver a iniciar sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
