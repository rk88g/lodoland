const userModules = [
  "Comprar tickets para eventos.",
  "Comprar accesos o numeros para rifas.",
  "Pagar entrada para quinielas.",
  "Ver promociones y productos especiales.",
  "Consultar historial de compras y pagos."
];

export default function ProfilePage() {
  return (
    <main className="page-frame">
      <section className="page-card">
        <span className="eyebrow">Zona de usuario</span>
        <h1>Mi Perfil</h1>
        <p>
          Este dashboard representa la zona autenticada donde el cliente compra y consulta todo
          lo que adquiere dentro de LODO LAND.
        </p>

        <div className="grid-two">
          <article className="list-card">
            <strong>Compras disponibles</strong>
            <ul>
              {userModules.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article className="list-card">
            <strong>Estados de cuenta</strong>
            <p>
              Aqui se podran mostrar ordenes, pagos pendientes, boletos emitidos y resultados de
              rifas o quinielas ligadas a la cuenta.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}

