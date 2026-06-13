"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import BrandLogo from "@/components/BrandLogo";
import config from "@/config";

const errorMessages = {
  Configuration: "Error de configuración. Intenta más tarde.",
  AccessDenied: "Acceso denegado.",
  Verification: "El enlace expiró o ya fue usado. Solicita uno nuevo.",
  OAuthSignin: "No se pudo iniciar sesión con Google. Intenta de nuevo.",
  OAuthCallback: "No se pudo completar el inicio con Google.",
  Default: "Ocurrió un error al iniciar sesión. Intenta de nuevo.",
};

function GoogleIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export default function SignInForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || config.auth.callbackUrl;
  const error = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsEmailLoading(true);
    await signIn("email", { email: email.trim(), callbackUrl });
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    await signIn("google", { callbackUrl });
  };

  const isLoading = isEmailLoading || isGoogleLoading;

  return (
    <main className="min-h-[100dvh] bg-cream-bg flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 sm:mb-10">
          <div className="flex justify-center mb-5 sm:mb-6">
            <BrandLogo href="/" size="md" showLink={false} className="sm:hidden" />
            <BrandLogo href="/" size="lg" showLink={false} className="hidden sm:inline-flex" />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl text-primary mb-3 tracking-tight">
            Bienvenido de nuevo
          </h1>
          <p className="font-sans text-sm sm:text-base text-base-content/70 leading-relaxed max-w-sm mx-auto px-1">
            Inicia sesión para unirte a la comunidad de oración y acompañar a quienes lo necesitan.
          </p>
        </div>

        <div className="bg-base-100 rounded-2xl sm:rounded-3xl border border-base-content/5 shadow-lg p-6 sm:p-8">
          {error && (
            <div className="alert alert-error mb-6 text-sm py-3">
              <span className="material-symbols-outlined text-lg">error</span>
              <span>{errorMessages[error] || errorMessages.Default}</span>
            </div>
          )}

          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div className="form-control">
              <label htmlFor="email" className="label py-1">
                <span className="label-text font-semibold text-base-content/80">
                  Correo electrónico
                </span>
              </label>
              <input
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="input input-bordered w-full bg-base-100 focus:outline-none focus:border-primary"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full rounded-full font-bold shadow-md min-h-12 text-sm sm:text-base"
              disabled={isLoading}
            >
              {isEmailLoading ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">mail</span>
                  Continuar con correo
                </>
              )}
            </button>
          </form>

          <div className="divider my-6 text-xs text-base-content/40 font-semibold uppercase tracking-wider">
            o
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="btn btn-outline w-full rounded-full border-base-content/15 hover:border-primary/30 hover:bg-primary/5 font-semibold min-h-12 text-sm sm:text-base"
            disabled={isLoading}
          >
            {isGoogleLoading ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              <>
                <GoogleIcon />
                Continuar con Google
              </>
            )}
          </button>
        </div>

        <p className="text-center mt-8 font-sans text-sm text-base-content/60">
          <Link href="/" className="link link-hover text-primary font-semibold">
            Volver al inicio
          </Link>
        </p>
      </div>
    </main>
  );
}
