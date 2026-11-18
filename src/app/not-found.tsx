import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[65vh] flex-col items-center justify-center bg-[#FAF8F5] px-4 text-center">
      <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9E6B4B]">
        Círculo Orgánico
      </span>
      <h1 className="mt-3 font-editorial text-5xl font-medium text-[#1B3B2B]">
        Página no encontrada
      </h1>
      <p className="mt-3 max-w-md text-sm text-[#5E645F]">
        La ruta que buscas no existe o fue movida. Vuelve al inicio para explorar nuestros seis
        hoteles, niveles y experiencias.
      </p>
      <Link
        href="/"
        className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#1B3B2B] px-6 py-3 text-xs font-semibold text-white hover:bg-[#132A1E]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Volver al inicio
      </Link>
    </div>
  );
}
