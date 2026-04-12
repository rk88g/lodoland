import type { Route } from "next";
import Link from "next/link";

const modules: Array<{
  href: Route;
  title: string;
  description: string;
}> = [
  {
    href: "/admin/contenido",
    title: "Contenido",
    description: "Editar textos, imagenes, links, botones, etiquetas y bloques por separado."
  },
  {
    href: "/admin/eventos",
    title: "Eventos",
    description: "Crear eventos y sus tipos de ticket, precios, cupos y fechas."
  },
  {
    href: "/admin/rifas",
    title: "Rifas",
    description: "Publicar rifas, definir reglas, inventario y resultados."
  },
  {
    href: "/admin/quinielas",
    title: "Quinielas",
    description: "Administrar dinamicas, costo de acceso, apertura y cierre."
  },
  {
    href: "/admin/ventas",
    title: "Ventas",
    description: "Controlar promociones, productos digitales o campanas especiales."
  }
];

export default function AdminPage() {
  return (
    <main className="page-frame">
      <section className="page-card">
        <span className="eyebrow">Backoffice</span>
        <h1>Panel Administrador</h1>
        <p>
          El panel queda planteado para gobernar contenido y operaciones comerciales desde un
          solo lugar.
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
