import type { DashboardNavItem } from "../components/dashboard-shell";

export const controlNavItems: DashboardNavItem[] = [
  { href: "/admin", icon: "dashboard", label: "Resumen" },
  { href: "/admin/diseno-web", icon: "design", label: "Diseño web" },
  { href: "/admin/eventos", icon: "events", label: "Eventos" },
  { href: "/admin/catalogo", icon: "catalog", label: "Catálogo" },
  { href: "/admin/promociones", icon: "promotions", label: "Promoción" },
  { href: "/admin/tickets", icon: "tickets", label: "Tickets" },
  { href: "/admin/finanzas", icon: "finance", label: "Finanzas" }
];

export const customerNavItems: DashboardNavItem[] = [
  { href: "/perfil", icon: "profile", label: "Perfil" },
  { href: "/eventos", icon: "events", label: "Eventos" },
];
