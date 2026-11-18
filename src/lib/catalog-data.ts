export type MomentHotelKey =
  | "origen"
  | "ajusco"
  | "tepoztlan"
  | "valle"
  | "veracruz"
  | "quinta-soledad"
  | "roma-norte";

export interface ExperienceMoment {
  id: string;
  hotelKey: MomentHotelKey;
  hotelName: string;
  title: string;
  subtitle: string;
  description: string;
  includes: string[];
  capacity: string;
  properties: string[];
  pointsCost: number;
  mxnReference: number;
  isGiftForGoldDiamond?: boolean;
  badge: string;
  imageUrl: string;
}

export interface OtamActivity {
  id: string;
  title: string;
  audience: "PERSONAL" | "CORPORATIVO";
  paxRange: string;
  duration: string;
  propertiesLabel: string;
  description: string;
  highlights: string[];
  estimatedPricePerPaxMxn?: number;
  pointsEligible: boolean;
  imageUrl: string;
}

export interface AmanecerItem {
  id: string;
  name: string;
  category: string;
  description: string;
  minOrder: string;
  personalization: string;
  unitReferenceMxn: number;
  imageUrl: string;
}

export const MOMENTOS_ORGANICO: ExperienceMoment[] = [
  // ── ORIGEN CENTRO HOLÍSTICO Y SPA (TODAS LAS SEDES) ──
  {
    id: "momento-descanso",
    hotelKey: "origen",
    hotelName: "Origen Centro Holístico y Spa",
    title: "Tu momento de descanso",
    subtitle: "Masaje relajante de 60 min · Origen Spa",
    description:
      "Sesión terapéutica de cuerpo completo con aceites esenciales prensados en frío y herbolaria tradicional mexicana. Incluida sin costo en puntos para socios Oro (1 al año) y Diamante (hasta 2 al año), sin requerir hospedaje.",
    includes: [
      "Masaje relajante de 60 minutos en cabina privada",
      "Aceites botánicos puros e infusión de hierbas al finalizar",
      "Válido sin requerir noche de hotel (previa cita)",
    ],
    capacity: "1 persona (Oro) · Hasta 2 personas (Diamante)",
    properties: ["Las 6 sedes con centro de bienestar"],
    pointsCost: 1450,
    mxnReference: 1450,
    isGiftForGoldDiamond: true,
    badge: "Regalo Oro y Diamante",
    imageUrl: "https://www.origencentroholisticoyspa.com/images/CabinasMasaje.jpg",
  },

  // ── 1. ORGÁNICO AJUSCO (organicohotelboutique.com/experiencias) ──
  {
    id: "ajusco-cena-romantica",
    hotelKey: "ajusco",
    hotelName: "Orgánico Ajusco",
    title: "Cena Romántica de Autor",
    subtitle: "A la luz de las velas en el bosque",
    description:
      "Espacio reservado con decoración íntima, iluminación tenue, menú degustación de 4 tiempos diseñado por el chef, botella de vino de la casa y servicio personalizado en un rincón privado de Orgánico Ajusco.",
    includes: [
      "Montaje exclusivo privado con velas y flores",
      "Menú degustación de autor en 4 tiempos",
      "Botella de vino tinto o espumoso seleccionado",
      "Servicio de mesero privado durante la velada",
    ],
    capacity: "2 personas",
    properties: ["Ajusco"],
    pointsCost: 3400,
    mxnReference: 3400,
    badge: "Momentos Íntimos",
    imageUrl: "https://www.organicohotelboutique.com/images/experiencias/cena-romantica-1.webp",
  },
  {
    id: "ajusco-pedida-mano",
    hotelKey: "ajusco",
    hotelName: "Orgánico Ajusco",
    title: "Pedidas de Mano Mágicas",
    subtitle: "Escenario privado frente a la sierra",
    description:
      "Diseñamos la atmósfera perfecta en jardines o terrazas con vistas a la montaña del Ajusco: montaje monumental, letras luminosas 'Marry Me' o arco floral, camino de velas, pirotecnia fría y cena en 4 tiempos.",
    includes: [
      "Coordinación personalizada y montaje escenográfico",
      "Letras gigantes luminosas o arco floral decorativo",
      "Camino de velas aromáticas y pirotecnia fría",
      "Cena romántica de celebración en 4 tiempos",
    ],
    capacity: "2 personas",
    properties: ["Ajusco"],
    pointsCost: 6500,
    mxnReference: 6500,
    badge: "Momentos Íntimos",
    imageUrl: "https://www.organicohotelboutique.com/images/experiencias/pedida-mano-card.webp",
  },
  {
    id: "ajusco-fogata-privada",
    hotelKey: "ajusco",
    hotelName: "Orgánico Ajusco",
    title: "Fogatada Privada Gourmet",
    subtitle: "Fuego, estrellas y s'mores en deck privado",
    description:
      "Fogata encendida exclusivamente para ti en una terraza natural del bosque con madera de encino de larga duración, kit gourmet de s'mores con chocolates finos, botella de vino y mantas térmicas de montaña.",
    includes: [
      "Fogatero privado con encendido asistido y leña de encino",
      "Kit gourmet para preparar s'mores con chocolates finos",
      "Botella de vino tinto de la casa",
      "Mantas y cobijas térmicas de montaña",
    ],
    capacity: "2 a 5 personas",
    properties: ["Ajusco"],
    pointsCost: 1450,
    mxnReference: 1450,
    badge: "Momentos Íntimos",
    imageUrl: "https://www.organicohotelboutique.com/images/experiencias/fogata-privada-1.webp",
  },
  {
    id: "ajusco-picnic",
    hotelKey: "ajusco",
    hotelName: "Orgánico Ajusco",
    title: "Picnic Gourmet en el Bosque",
    subtitle: "Montaje bohemio entre pinos centenarios",
    description:
      "Descanso campestre sobre el pasto o deck privado en Orgánico Ajusco con tapetes, cojines, tabla de charcutería y quesos madurados, fruta fresca de temporada, pan artesanal horneado y botella de vino.",
    includes: [
      "Montaje bohemio con tapetes, cojines y canasta rústica",
      "Tabla de quesos madurados y carnes frías artesanales",
      "Pan rústico recién horneado y fruta fresca",
      "Botella de vino y aguas minerales",
    ],
    capacity: "2 personas",
    properties: ["Ajusco"],
    pointsCost: 1650,
    mxnReference: 1650,
    badge: "Momentos Íntimos",
    imageUrl: "https://www.organicohotelboutique.com/images/experiencias/picnic-intimo.webp",
  },
  {
    id: "ajusco-cinema",
    hotelKey: "ajusco",
    hotelName: "Orgánico Ajusco",
    title: "Cinema Orgánico al Aire Libre",
    subtitle: "Proyección bajo las estrellas a 3,000 m",
    description:
      "Proyector HD, pantalla gigante al aire libre en el bosque del Ajusco, sillones mullidos, audio envolvente, fogata ambiental y palomitas caseras ilimitadas para una noche de cine inolvidable.",
    includes: [
      "Espacio exclusivo reservado con pantalla gigante",
      "Selección personalizada de película",
      "Palomitas de maíz caseras y cobijas de montaña",
      "Servicio de coctelería y snacks a la carta",
    ],
    capacity: "2 a 6 personas",
    properties: ["Ajusco"],
    pointsCost: 1850,
    mxnReference: 1850,
    badge: "Momentos Íntimos",
    imageUrl: "https://www.organicohotelboutique.com/images/experiencias/cinema-organico.webp",
  },
  {
    id: "ajusco-cuatrimotos",
    hotelKey: "ajusco",
    hotelName: "Orgánico Ajusco",
    title: "Ruta en Cuatrimotos",
    subtitle: "Terracería por los senderos del Ajusco",
    description:
      "Recorrido guiado en cuatrimoto monoplaza o biplaza por caminos de tierra, subidas rocosas y senderos rodeados de coníferas en el Ajusco, con paradas panorámicas.",
    includes: [
      "Instrucción previa de manejo y cuatrimoto",
      "Equipo de seguridad (casco y gafas protectoras)",
      "Guía experimentado durante todo el trayecto",
      "Paradas panorámicas para fotografías",
    ],
    capacity: "1 a 2 personas por vehículo",
    properties: ["Ajusco"],
    pointsCost: 1950,
    mxnReference: 1950,
    badge: "Momentos Rebeldía",
    imageUrl: "https://www.organicohotelboutique.com/images/experiencias/cuatrimotos-1.webp",
  },
  {
    id: "ajusco-cabalgata",
    hotelKey: "ajusco",
    hotelName: "Orgánico Ajusco",
    title: "Cabalgata por la Sierra",
    subtitle: "Paseo ecuestre entre valles y pinos",
    description:
      "Siente el ritmo pausado de la montaña a caballo con guías locales por los valles y pendientes boscosas del Ajusco en recorridos de 60 a 90 minutos.",
    includes: [
      "Caballo dócil asignado según nivel del jinete",
      "Acompañamiento de guía local experimentado",
      "Recorrido de 60 a 90 min por senderos naturales",
      "Vistas panorámicas de la cordillera",
    ],
    capacity: "1 a 6 personas",
    properties: ["Ajusco"],
    pointsCost: 1400,
    mxnReference: 1400,
    badge: "Momentos Rebeldía",
    imageUrl: "https://www.organicohotelboutique.com/images/experiencias/cabalgata-1.webp",
  },
  {
    id: "ajusco-trekking",
    hotelKey: "ajusco",
    hotelName: "Orgánico Ajusco",
    title: "Trekking & Caminata de Altura",
    subtitle: "Exploración botánica a más de 3,000 m",
    description:
      "Senderismo interpretativo guiado por especialistas locales para descubrir la flora, fauna y miradores naturales de las altas montañas del Ajusco.",
    includes: [
      "Guía de montaña certificado",
      "Bastones de senderismo y kit de hidratación",
      "Paradas interpretativas de flora nativa",
      "Ascenso a miradores naturales",
    ],
    capacity: "2 a 10 personas",
    properties: ["Ajusco"],
    pointsCost: 980,
    mxnReference: 980,
    badge: "Momentos Rebeldía",
    imageUrl: "https://www.organicohotelboutique.com/images/experiencias/trekking-1.webp",
  },
  {
    id: "ajusco-tiro-arco",
    hotelKey: "ajusco",
    hotelName: "Orgánico Ajusco",
    title: "Tiro con Arco & Tiro Deportivo",
    subtitle: "Precisión y enfoque en campo supervisado",
    description:
      "Prueba tu pulso y puntería al aire libre con arcos olímpicos/recreativos y rifles deportivos de aire comprimido bajo la guía de instructores especializados.",
    includes: [
      "Instrucción técnica por especialista",
      "Arcos y flechas adaptados o rifle deportivo",
      "Dianas reglamentarias a distintas distancias",
      "Equipo y medidas completas de seguridad",
    ],
    capacity: "1 a 6 personas",
    properties: ["Ajusco"],
    pointsCost: 890,
    mxnReference: 890,
    badge: "Momentos Rebeldía",
    imageUrl: "https://www.organicohotelboutique.com/images/experiencias/tiro-arco.webp",
  },
  {
    id: "ajusco-fogata-grupal",
    hotelKey: "ajusco",
    hotelName: "Orgánico Ajusco",
    title: "Fogatada Grupal de Montaña",
    subtitle: "Fuego central, música y vino caliente",
    description:
      "El punto de encuentro vespertino alrededor del fogatero de piedra en el Ajusco para compartir historias, malvaviscos y bebidas calientes bajo la noche estrellada.",
    includes: [
      "Acceso reservado al fogatero comunal encendido",
      "Música acústica en vivo y atmósfera nocturna",
      "Estación de malvaviscos y bebida caliente",
    ],
    capacity: "2 a 12 personas",
    properties: ["Ajusco"],
    pointsCost: 850,
    mxnReference: 850,
    badge: "Para Compartir",
    imageUrl: "https://www.organicohotelboutique.com/images/experiencias/fogata-grupal-1.webp",
  },
  {
    id: "ajusco-taller-pizza",
    hotelKey: "ajusco",
    hotelName: "Orgánico Ajusco",
    title: "Taller de Pizzas a la Leña",
    subtitle: "Masa madre y horno de piedra a 400 °C",
    description:
      "Experiencia culinaria participativa junto a nuestro chef pizzero para amasar, fermentar y hornear tu propia creación en horno tradicional de leña con ingredientes gourmet.",
    includes: [
      "Asesoría guiada de chef maestro pizzero",
      "Masa artesanal de masa madre y salsas de la casa",
      "Ingredientes gourmet (quesos, jamones y vegetales locales)",
    ],
    capacity: "2 a 8 personas",
    properties: ["Ajusco"],
    pointsCost: 1350,
    mxnReference: 1350,
    badge: "Para Compartir",
    imageUrl: "https://www.organicohotelboutique.com/images/experiencias/taller-pizza-1.webp",
  },
  {
    id: "ajusco-cata-vino",
    hotelKey: "ajusco",
    hotelName: "Orgánico Ajusco",
    title: "Cata de Vinos & Mixología",
    subtitle: "Etiquetas mexicanas y botánicos de sierra",
    description:
      "Sesión guiada por sommelier para catar etiquetas mexicanas seleccionadas o elaborar cócteles de autor con ingredientes silvestres del Ajusco.",
    includes: [
      "Degustación de 4 etiquetas o 3 cócteles preparados",
      "Tabla de maridaje con quesos y frutos secos",
      "Guía explicativa de aromas, notas y procesos",
    ],
    capacity: "2 a 8 personas",
    properties: ["Ajusco"],
    pointsCost: 1600,
    mxnReference: 1600,
    badge: "Para Compartir",
    imageUrl: "https://www.organicohotelboutique.com/images/experiencias/cata-vino-1.webp",
  },

  // ── 2. ORGÁNICO TEPOZTLÁN (organicohotelboutiquetepoz.com/momentos) ──
  {
    id: "tepoz-cinema",
    hotelKey: "tepoztlan",
    hotelName: "Orgánico Tepoztlán",
    title: "Cinema Orgánico",
    subtitle: "Cine bajo el manto estelar de Tepoztlán",
    description:
      "Proyección privada al aire libre en los jardines de Orgánico Tepoztlán bajo las estrellas, con mantas térmicas, cojines artesanales, palomitas gourmet y coctelería de autor.",
    includes: [
      "Pantalla de alta definición al aire libre con audio envolvente",
      "Montaje bohemio con cojines, mantas y fogata ambiental",
      "Palomitas gourmet, botanas artesanales y bebidas de autor",
    ],
    capacity: "2 a 6 personas",
    properties: ["Tepoztlán"],
    pointsCost: 1850,
    mxnReference: 1850,
    badge: "Momento Íntimo",
    imageUrl:
      "https://www.organicohotelboutiquetepoz.com/images/momentos_gallery/cinema-organico/cinema-organico-01.jpg",
  },
  {
    id: "tepoz-picnic",
    hotelKey: "tepoztlan",
    hotelName: "Orgánico Tepoztlán",
    title: "Picnic Gourmet en los Jardines",
    subtitle: "Vista a los riscos sagrados del Tepozteco",
    description:
      "Montaje campestre chic sobre los más de 730 m² de jardines de Tepoztlán, con canasta de mimbre, selección de quesos regionales, carnes frías, pan rústico y vino o coctelería fresca.",
    includes: [
      "Montaje bohemio con tapetes, cojines y sombrilla de jardín",
      "Canasta gourmet con quesos, carnes frías y pan artesanal",
      "Vino de selección o coctelería fresca al momento",
    ],
    capacity: "2 personas",
    properties: ["Tepoztlán"],
    pointsCost: 1650,
    mxnReference: 1650,
    badge: "Momento Íntimo",
    imageUrl:
      "https://www.organicohotelboutiquetepoz.com/images/momentos_gallery/picnic/picnic-01.jpg",
  },
  {
    id: "tepoz-cena-romantica",
    hotelKey: "tepoztlan",
    hotelName: "Orgánico Tepoztlán",
    title: "Cena Romántica Privada",
    subtitle: "Camino de velas frente al Tepozteco",
    description:
      "Velada íntima conducida por un sendero iluminado de velas hacia un rincón reservado con flores frescas, música tenue y menú maridaje de 4 o 6 tiempos por el chef.",
    includes: [
      "Montaje exclusivo en jardín privado, terraza o salón",
      "Caminos de velas, pétalos y arreglos florales frescos",
      "Menú maridaje de 4 o 6 tiempos con mesero privado",
    ],
    capacity: "2 personas",
    properties: ["Tepoztlán"],
    pointsCost: 3600,
    mxnReference: 3600,
    badge: "Momento Íntimo",
    imageUrl:
      "https://www.organicohotelboutiquetepoz.com/images/momentos_gallery/cena-romantica/cena-romantica-01.jpg",
  },
  {
    id: "tepoz-cuatrimotos-rzr",
    hotelKey: "tepoztlan",
    hotelName: "Orgánico Tepoztlán",
    title: "Rutas en Cuatrimotos & RZR",
    subtitle: "Cañadas y miradores de El Tepozteco",
    description:
      "Aventura todoterreno al volante de cuatrimotos o RZR por caminos empedrados, terracería, cruces de agua y miradores escénicos del valle de Tepoztlán.",
    includes: [
      "Vehículos todoterreno de alta potencia revisados al 100%",
      "Equipo de protección homologado (casco y gafas)",
      "Guías locales expertos en el valle y Parque Nacional",
    ],
    capacity: "2 a 4 personas",
    properties: ["Tepoztlán"],
    pointsCost: 2400,
    mxnReference: 2400,
    badge: "Rebeldía & Aventura",
    imageUrl:
      "https://www.organicohotelboutiquetepoz.com/images/momentos_gallery/cuatrimotos-rzr/cuatrimotos-rzr-01.jpg",
  },
  {
    id: "tepoz-cabalgata",
    hotelKey: "tepoztlan",
    hotelName: "Orgánico Tepoztlán",
    title: "Cabalgata al Atardecer",
    subtitle: "Entre acantilados y campo morelense",
    description:
      "Paseo ecuestre pausado entre pastizales y faldas de la sierra tepozteca guiado por arrieros tradicionales mientras el atardecer ilumina los cerros.",
    includes: [
      "Caballos mansos y entrenados para todo nivel",
      "Ruta campestre con vistas despejadas al Tepozteco",
      "Acompañamiento personalizado y equipo ecuestre",
    ],
    capacity: "1 a 6 personas",
    properties: ["Tepoztlán"],
    pointsCost: 1450,
    mxnReference: 1450,
    badge: "Rebeldía & Aventura",
    imageUrl:
      "https://www.organicohotelboutiquetepoz.com/images/momentos_gallery/cabalgata/cabalgata-01.jpg",
  },
  {
    id: "tepoz-hiking",
    hotelKey: "tepoztlan",
    hotelName: "Orgánico Tepoztlán",
    title: "Hiking Sagrado & Caminata al Volcán",
    subtitle: "Cuevas ancestrales y miradores energéticos",
    description:
      "Caminata interpretativa por la geología y mística del Tepozteco para descubrir cuevas ancestrales, vegetación endémica y miradores vivos con especialistas locales.",
    includes: [
      "Ruta guiada por senderos naturales y miradores",
      "Interpretación botánica, histórica y energética",
      "Bastones de senderismo y kit de hidratación",
    ],
    capacity: "2 a 8 personas",
    properties: ["Tepoztlán"],
    pointsCost: 1150,
    mxnReference: 1150,
    badge: "Rebeldía & Aventura",
    imageUrl:
      "https://www.organicohotelboutiquetepoz.com/images/momentos_gallery/hiking/hiking-01.jpg",
  },

  // ── 3. ORGÁNICO VALLE DE BRAVO (organicohotelboutiquevalle.com/momentos) ──
  {
    id: "valle-rebeldia",
    hotelKey: "valle",
    hotelName: "Orgánico Valle",
    title: "Aventura & Rebeldía en Valle",
    subtitle: "Parapente, RZR, Kayak y Paddle Board",
    description:
      "Vive la energía de Valle de Bravo eligiendo vuelo en parapente sobre el lago y el Peñón, rutas guiadas en cuatrimotos/RZR por el bosque o kayak y paddle board.",
    includes: [
      "Coordinación de actividad de aventura a elegir",
      "Opciones de Parapente, RZR/Cuatrimotos o Kayak y Paddle Board",
      "Acceso a senderismo o temporada de Mariposa Monarca",
    ],
    capacity: "1 a 4 personas",
    properties: ["Valle"],
    pointsCost: 3200,
    mxnReference: 3200,
    badge: "Momentos de Rebeldía",
    imageUrl:
      "https://www.organicohotelboutiquevalle.com/images/momentos/rebeldia-parapente.webp",
  },
  {
    id: "valle-compartir",
    hotelKey: "valle",
    hotelName: "Orgánico Valle",
    title: "Fogatada, Picnic y Música en Vivo",
    subtitle: "Sobremesa, fuego y amistad en Valle",
    description:
      "Memorias compartidas en las 6 hectáreas de Orgánico Valle: fogatada al aire libre con bombones, picnic en los jardines, o tardes de música en vivo y karaoke en Bar Bienaventurado.",
    includes: [
      "Fogatada privada entre amigos con bombones",
      "Opción de tarde de picnic en los jardines del hotel",
      "Acceso a velada de música en vivo en Bar Bienaventurado",
    ],
    capacity: "2 a 8 personas",
    properties: ["Valle"],
    pointsCost: 1550,
    mxnReference: 1550,
    badge: "Para Compartir",
    imageUrl:
      "https://www.organicohotelboutiquevalle.com/images/momentos/compartir-fogata.webp",
  },
  {
    id: "valle-intimos",
    hotelKey: "valle",
    hotelName: "Orgánico Valle",
    title: "Cena Romántica y Desayuno con Champaña",
    subtitle: "Jardín secreto o suite en Valle de Bravo",
    description:
      "Momento diseñado para aniversarios o pedidas de mano: cena privada bajo las estrellas con menú de autor en jardín secreto, o desayuno en la cama con champaña y flores.",
    includes: [
      "Montaje privado en jardín secreto o suite",
      "Menú de autor para dos o desayuno romántico",
      "Champaña o botella de vino y decoración con velas y flores",
    ],
    capacity: "2 personas",
    properties: ["Valle"],
    pointsCost: 3500,
    mxnReference: 3500,
    badge: "Momentos Íntimos",
    imageUrl: "https://www.organicohotelboutiquevalle.com/images/momentos/intimos-cena.webp",
  },
  {
    id: "valle-spa",
    hotelKey: "valle",
    hotelName: "Orgánico Valle",
    title: "Ritual Holístico en Origen Spa Valle",
    subtitle: "Masaje sueco, piedras calientes y aromaterapia",
    description:
      "Santuario entre bosque y aire puro donde terapeutas certificados aplican masaje sueco, piedras calientes, reflexología o rituales para pareja en Valle de Bravo.",
    includes: [
      "Sesión corporal con piedras calientes o masaje sueco",
      "Aromaterapia botánica y técnicas ancestrales",
      "Disponible individual o en modalidad ritual para pareja",
    ],
    capacity: "1 a 2 personas",
    properties: ["Valle"],
    pointsCost: 1850,
    mxnReference: 1850,
    badge: "Bienestar Origen Spa",
    imageUrl: "https://www.organicohotelboutiquevalle.com/images/spa/origen-spa-1.webp",
  },

  // ── 4. ORGÁNICO VERACRUZ (gohb.com.mx/hoteles-organicos#veracruz) ──
  {
    id: "veracruz-el-muelle",
    hotelKey: "veracruz",
    hotelName: "Orgánico Veracruz",
    title: "Sobremesa Frente al Mar en El Muelle",
    subtitle: "Cocina costera veracruzana en Costa Esmeralda",
    description:
      "Mesa reservada frente a la playa en Restaurante El Muelle dentro de Orgánico Veracruz para disfrutar ingredientes frescos del mar, recetas tradicionales y bebidas al caer la tarde.",
    includes: [
      "Mesa preferente frente al mar en Restaurante El Muelle",
      "Degustación de mariscos y cocina tradicional costera",
      "2 bebidas frescas o coctelería de la casa",
    ],
    capacity: "2 personas",
    properties: ["Veracruz"],
    pointsCost: 1950,
    mxnReference: 1950,
    badge: "Frente al mar",
    imageUrl: "https://www.gohb.com.mx/assets/images/playageneral.webp",
  },
  {
    id: "veracruz-playa-privada",
    hotelKey: "veracruz",
    hotelName: "Orgánico Veracruz",
    title: "Día de Descanso en Playa Privada & Alberca",
    subtitle: "Sol, palmas y brisa en La Vigueta",
    description:
      "Jornada relajada frente al Golfo de México en Costa Esmeralda con camastros en zona de playa privada, acceso a alberca entre palmas y bebidas refrescantes.",
    includes: [
      "Camastros reservados en zona de playa privada",
      "Acceso a alberca al aire libre y jardines costeros",
      "Bebidas refrescantes y snacks frente al océano",
    ],
    capacity: "2 a 4 personas",
    properties: ["Veracruz"],
    pointsCost: 1250,
    mxnReference: 1250,
    badge: "Costa Esmeralda",
    imageUrl: "https://www.gohb.com.mx/assets/images/veracruz5.webp",
  },

  // ── 5. QUINTA SOLEDAD (centroculturalquintasoledad.com/momentos) ──
  {
    id: "quinta-cena-romantica",
    hotelKey: "quinta-soledad",
    hotelName: "Quinta Soledad",
    title: "Cenas Románticas & Pedidas de Mano",
    subtitle: "Entre jardines centenarios y faroles de 1870",
    description:
      "Velada íntima en los muros históricos y jardines iluminados con faroles porfirianos de Quinta Soledad, con menú de 4 o 6 tiempos ideal para aniversarios o pedidas de mano.",
    includes: [
      "Mesa privada bajo faroles porfirianos o rincón de jardín",
      "Menú degustación de 4 o 6 tiempos",
      "Decoración con velas y brindis conmemorativo",
    ],
    capacity: "2 personas",
    properties: ["Quinta Soledad"],
    pointsCost: 3400,
    mxnReference: 3400,
    badge: "Momentos Íntimos",
    imageUrl:
      "https://www.centroculturalquintasoledad.com/images/nuestros-momentos/cenas-romanticas/ccqs_cenas-romanticas02.jpg",
  },
  {
    id: "quinta-cena-maridaje",
    hotelKey: "quinta-soledad",
    hotelName: "Quinta Soledad",
    title: "Cenas Maridaje & Catas",
    subtitle: "Vino, mezcal o cerveza artesanal en Tlalpan",
    description:
      "Experiencia gastronómica para compartir en los salones patrimoniales de Quinta Soledad con cenas maridaje y catas guiadas de vino, cerveza artesanal o mezcal.",
    includes: [
      "Cena maridaje o sesión de cata guiada",
      "Selección de etiquetas de vino, mezcal o cerveza artesanal",
      "Acompañamiento culinario de cocina de autor",
    ],
    capacity: "2 a 8 personas",
    properties: ["Quinta Soledad"],
    pointsCost: 2200,
    mxnReference: 2200,
    badge: "Para Compartir",
    imageUrl:
      "https://www.centroculturalquintasoledad.com/images/nuestros-momentos/cena-maridaje/ccqs_cena-maridaje01.jpg",
  },
  {
    id: "quinta-taller-cocina",
    hotelKey: "quinta-soledad",
    hotelName: "Quinta Soledad",
    title: "Talleres de Pizza Artesanal & Sushi",
    subtitle: "Sesión culinaria guiada con chefs invitados",
    description:
      "Aprende y crea con tus propias manos en los talleres gastronómicos de pizza artesanal o sushi dentro de Quinta Soledad, disfrutando al final tu preparación.",
    includes: [
      "Clase práctica guiada por chefs anfitriones",
      "Todos los ingredientes frescos e insumos incluidos",
      "Degustación final en ambiente de convivencia",
    ],
    capacity: "2 a 10 personas",
    properties: ["Quinta Soledad"],
    pointsCost: 1450,
    mxnReference: 1450,
    badge: "Para Compartir",
    imageUrl:
      "https://www.centroculturalquintasoledad.com/images/nuestros-momentos/taller-pizzas/ccqs_taller-de-pizza03.jpg",
  },
  {
    id: "quinta-picnic",
    hotelKey: "quinta-soledad",
    hotelName: "Quinta Soledad",
    title: "Picnic en los Jardines Centenarios",
    subtitle: "Pausa romántica o familiar en Tlalpan Centro",
    description:
      "Disfruta una tarde tranquila sobre las áreas verdes arboladas de la casona histórica con montaje campestre para pareja o picnic familiar entre jardines.",
    includes: [
      "Montaje con mantas, cojines y canasta en jardín",
      "Tabla artesanal, pan de la casa y fruta fresca",
      "Bebidas refrescantes o vino para brindar",
    ],
    capacity: "2 a 6 personas",
    properties: ["Quinta Soledad"],
    pointsCost: 1400,
    mxnReference: 1400,
    badge: "Momentos Íntimos",
    imageUrl:
      "https://www.centroculturalquintasoledad.com/images/nuestros-momentos/picnic/ccqs_picnic01.png",
  },
  {
    id: "quinta-pintura",
    hotelKey: "quinta-soledad",
    hotelName: "Quinta Soledad",
    title: "Taller de Pintura en la Casona",
    subtitle: "Arte y convivencia entre arquerías de cantera",
    description:
      "Sesión creativa rodeada de la arquitectura neorrenacentista de Quinta Soledad para pintar tu propio cuadro con materiales incluidos y ambiente sin prisas.",
    includes: [
      "Lienzo, caballete, pinturas acrílicas y pinceles",
      "Acompañamiento durante la sesión creativa",
      "Bebida de cortesía para acompañar la tarde",
    ],
    capacity: "2 a 8 personas",
    properties: ["Quinta Soledad"],
    pointsCost: 1200,
    mxnReference: 1200,
    badge: "Arte & Cultura",
    imageUrl:
      "https://www.centroculturalquintasoledad.com/images/nuestros-momentos/taller-de-pintura/ccqs_taller-de-pintura01.jpg",
  },

  // ── 6. ROMA NORTE · FRONTERA 49 (frontera49.com/momentos) ──
  {
    id: "roma-cena-romantica",
    hotelKey: "roma-norte",
    hotelName: "Roma Norte · Frontera 49",
    title: "Cena Romántica de Autor",
    subtitle: "Velada íntima en Frontera 49 · Roma Norte",
    description:
      "Montaje privado en un rincón reservado con decoración botánica a la luz de las velas, música sutil, menú de 4 tiempos del chef, botella de vino tinto seleccionada y mesero privado.",
    includes: [
      "Decoración romántica exclusiva con velas y montaje botánico",
      "Menú de 4 tiempos diseñado por el chef",
      "Botella de vino tinto seleccionada",
      "Servicio de mesero privado durante toda la experiencia",
    ],
    capacity: "2 personas",
    properties: ["Roma Norte"],
    pointsCost: 5000,
    mxnReference: 5000,
    badge: "Experiencia en Pareja",
    imageUrl:
      "https://www.frontera49.com/images/experiencias/cena-romantica/ohbf49_cenas-romanticas05.jpg",
  },
  {
    id: "roma-pintor",
    hotelKey: "roma-norte",
    hotelName: "Roma Norte · Frontera 49",
    title: "Pintor por un Día",
    subtitle: "Arte y vino en nuestro Foro Cultural",
    description:
      "Despierta tu lado artístico en el Foro Cultural de Frontera 49 con caballete, lienzo, acrílicos, pinceles y una copa de vino de cortesía mientras creas tu obra paso a paso.",
    includes: [
      "Todos los materiales incluidos (lienzo, acrílicos y pinceles)",
      "Guía paso a paso para crear tu obra de arte",
      "Copa de vino de cortesía",
    ],
    capacity: "2 a 8 personas",
    properties: ["Roma Norte"],
    pointsCost: 1100,
    mxnReference: 1100,
    badge: "Creatividad & Arte",
    imageUrl: "https://www.frontera49.com/images/experiencias/pintor/img_6687.jpg",
  },
  {
    id: "roma-cine-boutique",
    hotelKey: "roma-norte",
    hotelName: "Roma Norte · Frontera 49",
    title: "Noches de Cine Boutique",
    subtitle: "Viernes y sábado 7:00 PM en sala íntima",
    description:
      "Fin de semana en la sala de cine de Frontera 49 para relajarse en pareja o con amigos con película curada, palomitas recién hechas y bebidas en ambiente urbano.",
    includes: [
      "Acceso a función en sala boutique de Frontera 49",
      "Palomitas recién hechas y botanas",
      "Bebidas incluidas para compartir",
    ],
    capacity: "2 a 8 personas",
    properties: ["Roma Norte"],
    pointsCost: 850,
    mxnReference: 850,
    badge: "Fin de semana",
    imageUrl:
      "https://www.frontera49.com/images/espacios/cine/ohbf49_sala-de-cine05.png",
  },
  {
    id: "roma-rooftop-parrillada",
    hotelKey: "roma-norte",
    hotelName: "Roma Norte · Frontera 49",
    title: "Parrilladas en el Rooftop",
    subtitle: "Atardeceres y cortes con vista a Roma Norte",
    description:
      "Nuestra terraza abierta en lo alto de Frontera 49 se convierte en escenario a la medida para disfrutar cortes selectos a la parrilla, coctelería y vistas a la Roma Norte.",
    includes: [
      "Espacio en Rooftop panorámico de Frontera 49",
      "Selección de cortes a la parrilla y guarniciones",
      "Bebidas y montaje para grupos de amigos",
    ],
    capacity: "4 a 15 personas",
    properties: ["Roma Norte"],
    pointsCost: 2600,
    mxnReference: 2600,
    badge: "Terraza Abierta",
    imageUrl:
      "https://www.frontera49.com/images/espacios/rooftop/ohbf49_rooftop01.jpeg",
  },
];

export const OTAM_PERSONAL_ACTIVITIES: OtamActivity[] = [
  {
    id: "otam-cena-dos",
    title: "Cena para dos",
    audience: "PERSONAL",
    paxRange: "1–2 personas",
    duration: "2 h",
    propertiesLabel: "Las 6 sedes",
    description:
      "Velada íntima diseñada a medida en terraza, cava o rincón del bosque con menú de autor.",
    highlights: ["Menú de 3 tiempos", "Decoración botánica", "Atención dedicada"],
    estimatedPricePerPaxMxn: 1100,
    pointsEligible: true,
    imageUrl:
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "otam-fogata",
    title: "Fogata para compartir",
    audience: "PERSONAL",
    paxRange: "1–5 personas",
    duration: "1.5 h",
    propertiesLabel: "Ajusco · Tepoztlán · Valle",
    description:
      "Encuentro cálido alrededor del fuego para amigos o familia con bebidas calientes y tablas para picar.",
    highlights: ["Leña aromática", "Mantas térmicas", "Botanas y vino o chocolate"],
    estimatedPricePerPaxMxn: 580,
    pointsEligible: true,
    imageUrl:
      "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "otam-comida-jardin",
    title: "Comida en el jardín",
    audience: "PERSONAL",
    paxRange: "1–2 personas",
    duration: "2 h",
    propertiesLabel: "Tepoztlán · Valle · Quinta Soledad",
    description:
      "Mesa campestre bajo sombra de árboles frutales con cocina de huerto y bebidas frescas.",
    highlights: ["Ingredientes de huerto local", "Mantelería de lino", "Bebidas artesanales"],
    estimatedPricePerPaxMxn: 890,
    pointsEligible: true,
    imageUrl:
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "otam-cine-aire-libre",
    title: "Cine al aire libre",
    audience: "PERSONAL",
    paxRange: "2–8 personas",
    duration: "2.5 h",
    propertiesLabel: "Ajusco · Valle · Veracruz · Quinta Soledad",
    description:
      "Proyección privada bajo el cielo nocturno con audio envolvente y estación de snacks gourmet.",
    highlights: ["Selección de película", "Palomitas y dulces", "Camastros y cobijas"],
    estimatedPricePerPaxMxn: 650,
    pointsEligible: true,
    imageUrl:
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "otam-cabalgata",
    title: "Cabalgata guiada",
    audience: "PERSONAL",
    paxRange: "1–6 personas",
    duration: "2 h",
    propertiesLabel: "Ajusco · Valle",
    description:
      "Recorrido a caballo por senderos de pino y praderas guiado por jinetes expertos locales.",
    highlights: ["Caballos nobles y equipo", "Guía certificado", "Hidratación incluida"],
    estimatedPricePerPaxMxn: 1250,
    pointsEligible: true,
    imageUrl:
      "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "otam-tiro-arco",
    title: "Tiro con arco",
    audience: "PERSONAL",
    paxRange: "1–8 personas",
    duration: "1.5 h",
    propertiesLabel: "Ajusco · Valle · Quinta Soledad",
    description:
      "Sesión guiada de enfoque y precisión en campo abierto rodeado de naturaleza.",
    highlights: ["Instructor experto", "Equipo profesional completo", "Retos amistosos"],
    estimatedPricePerPaxMxn: 690,
    pointsEligible: true,
    imageUrl:
      "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "otam-caminata",
    title: "Caminata por la naturaleza",
    audience: "PERSONAL",
    paxRange: "1–12 personas",
    duration: "2 h",
    propertiesLabel: "Ajusco · Tepoztlán · Valle",
    description:
      "Senderismo interpretativo para reconocer flora endémica, miradores y respiración consciente.",
    highlights: ["Guía naturalista", "Bastones y té en ruta", "Ritmo adaptable"],
    estimatedPricePerPaxMxn: 450,
    pointsEligible: true,
    imageUrl:
      "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1200&q=80",
  },
];

export const OTAM_CORPORATE_ACTIVITIES: OtamActivity[] = [
  {
    id: "otam-cocina",
    title: "Competencia de cocina",
    audience: "CORPORATIVO",
    paxRange: "10–150 pax",
    duration: "2–3 h",
    propertiesLabel: "Las 6 sedes",
    description:
      "Reto culinario por equipos con chefs anfitriones, estaciones equipadas, mandiles Amanecer opcionales y degustación final.",
    highlights: ["Chefs facilitadores", "Ingredientes frescos y premios", "Ideal para integración"],
    estimatedPricePerPaxMxn: 1350,
    pointsEligible: true,
    imageUrl:
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "otam-reforestacion",
    title: "Jornada de reforestación",
    audience: "CORPORATIVO",
    paxRange: "10–100 pax",
    duration: "1.5 h",
    propertiesLabel: "Orgánico Ajusco",
    description:
      "Actividad de impacto ambiental directo en el bosque del Ajusco guiada por guardabosques locales con seguimiento de plantación.",
    highlights: ["Árboles nativos certificados", "Herramienta y guantes", "Certificado de impacto ESG"],
    estimatedPricePerPaxMxn: 780,
    pointsEligible: true,
    imageUrl:
      "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "otam-juego-vino",
    title: "El juego del vino",
    audience: "CORPORATIVO",
    paxRange: "10–100 pax",
    duration: "1.5 h",
    propertiesLabel: "Las 6 sedes",
    description:
      "Cata lúdica a ciegas guiada por sommelier donde los equipos descifran aromas, regiones y maridajes.",
    highlights: ["Etiquetas seleccionadas", "Sommelier en vivo", "Tabla de quesos y premios"],
    estimatedPricePerPaxMxn: 1150,
    pointsEligible: true,
    imageUrl:
      "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "otam-cocteleria",
    title: "Taller de coctelería",
    audience: "CORPORATIVO",
    paxRange: "10–100 pax",
    duration: "1.5–2 h",
    propertiesLabel: "Las 6 sedes",
    description:
      "Mixología botánica con destilados mexicanos, infusiones herbales del huerto y competencia de cóctel insignia.",
    highlights: ["Estación individual por participante", "Opción sin alcohol", "Recetario de autor"],
    estimatedPricePerPaxMxn: 980,
    pointsEligible: true,
    imageUrl:
      "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "otam-causa-social",
    title: "Desafío con causa social",
    audience: "CORPORATIVO",
    paxRange: "20–500 pax",
    duration: "2–3 h",
    propertiesLabel: "Las 6 sedes",
    description:
      "Dinámica colaborativa de alto alcance donde cada reto superado se traduce en apoyo tangible para comunidades vecinas.",
    highlights: ["Escalabilidad hasta 500 personas", "Facilitación integral", "Reporte de entrega comunitaria"],
    estimatedPricePerPaxMxn: 920,
    pointsEligible: true,
    imageUrl:
      "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "otam-pizza",
    title: "Taller de pizza",
    audience: "CORPORATIVO",
    paxRange: "10–100 pax",
    duration: "1.5–2 h",
    propertiesLabel: "Las 6 sedes",
    description:
      "Estirado de masa artesanal, selección de ingredientes frescos y horneado al momento en horno de piedra.",
    highlights: ["Masa fermentada 48 h", "Horno de leña/piedra", "Maridaje casual"],
    estimatedPricePerPaxMxn: 860,
    pointsEligible: true,
    imageUrl:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "otam-cocina-japonesa",
    title: "Cocina japonesa",
    audience: "CORPORATIVO",
    paxRange: "10–60 pax",
    duration: "2 h",
    propertiesLabel: "Roma Norte · Valle · Quinta Soledad",
    description:
      "Técnica de cortes, armado de makis y nigiris con chef especialista en un ambiente de concentración y disfrute.",
    highlights: ["Kit de esterilla y cuchillería", "Pesca sustentable", "Degustación con sake o té"],
    estimatedPricePerPaxMxn: 1400,
    pointsEligible: true,
    imageUrl:
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "otam-estrategia",
    title: "Estrategia en equipo",
    audience: "CORPORATIVO",
    paxRange: "12–120 pax",
    duration: "2–3 h",
    propertiesLabel: "Las 6 sedes",
    description:
      "Circuitos al aire libre y mesas de decisión diseñados para fortalecer liderazgo, comunicación y alineación.",
    highlights: ["Facilitadores organizacionales", "Debriefing ejecutivo", "Adaptable a objetivos de negocio"],
    estimatedPricePerPaxMxn: 950,
    pointsEligible: true,
    imageUrl:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "otam-pintura-prendas",
    title: "Pintura de prendas",
    audience: "CORPORATIVO",
    paxRange: "10–80 pax",
    duration: "1.5–2 h",
    propertiesLabel: "Las 6 sedes",
    description:
      "Taller creativo de intervención textil sobre sudaderas, gorras o mandiles Amanecer con pigmentos duraderos.",
    highlights: ["Prenda Amanecer incluida", "Artista guía", "Pieza personalizada para llevar"],
    estimatedPricePerPaxMxn: 890,
    pointsEligible: true,
    imageUrl:
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80",
  },
];

export const AMANECER_ITEMS: AmanecerItem[] = [
  {
    id: "amanecer-sudaderas",
    name: "Sudaderas",
    category: "Textil Corporativo",
    description: "Algodón peinado de alto gramaje con corte relajado y bordado o serigrafía de marca.",
    minOrder: "Desde 20 piezas",
    personalization: "Bordado tonal, parche tejido o serigrafía",
    unitReferenceMxn: 680,
    imageUrl:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "amanecer-mandiles",
    name: "Mandiles para actividades",
    category: "Experiencias & Cocina",
    description: "Lona orgánica resistente con herrajes metálicos y bolsas frontales, ideales para talleres OTAM.",
    minOrder: "Desde 15 piezas",
    personalization: "Grabado en piel vegana o bordado frontal",
    unitReferenceMxn: 520,
    imageUrl:
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "amanecer-termos-aluminio",
    name: "Termos de aluminio",
    category: "Hidratación",
    description: "Botella térmica ligera de aluminio reciclable con tapa hermética de bambú o acero.",
    minOrder: "Desde 30 piezas",
    personalization: "Grabado láser permanente",
    unitReferenceMxn: 340,
    imageUrl:
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "amanecer-tazas",
    name: "Tazas",
    category: "Mesa & Oficina",
    description: "Taza de cerámica artesanal esmaltada en tonos tierra y bosque para kits de bienvenida.",
    minOrder: "Desde 24 piezas",
    personalization: "Impresión vitrificada o relieve",
    unitReferenceMxn: 260,
    imageUrl:
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "amanecer-termos-yeti",
    name: "Termos Yeti",
    category: "Edición Premium",
    description: "Vaso o termo térmico de doble pared al vacío de máxima retención para regalos directivos.",
    minOrder: "Desde 15 piezas",
    personalization: "Grabado láser de alta precisión",
    unitReferenceMxn: 890,
    imageUrl:
      "https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "amanecer-gorras",
    name: "Gorras",
    category: "Exterior & Campo",
    description: "Gorra de gabardina lavada en tonos orgánicos con ajuste posterior metálico.",
    minOrder: "Desde 25 piezas",
    personalization: "Bordado 3D o etiqueta tejida",
    unitReferenceMxn: 320,
    imageUrl:
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "amanecer-toallas-faciales",
    name: "Toallas faciales",
    category: "Bienestar & Spa",
    description: "Algodón turco suave de 550 gsm pensado para experiencias de bienestar, yoga y kits de viaje.",
    minOrder: "Desde 30 piezas",
    personalization: "Bordado discreto en cenefa",
    unitReferenceMxn: 240,
    imageUrl:
      "https://images.unsplash.com/photo-1616627561950-9f746e330187?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "amanecer-cobijas",
    name: "Cobijas",
    category: "Confort & Hogar",
    description: "Manta tejida de textura cálida con flecos artesanales y cincho portador para fogatas o viajes.",
    minOrder: "Desde 20 piezas",
    personalization: "Parche bordado o etiqueta en cincho",
    unitReferenceMxn: 750,
    imageUrl:
      "https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "amanecer-morrales",
    name: "Morrales",
    category: "Viaje & Trabajo",
    description: "Mochila funcional en lona repelente al agua con compartimento acolchado para laptop.",
    minOrder: "Desde 20 piezas",
    personalization: "Placa metálica o bordado frontal",
    unitReferenceMxn: 940,
    imageUrl:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "amanecer-chaleco",
    name: "Chaleco corporativo",
    category: "Textil Ejecutivo",
    description: "Chaleco ligero acolchado resistente al viento, perfecto para retiros de bosque y equipos en campo.",
    minOrder: "Desde 15 piezas",
    personalization: "Bordado en pecho o manga",
    unitReferenceMxn: 1050,
    imageUrl:
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=80",
  },
];
