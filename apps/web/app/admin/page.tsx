import type { Route } from "next";
import Link from "next/link";
import { requireAdmin } from "../../lib/auth/session";

const modules: Array<{
  href: Route;
  title: string;
  description: string;
}> = [
  {
    href: "/admin/diseno-web",
    title: "Diseno Web",
    description: "Configura secciones, textos, imagenes, banners, colecciones y asignaciones por bloque."
  },
  {
    href: "/admin/eventos",
    title: "Eventos",
    description: "Administra calendario, proximos eventos, capacidades, tickets, cortesias e inventario."
  },
  {
    href: "/admin/catalogo",
    title: "Catalogo",
    description: "Controla productos, variantes, tallas, colores, imagenes, stock y merchandising."
  },
  {
    href: "/admin/promociones",
    title: "Promocion",
    description: "Configura rifas, quinielas, ventas directas, viajes, regalos, sorteos y campanas."
  },
  {
    href: "/admin/tickets",
    title: "Tickets",
    description: "Visualiza tickets generados, pendientes, vendidos, cortesia, inventario y trazabilidad."
  },
  {
    href: "/admin/finanzas",
    title: "Finanzas",
    description: "Control de ingresos, gastos, categorias, balances por evento, promo y resumen global."
  }
];

export default async function AdminPage() {
  await requireAdmin();

  return (
    <main className="page-frame">
      <section className="page-card">
        <span className="eyebrow">CONTROL</span>
        <h1>Panel de Control</h1>
        <p>
          Este es el punto de partida del sistema central para configurar el sitio, operar ventas
          y controlar toda la estructura comercial de LODO LAND.
        </p>

        <div className="grid-two">
          {modules.map((module) => (
            <Link className="list-card" href={module.href} key={module.href}>
              <strong>{module.title}</strong>
              <p>{module.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
