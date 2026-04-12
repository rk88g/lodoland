import { requireAdmin } from "../../../lib/auth/session";

export default async function AdminPromocionesPage() {
  await requireAdmin();

  return (
    <main className="page-frame">
      <section className="page-card">
        <span className="eyebrow">Promocion</span>
        <h1>Motor Comercial</h1>
        <p>
          Aqui vamos a operar rifas, quinielas, ventas directas, viajes, regalos, campañas y
          promociones destacadas para la web y para la intranet del cliente.
        </p>

        <div className="grid-two">
          <article className="list-card">
            <strong>Frente publico</strong>
            <p>Seleccion de las 4 promociones principales visibles en la home publica.</p>
          </article>
          <article className="list-card">
            <strong>Frente privado</strong>
            <p>Catalogo completo de promociones para clientes ya autenticados en intranet.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
