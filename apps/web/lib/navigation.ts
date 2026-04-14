import type { Route } from "next";
import type { DashboardNavItem } from "../components/dashboard-shell";

export const controlNavItems: DashboardNavItem[] = [
  { href: "/admin" as Route, icon: "dashboard", label: "Resumen" },
  { href: "/admin/diseno-web" as Route, icon: "design", label: "Diseno web" },
  { href: "/admin/eventos" as Route, icon: "events", label: "Eventos" },
  { href: "/admin/catalogo" as Route, icon: "catalog", label: "Catalogo" },
  { href: "/admin/promociones" as Route, icon: "promotions", label: "Promocion" },
  { href: "/admin/rifas" as Route, icon: "raffles", label: "Rifas" },
  { href: "/admin/quinielas" as Route, icon: "pools", label: "Quinielas" },
  { href: "/admin/tickets" as Route, icon: "tickets", label: "Tickets" },
  { href: "/admin/finanzas" as Route, icon: "finance", label: "Finanzas" },
  { href: "/admin/logs/acciones" as Route, icon: "audit", label: "Log acciones" },
  { href: "/admin/logs/accesos" as Route, icon: "access", label: "Log accesos" }
];

export const customerNavItems: DashboardNavItem[] = [
  { href: "/perfil" as Route, icon: "profile", label: "Perfil" },
  { href: "/perfil/compras" as Route, icon: "purchases", label: "Mis compras" },
  { href: "/rifas" as Route, icon: "raffles", label: "Rifas" },
  { href: "/quinielas" as Route, icon: "pools", label: "Quinielas" },
  { href: "/eventos" as Route, icon: "events", label: "Eventos" }
];
