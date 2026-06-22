import Link from "next/link";
import config from "@/config";
import BrandLogo from "./BrandLogo";
import { ProximamenteButton } from "./Proximamente";

const Footer = () => {
  return (
    <footer className="bg-base-200 border-t border-base-content/5 py-16" id="donaciones">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <div className="mb-6">
              <BrandLogo showLink={false} size="md" />
            </div>
            <p className="text-base-content/85 text-sm italic max-w-sm mb-6">
              &ldquo;Llevad los unos las cargas de los otros, y cumplid así la ley de Cristo.&rdquo;
            </p>
            <div className="bg-base-100 p-6 rounded-2xl inline-block border border-base-content/5 max-w-sm">
              <h4 className="font-semibold text-primary text-xs tracking-wider uppercase mb-2">Donaciones</h4>
              <p className="text-xs text-base-content/70 mb-4 leading-relaxed">
                Si {config.appName} te ha ayudado, considera apoyar la plataforma para mantenerla libre de publicidad y accesible para todos.
              </p>
              <ProximamenteButton variant="primary" className="px-6 py-2">
                Donar con Amor
              </ProximamenteButton>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-base-content tracking-wider text-xs uppercase mb-6">Enlaces</h4>
            <ul className="space-y-4 text-sm text-base-content/85">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/muro" className="hover:text-primary transition-colors">
                  Muro de Oración
                </Link>
              </li>
              <li>
                <Link href="/nueva-peticion" className="hover:text-primary transition-colors">
                  Nueva Petición
                </Link>
              </li>
              <li>
                <Link href="/comunidad" className="hover:text-primary transition-colors">
                  Comunidad
                </Link>
              </li>
              <li>
                <Link href="/apoyo" className="hover:text-primary transition-colors">
                  Página de Apoyo
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-base-content tracking-wider text-xs uppercase mb-6">Soporte y Legal</h4>
            <ul className="space-y-4 text-sm text-base-content/85">
              {config.resend.supportEmail && (
                <li>
                  <a href={`mailto:${config.resend.supportEmail}`} className="hover:text-primary transition-colors">
                    Soporte Técnico
                  </a>
                </li>
              )}
              <li>
                <Link href="/privacy-policy" className="hover:text-primary transition-colors">
                  Privacidad
                </Link>
              </li>
              <li>
                <Link href="/tos" className="hover:text-primary transition-colors">
                  Términos de Servicio
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="text-center pt-8 border-t border-base-content/5 text-xs text-base-content/50">
          © {new Date().getFullYear()} {config.appName}. Hecho con fe para el mundo.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
