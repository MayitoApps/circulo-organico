export type PropertySlug =
  | "ajusco"
  | "tepoztlan"
  | "valle"
  | "veracruz"
  | "quinta-soledad"
  | "roma-norte";

export type PropertyCode =
  | "AJUSCO"
  | "TEPOZTLAN"
  | "VALLE"
  | "VERACRUZ"
  | "QUINTA_SOLEDAD"
  | "ROMA_NORTE";

export interface CanonicalProperty {
  code: PropertyCode;
  slug: PropertySlug;
  name: string;
  tagline: string;
  location: string;
  regionLabel: string;
  baseNightPriceMxn: number;
  hasSpaCenter: boolean;
  imageUrl: string;
  websiteUrl: string;
  description: string;
  highlights: string[];
  petFriendly: boolean;
}

export const CANONICAL_PROPERTIES: CanonicalProperty[] = [
  {
    code: "AJUSCO",
    slug: "ajusco",
    name: "Orgánico Ajusco",
    tagline: "Una escapada entre árboles.",
    location: "San Miguel Ajusco, Tlalpan, CDMX",
    regionLabel: "Bosque a 3,000 m",
    baseNightPriceMxn: 4800,
    hasSpaCenter: true,
    imageUrl: "https://www.gohb.com.mx/assets/images/ajusco1.jpg",
    websiteUrl: "https://www.organicohotelboutique.com/",
    description:
      "Santuario privado de suites entre pinos y coníferas a 3,000 m s. n. m., construido en madera y piedra volcánica. Disfruta cocina a las brasas en Fuego, recetas mexicanas en Don Petro, Bar Miel Sobre Limón, fogatas y bienestar holístico.",
    highlights: [
      "Suites de autor (Mini, Standard, Premium y Master) con privacidad total",
      "Restaurantes Don Petro y Fuego, además del Bar Miel Sobre Limón",
      "Fogatadas nocturnas, Cinema Orgánico al aire libre y Origen Spa",
    ],
    petFriendly: true,
  },
  {
    code: "TEPOZTLAN",
    slug: "tepoztlan",
    name: "Orgánico Tepoztlán",
    tagline: "Una pausa con vista a la montaña.",
    location: "Santo Domingo, Tepoztlán, Mor.",
    regionLabel: "Pueblo Mágico · Tepozteco",
    baseNightPriceMxn: 5200,
    hasSpaCenter: true,
    imageUrl: "https://www.gohb.com.mx/assets/images/Tepoz1.jpg",
    websiteUrl: "https://www.organicohotelboutiquetepoz.com/",
    description:
      "Refugio íntimo en las faldas del Tepozteco con arquitectura de piedra volcánica y madera curada. Ofrece habitaciones con terraza y jardín privado, alberca frente a los riscos, Restaurante Infinito, Cinema Orgánico y rituales de Origen Spa.",
    highlights: [
      "Alberca al aire libre rodeada de riscos con vista al Tepozteco",
      "Habitaciones Estándar y Premium con terraza y jardín privado",
      "Restaurante Infinito, más de 730 m² de jardines y 100% Pet Friendly",
    ],
    petFriendly: true,
  },
  {
    code: "VALLE",
    slug: "valle",
    name: "Orgánico Valle",
    tagline: "Días para disfrutar con calma.",
    location: "Valle de Bravo, Edo. de Méx.",
    regionLabel: "6+ hectáreas de bosque",
    baseNightPriceMxn: 5000,
    hasSpaCenter: true,
    imageUrl: "https://www.gohb.com.mx/assets/images/Valle1.jpg",
    websiteUrl: "https://www.organicohotelboutiquevalle.com/",
    description:
      "Santuario de lujo rústico en más de 6 hectáreas de bosque y jardines, a cinco minutos del centro y del lago. Cuenta con 40 suites privadas con balcón interior, Restaurante Milagro, Bar Bienaventurado, alberca y Origen Spa.",
    highlights: [
      "40 suites privadas (Premium y Familiar) entre bosque y jardines",
      "Restaurante Milagro, Bar Bienaventurado con fogateros y alberca",
      "Origen Centro Holístico y Spa, senderos y espacio 100% Pet Friendly",
    ],
    petFriendly: true,
  },
  {
    code: "VERACRUZ",
    slug: "veracruz",
    name: "Orgánico Veracruz",
    tagline: "Un cambio de aire junto al mar.",
    location: "La Vigueta, Costa Esmeralda, Ver.",
    regionLabel: "Costa Esmeralda · Playa",
    baseNightPriceMxn: 4400,
    hasSpaCenter: true,
    imageUrl: "https://www.gohb.com.mx/assets/images/Veracruz1.jpg",
    websiteUrl: "https://www.gohb.com.mx/hoteles-organicos",
    description:
      "Escapada frente al Golfo de México en La Vigueta, Tecolutla, dentro de Costa Esmeralda. Ofrece habitaciones climatizadas con terraza hacia áreas verdes o alberca, acceso a playa privada, alberca entre palmas y cocina costera veracruzana.",
    highlights: [
      "Acceso a zona de playa privada y alberca al aire libre entre palmas",
      "Habitaciones climatizadas con terraza hacia jardines o alberca",
      "Cocina tradicional veracruzana, masajes y eventos frente al mar",
    ],
    petFriendly: true,
  },
  {
    code: "QUINTA_SOLEDAD",
    slug: "quinta-soledad",
    name: "Quinta Soledad",
    tagline: "Un lugar para crear buenos recuerdos.",
    location: "Tlalpan Centro, CDMX",
    regionLabel: "Casona Histórica · 1870",
    baseNightPriceMxn: 6200,
    hasSpaCenter: true,
    imageUrl: "https://www.gohb.com.mx/assets/images/Quinta1.jpg",
    websiteUrl: "https://www.centroculturalquintasoledad.com/",
    description:
      "Emblemática casona neorrenacentista de 1870 en el corazón de Tlalpan con jardines centenarios y más de 12 salones patrimoniales. Integra Utopía Hotel Boutique, Hotel Express Hermitage, gastronomía de autor, el speakeasy Bar Alpestre y Origen Spa.",
    highlights: [
      "Dos conceptos de estancia: Utopía Hotel Boutique y Hotel Express Hermitage",
      "Más de 12 salones históricos con vitrales, jardines y capilla consagrada",
      "Restaurante Capitular, La Mal Querida, speakeasy Bar Alpestre y Origen Spa",
    ],
    petFriendly: false,
  },
  {
    code: "ROMA_NORTE",
    slug: "roma-norte",
    name: "Roma Norte",
    tagline: "Tu punto de encuentro en la ciudad.",
    location: "Frontera 49, Roma Norte, CDMX",
    regionLabel: "Frontera 49 · CDMX",
    baseNightPriceMxn: 3800,
    hasSpaCenter: true,
    imageUrl: "https://www.gohb.com.mx/assets/images/romageneral.webp",
    websiteUrl: "https://www.frontera49.com/",
    description:
      "Refugio urbano de 23 habitaciones en Frontera 49, corazón cultural de Roma Norte. Combina descanso boutique (Deluxe y Sencilla) con Rooftop panorámico, Coworking de fibra óptica, Foro Cultural, cafetería de especialidad y Garnachería Única.",
    highlights: [
      "23 habitaciones (Deluxe y Sencilla) con diseño honesto y wifi rápido",
      "Rooftop con vista a Roma Norte (hasta 80 pax) y Foro Cultural (70 pax)",
      "Coworking Hub, café de especialidad y cocina tradicional en Garnachería Única",
    ],
    petFriendly: true,
  },
];

export function getPropertyBySlug(slug: string): CanonicalProperty | undefined {
  return CANONICAL_PROPERTIES.find((p) => p.slug === slug);
}

export function getPropertyByCode(code: string): CanonicalProperty | undefined {
  return CANONICAL_PROPERTIES.find((p) => p.code === code);
}
