import { requireAdmin } from "../../../lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AdminPoolsPage() {
  await requireAdmin();

  return (
    <main className="page-frame">
      <section className="page-card">
        <span className="eyebrow">Operaciones</span>
        <h1>Quinielas</h1>
        <p>
          Pantalla base para administrar quinielas, acceso pagado, dinamicas, fechas de cierre y
          resultados.
        </p>
      </section>
    </main>
  );
}
