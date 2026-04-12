# Arquitectura LODO LAND

## Objetivo

Construir una plataforma comercial para experiencias y ventas online de LODO LAND con dos superficies principales:

- Sitio publico visual y promocional.
- Plataforma autenticada para compra y administracion.

## Arquitectura propuesta

### Frontend `apps/web`

- Next.js App Router.
- Despliegue en Vercel.
- Landing page con narrativa visual, scroll parallax y CTAs.
- Rutas publicas:
  - `/`
  - `/login`
  - `/eventos`
  - `/rifas`
  - `/quinielas`
- Rutas autenticadas:
  - `/perfil`
  - `/perfil/compras`
- Rutas admin:
  - `/admin`
  - `/admin/contenido`
  - `/admin/eventos`
  - `/admin/rifas`
  - `/admin/quinielas`
  - `/admin/ventas`

### Backend `apps/api`

- Node.js + Fastify.
- Despliegue en Railway.
- API para exponer:
  - auth/session bridge
  - catalogo de eventos, rifas, quinielas y productos
  - checkout y registro de ordenes
  - lectura/escritura del CMS
  - auditoria administrativa

### Base de datos `Supabase`

- Supabase Auth para usuarios.
- Postgres para la logica transaccional.
- Storage para imagenes y assets del CMS.
- RLS para perfiles de usuario.

## Modelo funcional

### Usuario final

- Se registra o inicia sesion.
- Ve eventos y compra tickets.
- Compra entradas para rifas.
- Paga acceso o participacion en quinielas.
- Compra promociones o ventas especiales.
- Ve historial de compras y estados de pago.

### Administrador

- Edita textos, links, etiquetas, botones e imagenes de cada seccion.
- Publica eventos.
- Crea tickets por tipo y precio.
- Crea rifas con inventario o limite.
- Crea quinielas y controla reglas.
- Publica promociones y ventas especiales.
- Consulta ordenes y pagos.

## CMS editable individualmente

Se modela en tres niveles:

- `cms_pages`: pagina logica.
- `cms_sections`: bloques individuales dentro de la pagina.
- `cms_section_fields`: cada texto, link, imagen, CTA, etiqueta o valor editable.
- `site_settings`: configuraciones globales como branding, soporte y enlaces base.

Esto permite modificar cada fragmento por separado desde el panel admin.

## Pagos

El esquema deja preparada una capa de pagos agnostica:

- `orders`
- `order_items`
- `payment_transactions`

Despues se puede conectar Stripe, Mercado Pago u otro proveedor sin cambiar la estructura principal.

## Despliegue

### Cloudflare

- Manejo de dominio.
- DNS apuntando:
  - frontend a Vercel
  - api a Railway

### Vercel

- Proyecto apuntando a `apps/web`.
 - Variables publicas de Supabase y URL de API.

### Railway

- Proyecto apuntando a `apps/api`.
- Variables privadas de base de datos y credenciales de servicio.

### Supabase

- Proyecto con Auth, Database y Storage.
- Ejecucion de migraciones SQL versionadas en `supabase/migrations`.

## Fases siguientes

1. Autenticacion real con Supabase.
2. CRUD admin completo para CMS.
3. Checkout y webhook de pagos.
4. Inventario, cupos y validaciones de compra.
5. Panel de ordenes, metricas y reportes.

## Expansion operativa

La fase nueva de `CONTROL` e `INTRANET` queda documentada en:

- [control-platform.md](C:/Users/rk88g/Documents/GitHub/lodoland/docs/control-platform.md)
