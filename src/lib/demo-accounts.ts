export interface DemoAccountPreset {
  id: string;
  label: string;
  roleLabel: string;
  email: string;
  password: string;
  destination: string;
  badge: string;
}

export const DEMO_ACCOUNT_PRESETS: DemoAccountPreset[] = [
  {
    id: "ana",
    label: "Ana López · SOCIO 000 248",
    roleLabel: "Socia Personal (Oro · 840 pts)",
    email: "ana@ejemplo.com",
    password: "Organico2026!",
    destination: "/mi-circulo",
    badge: "ORO",
  },
  {
    id: "empresa",
    label: "Empresa Demo S.A. de C.V.",
    roleLabel: "Empresas Oro ($4,000 saldo)",
    email: "empresa@ejemplo.com",
    password: "Organico2026!",
    destination: "/empresa",
    badge: "EMPRESA",
  },
  {
    id: "agencia",
    label: "Agencia Demo",
    roleLabel: "Agencia ($20k por recibir · 8,000 pts)",
    email: "agencia@ejemplo.com",
    password: "Organico2026!",
    destination: "/agencia",
    badge: "AGENCIA",
  },
];
