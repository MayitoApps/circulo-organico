import Link from "next/link";
import { Leaf, MapPin, ShieldCheck } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-[#E4DDD1] bg-[#1B3B2B] text-[#FAF8F5]">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="leading-none">
              <span className="font-editorial text-2xl italic tracking-wide text-white">
                Círculo
              </span>
              <span className="mt-0.5 block text-[11px] font-semibold uppercase tracking-[0.28em] text-[#C8B289]">
                ORGÁNICO
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/75">
              El programa de lealtad y recompensas multi-perfil de Grupo Orgánico Hoteles
              Boutique. Seis propiedades únicas, experiencias OTAM y artículos Amanecer bajo un
              mismo círculo.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-[#C8B289]">
              <Leaf className="h-3.5 w-3.5" />
              <span>1 punto = $1 MXN · Vigencia 24 meses</span>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C8B289]">
              Programa y Sedes
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-white/80">
              <li>
                <Link
                  href="/hoteles"
                  className="inline-block transition-all duration-200 hover:translate-x-1 hover:text-white"
                >
                  Nuestros Seis Hoteles
                </Link>
              </li>
              <li>
                <Link
                  href="/membresias"
                  className="inline-block transition-all duration-200 hover:translate-x-1 hover:text-white"
                >
                  Membresías, Niveles y Cortesías
                </Link>
              </li>
              <li>
                <Link
                  href="/experiencias"
                  className="inline-block transition-all duration-200 hover:translate-x-1 hover:text-white"
                >
                  Momentos Orgánico
                </Link>
              </li>
              <li>
                <Link
                  href="/compromiso"
                  className="inline-block transition-all duration-200 hover:translate-x-1 hover:text-white"
                >
                  Compromiso Social y Medioambiente
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C8B289]">
              Alianzas y Marcas
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-white/80">
              <li>
                <Link
                  href="/otam"
                  className="inline-block transition-all duration-200 hover:translate-x-1 hover:text-white"
                >
                  OTAM Experiencias y Grupos
                </Link>
              </li>
              <li>
                <Link
                  href="/amanecer"
                  className="inline-block transition-all duration-200 hover:translate-x-1 hover:text-white"
                >
                  Amanecer Artículos Personalizados
                </Link>
              </li>
              <li>
                <Link
                  href="/empresas"
                  className="inline-block transition-all duration-200 hover:translate-x-1 hover:text-white"
                >
                  Programa para Empresas
                </Link>
              </li>
              <li>
                <Link
                  href="/agencias"
                  className="inline-block transition-all duration-200 hover:translate-x-1 hover:text-white"
                >
                  Agencias y Organizadores
                </Link>
              </li>
              <li>
                <Link
                  href="/registro"
                  className="inline-block transition-all duration-200 hover:translate-x-1 hover:text-white"
                >
                  Únete gratis a Círculo Orgánico
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C8B289]">
              Las 6 Sedes Oficiales
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-white/80">
              <li className="group flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-[#C8B289] transition-transform duration-200 group-hover:scale-110" />
                <Link
                  href="/hoteles/ajusco"
                  className="transition-all duration-200 group-hover:translate-x-1 group-hover:text-white"
                >
                  Orgánico Ajusco
                </Link>
              </li>
              <li className="group flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-[#C8B289] transition-transform duration-200 group-hover:scale-110" />
                <Link
                  href="/hoteles/tepoztlan"
                  className="transition-all duration-200 group-hover:translate-x-1 group-hover:text-white"
                >
                  Orgánico Tepoztlán
                </Link>
              </li>
              <li className="group flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-[#C8B289] transition-transform duration-200 group-hover:scale-110" />
                <Link
                  href="/hoteles/valle"
                  className="transition-all duration-200 group-hover:translate-x-1 group-hover:text-white"
                >
                  Orgánico Valle
                </Link>
              </li>
              <li className="group flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-[#C8B289] transition-transform duration-200 group-hover:scale-110" />
                <Link
                  href="/hoteles/veracruz"
                  className="transition-all duration-200 group-hover:translate-x-1 group-hover:text-white"
                >
                  Orgánico Veracruz
                </Link>
              </li>
              <li className="group flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-[#C8B289] transition-transform duration-200 group-hover:scale-110" />
                <Link
                  href="/hoteles/quinta-soledad"
                  className="transition-all duration-200 group-hover:translate-x-1 group-hover:text-white"
                >
                  Quinta Soledad
                </Link>
              </li>
              <li className="group flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-[#C8B289] transition-transform duration-200 group-hover:scale-110" />
                <Link
                  href="/hoteles/roma-norte"
                  className="transition-all duration-200 group-hover:translate-x-1 group-hover:text-white"
                >
                  Roma Norte
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/15 pt-8 text-xs text-white/65 sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} Grupo Orgánico Hoteles Boutique · Círculo Orgánico. Todos
            los derechos reservados.
          </p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-[#C8B289]" />
              Cálculo sobre importe neto elegible sin impuestos ni propinas
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
