import { requireAdmin } from "../../../lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AdminRafflesPage() {
  await requireAdmin();

  return (
    <main className="page-frame">
      <section className="page-card">
        <span className="eyebrow">Operaciones</span>
        <h1>Rifas</h1>
        <p>
          Pantalla base para crear rifas, definir reglas, publicar premios, controlar ventas y
          registrar resultados.
        </p>
      </section>
    </main>
  );
}
