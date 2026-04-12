import { requireAdmin } from "../../../lib/auth/session";

export default async function AdminTicketsPage() {
  await requireAdmin();

  return (
    <main className="page-frame">
      <section className="page-card">
        <span className="eyebrow">Tickets</span>
        <h1>Control de Tickets</h1>
        <p>
          Aqui vamos a controlar inventario de tickets, vendidos, pendientes, cortesia, generados
          y trazabilidad por evento, lote y tipo de acceso.
        </p>

        <div className="grid-two">
          <article className="list-card">
            <strong>Inventario</strong>
            <p>Lotes, capacidad, movimientos, reservas, reimpresiones y estados por ticket.</p>
          </article>
          <article className="list-card">
            <strong>Operacion</strong>
            <p>Escaneo, validacion, anulacion, cortesia, historial de emision y seguimiento.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
