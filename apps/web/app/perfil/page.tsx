import { requireUser } from "../../lib/auth/session";
import { signOutAction } from "../login/actions";

const userModules = [
  "Comprar tickets para eventos.",
  "Comprar accesos o numeros para rifas.",
  "Pagar entrada para quinielas.",
  "Ver promociones y productos especiales.",
  "Consultar historial de compras y pagos."
];

export default async function ProfilePage() {
  const { user, profile } = await requireUser();
  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ");

  return (
    <main className="page-frame">
      <section className="page-card auth-card">
        <div className="profile-header">
          <div>
            <h1>Mi Perfil</h1>
            <p>
              Sesion activa como {fullName || user.email}. Desde aqui viviran compras, boletos,
              rifas, quinielas y promociones.
            </p>
          </div>

          <form action={signOutAction}>
            <button className="button button-secondary" type="submit">
              Cerrar sesion
            </button>
          </form>
        </div>

        <div className="grid-two">
          <article className="list-card">
            <strong>Cuenta</strong>
            <p>Correo: {profile?.email || user.email}</p>
            <p>Rol: {profile?.role || "customer"}</p>
            <p>Telefono: {profile?.phone || "Pendiente"}</p>
          </article>
          <article className="list-card">
            <strong>Compras disponibles</strong>
            <ul>
              {userModules.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>
    </main>
  );
}
