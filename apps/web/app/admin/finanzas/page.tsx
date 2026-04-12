import { requireAdmin } from "../../../lib/auth/session";

export default async function AdminFinanzasPage() {
  await requireAdmin();

  return (
    <main className="page-frame">
      <section className="page-card">
        <span className="eyebrow">Finanzas</span>
        <h1>Ingresos y Gastos</h1>
        <p>
          Este modulo concentrara ingresos, gastos, categorias, movimientos y resumenes por
          evento, promocion, catalogo, tickets y consolidado general.
        </p>

        <div className="grid-two">
          <article className="list-card">
            <strong>Operacion</strong>
            <p>Registro manual o automatico, categorias, origen del movimiento y responsable.</p>
          </article>
          <article className="list-card">
            <strong>Analitica</strong>
            <p>Totales, utilidad, pendiente por cobrar, costos por evento y trazabilidad.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
