import { requireAdmin } from "../../../lib/auth/session";

export default async function AdminDisenoWebPage() {
  await requireAdmin();

  return (
    <main className="page-frame">
      <section className="page-card">
        <span className="eyebrow">Diseno Web</span>
        <h1>Configuracion del Sitio</h1>
        <p>
          Aqui vamos a conectar el CMS visual: secciones, banners, imagenes desde Storage,
          colecciones multimedia, links, textos y asignaciones exactas por bloque del sitio.
        </p>

        <div className="grid-two">
          <article className="list-card">
            <strong>Capas a controlar</strong>
            <p>Home publica, modales, menu, collage, patrocinadores, ventas, merch y footer.</p>
          </article>
          <article className="list-card">
            <strong>Base ya prevista</strong>
            <p>CMS, media assets, colecciones, bindings por seccion y Storage de Supabase.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
