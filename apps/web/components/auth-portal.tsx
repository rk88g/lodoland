"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./auth-portal.module.css";

type AuthPortalProps = {
  errorMessage?: string | null;
  message?: string | null;
  mode: "customer" | "control";
  signInEmailAction?: (formData: FormData) => Promise<void>;
  signUpEmailAction?: (formData: FormData) => Promise<void>;
  signInGoogleAction?: () => Promise<void>;
  signInFacebookAction?: () => Promise<void>;
  signInStaffAction?: (formData: FormData) => Promise<void>;
};

type ThemeMode = "dark" | "light";
type CustomerPanel = "signin" | "signup";

const themeStorageKey = "lodoland-auth-theme";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M21.8 12.23c0-.73-.06-1.43-.2-2.09H12v3.95h5.49a4.7 4.7 0 0 1-2.04 3.08v2.56h3.3c1.93-1.78 3.05-4.4 3.05-7.5Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.76 0 5.08-.91 6.77-2.47l-3.3-2.56c-.92.62-2.08.98-3.47.98-2.67 0-4.94-1.8-5.74-4.22H2.85v2.64A10 10 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.26 13.73a5.98 5.98 0 0 1 0-3.46V7.63H2.85a10 10 0 0 0 0 8.74l3.41-2.64Z"
        fill="#FBBC05"
      />
      <path
        d="M12 6.05c1.5 0 2.85.52 3.91 1.53l2.93-2.93C17.07 2.98 14.76 2 12 2A10 10 0 0 0 2.85 7.63l3.41 2.64C7.06 7.85 9.33 6.05 12 6.05Z"
        fill="#EA4335"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.03 4.39 11.02 10.13 11.93v-8.44H7.08v-3.5h3.05V9.39c0-3.03 1.79-4.7 4.54-4.7 1.31 0 2.69.24 2.69.24v2.98h-1.52c-1.5 0-1.96.94-1.96 1.89v2.26h3.34l-.53 3.5h-2.81V24C19.61 23.09 24 18.1 24 12.07Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function AuthPortal({
  errorMessage,
  message,
  mode,
  signInEmailAction,
  signInFacebookAction,
  signInGoogleAction,
  signInStaffAction,
  signUpEmailAction
}: AuthPortalProps) {
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [activePanel, setActivePanel] = useState<CustomerPanel>("signin");

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(themeStorageKey);

    if (storedTheme === "light" || storedTheme === "dark") {
      setTheme(storedTheme);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(themeStorageKey, theme);
  }, [theme]);

  const isCustomer = mode === "customer";

  return (
    <main className={styles.shell} data-theme={theme}>
      <section className={styles.frame}>
        <aside className={styles.brandPanel}>
          <div className={styles.panelTop}>
            <div className={styles.brandMark}>
              <span className={styles.brandMarkBadge} />
              <span>LODO LAND</span>
            </div>

            <button
              className={styles.themeToggle}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              type="button"
            >
              <span>{theme === "dark" ? "Oscuro" : "Claro"}</span>
            </button>
          </div>

          <div className={styles.brandCopy}>
            <span className={styles.eyebrow}>{isCustomer ? "Intranet" : "Control"}</span>
            <h1>{isCustomer ? "Acceso de clientes" : "Acceso organizacional"}</h1>
            <p>
              {isCustomer
                ? "Un solo punto de acceso para entrar, registrarte y verificar tu cuenta antes de comprar, apartar o participar."
                : "Ingreso exclusivo para administracion, ventas, supervisores y gerencias con correo de la organizacion."}
            </p>

            <div className={styles.featureList}>
              <div className={styles.featureItem}>
                <span className={styles.featureDot} />
                <span>{isCustomer ? "Google, Facebook o correo" : "Correo organizacional y contrasena"}</span>
              </div>
              <div className={styles.featureItem}>
                <span className={styles.featureDot} />
                <span>{isCustomer ? "Verificacion por correo antes de cualquier movimiento" : "Acceso protegido para control interno"}</span>
              </div>
              <div className={styles.featureItem}>
                <span className={styles.featureDot} />
                <span>{isCustomer ? "Preparado para tickets, rifas, quinielas y compras" : "Listo para gestionar contenido, ventas y operaciones"}</span>
              </div>
            </div>
          </div>
        </aside>

        <section className={styles.card}>
          <div className={styles.cardTop}>
            <div>
              <span className={styles.eyebrow}>{isCustomer ? "Sesión" : "Control"}</span>
            </div>
          </div>

          <div className={styles.cardBody}>
            {errorMessage ? <div className={`${styles.status} ${styles.statusError}`}>{errorMessage}</div> : null}
            {message ? <div className={`${styles.status} ${styles.statusSuccess}`}>{message}</div> : null}

            {isCustomer ? (
              <div className={styles.accordion}>
                <section className={`${styles.section} ${activePanel === "signin" ? styles.sectionOpen : ""}`}>
                  <button
                    className={styles.sectionHeader}
                    onClick={() => setActivePanel("signin")}
                    type="button"
                  >
                    <div className={styles.sectionTitle}>
                      <strong>Iniciar sesión</strong>
                      <span>Google, Facebook o correo electrónico</span>
                    </div>
                    <span className={styles.sectionChevron}>+</span>
                  </button>

                  {activePanel === "signin" ? (
                    <div className={styles.sectionBody}>
                      <p>Elige una forma de acceso para entrar a tu cuenta de cliente.</p>

                      <div className={styles.socialStack}>
                        {signInGoogleAction ? (
                          <form action={signInGoogleAction}>
                            <button className={`${styles.socialButton} ${styles.socialGoogle}`} type="submit">
                              <span className={styles.socialIcon}>
                                <GoogleIcon />
                              </span>
                              <span>Continuar con Google</span>
                            </button>
                          </form>
                        ) : null}

                        {signInFacebookAction ? (
                          <form action={signInFacebookAction}>
                            <button className={`${styles.socialButton} ${styles.socialFacebook}`} type="submit">
                              <span className={styles.socialIcon}>
                                <FacebookIcon />
                              </span>
                              <span>Continuar con Facebook</span>
                            </button>
                          </form>
                        ) : null}
                      </div>

                      <div className={styles.divider}>o</div>

                      <form action={signInEmailAction} className={styles.formStack}>
                        <div className={styles.field}>
                          <label htmlFor="customer-login-email">Correo electrónico</label>
                          <input
                            className={styles.input}
                            id="customer-login-email"
                            name="email"
                            type="email"
                            placeholder="cliente@correo.com"
                            required
                          />
                        </div>

                        <div className={styles.field}>
                          <label htmlFor="customer-login-password">Contraseña</label>
                          <input
                            className={styles.input}
                            id="customer-login-password"
                            name="password"
                            type="password"
                            required
                          />
                        </div>

                        <button className={styles.primaryButton} type="submit">
                          Entrar a mi cuenta
                        </button>
                      </form>
                    </div>
                  ) : null}
                </section>

                <section className={`${styles.section} ${activePanel === "signup" ? styles.sectionOpen : ""}`}>
                  <button
                    className={styles.sectionHeader}
                    onClick={() => setActivePanel("signup")}
                    type="button"
                  >
                    <div className={styles.sectionTitle}>
                      <strong>Crear cuenta</strong>
                      <span>Registro con correo y verificación obligatoria</span>
                    </div>
                    <span className={styles.sectionChevron}>+</span>
                  </button>

                  {activePanel === "signup" && signUpEmailAction ? (
                    <div className={styles.sectionBody}>
                      <p>
                        Antes de cualquier movimiento como cliente, el sistema te pedirá verificar este correo.
                      </p>

                      <form action={signUpEmailAction} className={styles.formStack}>
                        <div className={styles.field}>
                          <label htmlFor="customer-signup-email">Correo electrónico</label>
                          <input
                            className={styles.input}
                            id="customer-signup-email"
                            name="email"
                            type="email"
                            placeholder="cliente@correo.com"
                            required
                          />
                        </div>

                        <div className={styles.field}>
                          <label htmlFor="customer-signup-password">Contraseña</label>
                          <input
                            className={styles.input}
                            id="customer-signup-password"
                            name="password"
                            type="password"
                            minLength={8}
                            required
                          />
                        </div>

                        <div className={styles.field}>
                          <label htmlFor="customer-signup-password-confirm">Confirmar contraseña</label>
                          <input
                            className={styles.input}
                            id="customer-signup-password-confirm"
                            name="passwordConfirm"
                            type="password"
                            minLength={8}
                            required
                          />
                        </div>

                        <p className={styles.fieldHint}>
                          Si no verificas el correo, no podrás avanzar a compras, rifas, quinielas ni pedidos.
                        </p>

                        <button className={styles.primaryButton} type="submit">
                          Crear cuenta
                        </button>
                      </form>
                    </div>
                  ) : null}
                </section>
              </div>
            ) : (
              <div className={styles.accordion}>
                <section className={`${styles.section} ${styles.sectionOpen}`}>
                  <div className={styles.sectionHeader}>
                    <div className={styles.sectionTitle}>
                      <strong>Iniciar sesión</strong>
                      <span>Solo correo organizacional @lodoland.mx</span>
                    </div>
                    <span className={styles.sectionChevron}>+</span>
                  </div>

                  <div className={styles.sectionBody}>
                    <p>Entra con tu correo de la organización para acceder al panel de control.</p>

                    {signInStaffAction ? (
                      <form action={signInStaffAction} className={styles.formStack}>
                        <div className={styles.field}>
                          <label htmlFor="staff-email">Correo organizacional</label>
                          <input
                            className={styles.input}
                            id="staff-email"
                            name="email"
                            type="email"
                            placeholder="ventas2@lodoland.mx"
                            required
                          />
                        </div>

                        <div className={styles.field}>
                          <label htmlFor="staff-password">Contraseña</label>
                          <input
                            className={styles.input}
                            id="staff-password"
                            name="password"
                            type="password"
                            required
                          />
                        </div>

                        <button className={styles.primaryButton} type="submit">
                          Entrar al control
                        </button>
                      </form>
                    ) : null}
                  </div>
                </section>
              </div>
            )}

            <div className={styles.footerRow}>
              <div className={styles.linkRow}>
                {isCustomer ? (
                  <Link href="/admin/login">Acceso de control</Link>
                ) : (
                  <Link href="/login">Acceso de clientes</Link>
                )}
                <Link href="/">Volver al inicio</Link>
              </div>
              <span className={styles.subtle}>LODO LAND</span>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
