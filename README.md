# LODO LAND

Base inicial del proyecto para una plataforma web con:

- Landing page visual con estilo parallax.
- Inicio de sesion con Supabase Auth.
- Perfil de usuario para comprar tickets, rifas, quinielas y promociones.
- Panel administrador para editar contenido de la web de forma individual.
- Backend desplegable en Railway.
- Frontend desplegable en Vercel.
- Base de datos y autenticacion en Supabase.

## Estructura

```text
apps/
  api/         Backend HTTP para Railway
  web/         Frontend Next.js para Vercel
docs/
  architecture.md
supabase/
  migrations/  SQL versionado para esquema y seguridad
```

## Primer alcance incluido

- Monorepo con workspaces.
- Landing page inicial de LODO LAND.
- Rutas base para login, perfil y admin.
- API con rutas iniciales para salud, auth, contenido y catalogo.
- Migracion SQL para:
  - perfiles y roles
  - eventos y tipos de boleto
  - rifas
  - quinielas
  - productos/promociones
  - ordenes y pagos
  - CMS editable por pagina, seccion y campo
  - configuraciones globales del sitio
  - auditoria administrativa

## Stack propuesto

- `Cloudflare`: DNS y dominio
- `Vercel`: frontend `apps/web`
- `Railway`: backend `apps/api`
- `Supabase`: Postgres, Auth, Storage
- `GitHub`: repositorio y CI/CD

## Desarrollo local

1. Instala dependencias:

```bash
npm install
```

2. Copia los archivos de entorno:

```bash
copy .env.example .env
copy apps\web\.env.example apps\web\.env.local
copy apps\api\.env.example apps\api\.env
```

3. Levanta frontend y backend en paralelo:

```bash
npm run dev
```

## Siguientes pasos sugeridos

1. Conectar Supabase real y ejecutar migraciones.
2. Implementar autenticacion completa con Supabase Auth.
3. Integrar pasarela de pago.
4. Construir CRUD del panel administrador.
5. Conectar uploads de imagenes a Supabase Storage.
