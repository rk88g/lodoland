import { requireAdmin } from "../../../lib/auth/session";

export default async function AdminCatalogoPage() {
  await requireAdmin();

  return (
    <main className="page-frame">
      <section className="page-card">
        <span className="eyebrow">Catalogo</span>
        <h1>Productos y Merch</h1>
        <p>
          Esta seccion va a gobernar productos, variantes, precios, imagenes, tallas, colores,
          SKU, stock, inventario y publicaciones visibles al cliente.
        </p>

        <div className="grid-two">
          <article className="list-card">
            <strong>Producto base</strong>
            <p>Nombre, slug, descripcion, imagenes, estado, categoria, precio y costo.</p>
          </article>
          <article className="list-card">
            <strong>Variantes</strong>
            <p>Talla, color, combinaciones, stock por variante y movimientos de inventario.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
