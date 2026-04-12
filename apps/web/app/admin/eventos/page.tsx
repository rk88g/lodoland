import { requireAdmin } from "../../../lib/auth/session";

export default async function AdminEventsPage() {
  await requireAdmin();

  return (
    <main className="page-frame">
      <section className="page-card">
        <span className="eyebrow">Eventos</span>
        <h1>Eventos</h1>
        <p>
          Desde aqui se administraran los proximos eventos, la lista continua de 5 eventos
          visibles en control y el evento inmediato que se refleja en la home publica.
        </p>

        <div className="grid-two">
          <article className="list-card">
            <strong>Planeacion</strong>
            <p>Nombre, sede, ciudad, fechas, cupo, portada, estado y visibilidad.</p>
          </article>
          <article className="list-card">
            <strong>Operacion</strong>
            <p>Tipos de ticket, lotes, inventario, cortesia, check-in y desempeno comercial.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
