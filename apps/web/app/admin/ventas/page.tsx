import { requireAdmin } from "../../../lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AdminSalesPage() {
  await requireAdmin();

  return (
    <main className="page-frame">
      <section className="page-card">
        <span className="eyebrow">Operaciones</span>
        <h1>Ventas y Promociones</h1>
        <p>
          Este modulo servira para lanzar campanas, productos y promociones online con cobro
          directo desde la pagina.
        </p>
      </section>
    </main>
  );
}
