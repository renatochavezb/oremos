"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import ButtonAccount from "./ButtonAccount";
import ButtonSignin from "./ButtonSignin";
import BrandLogo from "./BrandLogo";
import { ProximamenteButton } from "./Proximamente";

const Header = () => {
  const pathname = usePathname();
  const { data: session } = useSession();

  const links = [
    { href: "/", label: "Inicio", icon: "home" },
    { href: "/oraciones", label: "Oraciones", icon: "menu_book" },
    { href: "/muro", label: "Muro", icon: "forum" },
    { href: "/nueva-peticion", label: "Pedir", icon: "add_circle" },
    { href: "/comunidad", label: "Comunidad", icon: "group" },
    { href: "/apoyo", label: "Apoyo", icon: "volunteer_activism" },
  ];

  return (
    <>
      {/* Desktop Navigation Header */}
      <nav className="bg-base-100/70 backdrop-blur-md sticky top-0 z-[100] border-b border-base-content/5">
        <div className="flex justify-between items-center w-full px-6 md:px-12 py-3 max-w-7xl mx-auto min-h-[5.5rem]">
          <BrandLogo size="lg" />
          
          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-8 font-sans">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm tracking-wide font-medium transition-colors hover:text-primary ${
                    isActive ? "text-primary border-b-2 border-primary pb-1" : "text-base-content/75"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* User Signin / Profile */}
          <div className="flex items-center gap-3">
            <ProximamenteButton
              variant="header"
              className="hidden sm:flex"
              icon={
                <span
                  className="material-symbols-outlined text-[18px]"
                  style={{ fontVariationSettings: "'FILL' 0" }}
                >
                  volunteer_activism
                </span>
              }
            >
              Donar
            </ProximamenteButton>
            {session ? (
              <ButtonAccount />
            ) : (
              <ButtonSignin text="Iniciar Sesión" extraStyle="btn-primary rounded-full px-6 btn-sm md:btn-md" />
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation (Visible on small screens only) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-base-100/90 backdrop-blur-lg border-t border-base-content/10 px-4 pb-5 pt-3 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] rounded-t-2xl flex justify-around items-center">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center transition-all ${
                isActive
                  ? "bg-secondary-container text-on-secondary-container rounded-2xl px-5 py-2 scale-95"
                  : "text-base-content/60 hover:text-primary p-2"
              }`}
            >
              <span
                className="material-symbols-outlined text-2xl"
                style={{
                  fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                {link.icon}
              </span>
              <span className={`text-[10px] mt-1 font-sans ${isActive ? "font-bold" : "font-medium"}`}>
                {link.label}
              </span>
            </Link>
          );
        })}
      </nav>
      {/* Mobile spacing padding so content doesn't get cut off behind the sticky bottom nav */}
      <div className="md:hidden h-24"></div>
    </>
  );
};

export default Header;
