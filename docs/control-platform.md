# Plataforma CONTROL e INTRANET

## Superficies

- `www.lodoland.mx`
  Sitio publico visual y comercial.
- `intranet.lodoland.mx`
  Area privada para clientes.
- `control.lodoland.mx`
  Sistema operativo interno para staff y administracion.

Mientras cerramos la parte de subdominios, el proyecto ya queda preparado sobre estas rutas:

- Publico: `/`
- Intranet cliente: `/login`, `/login/verificar`, `/perfil`
- Control interno: `/admin/login`, `/admin`

## Logica de acceso

### Clientes

- Login con Google.
- Login con telefono + codigo SMS.
- Destino posterior: `intranet.lodoland.mx`

### Staff y administracion

- Login solo con correo organizacional `@lodoland.mx`.
- Destino posterior: `control.lodoland.mx`
- Roles previstos:
  - `super_admin`
  - `admin`
  - despues: ventas, supervisor, gerente, operador

## Modulos iniciales de CONTROL

### Diseno Web

- CMS por pagina, seccion y campo.
- Media assets desde Supabase Storage.
- Colecciones de imagenes reutilizables.
- Asignacion de imagenes por seccion.
- Configuracion de banners, hero, collage, sponsors, footer y modales.

### Eventos

- Calendario de proximos eventos.
- Vista de los 5 siguientes eventos para control.
- Vista del evento mas proximo para la home publica.
- Capacidad, fechas, sede, estados, publicaciones.

### Catalogo

- Productos base.
- Variantes por talla, color, material y SKU.
- Imagenes por producto y por variante.
- Precio, costo, stock, alertas, inventario y merchandising.

### Promocion

- Rifa.
- Quiniela.
- Venta directa.
- Viaje.
- Regalo o giveaway.
- Sorteo.
- Campanas para clientes.
- Seleccion de 4 promociones principales visibles en la home.

### Tickets

- Tipos de ticket.
- Lotes.
- Inventario.
- Tickets vendidos.
- Tickets emitidos.
- Tickets pendientes.
- Tickets de cortesia.
- Escaneo, validacion y estados.

### Finanzas

- Ingresos.
- Gastos.
- Ajustes.
- Categorias.
- Resumen por evento.
- Resumen por promocion.
- Resumen por catalogo.
- Consolidado global.

## Modelo relacional base

La base ya contaba con:

- `events`
- `ticket_types`
- `raffles`
- `pools`
- `products`
- `orders`
- `order_items`
- `payment_transactions`
- CMS y media assets

La fase nueva extiende eso con:

- `media_collections`
- `media_collection_items`
- `section_media_bindings`
- `product_categories`
- `product_variants`
- `product_variant_assets`
- `product_inventory_movements`
- `ticket_lots`
- `issued_tickets`
- `ticket_inventory_movements`
- `promotions`
- `promotion_feature_slots`
- `promotion_offers`
- `promotion_prizes`
- `promotion_raffle_configs`
- `promotion_raffle_numbers`
- `promotion_pool_configs`
- `customer_campaigns`
- `customer_campaign_recipients`
- `financial_categories`
- `financial_entries`

## Siguiente fase recomendada

1. Activar login real y probar `admin/login`, `login` y `login/verificar`.
2. Construir primero `Diseno Web` en CONTROL:
   - listar media assets
   - subir imagenes
   - crear colecciones
   - asignar imagenes por seccion
3. Conectar la home publica a Supabase para leer contenido real.
4. Construir `Eventos`.
5. Construir `Catalogo`.
6. Construir `Promocion`.
7. Construir `Tickets`.
8. Construir `Finanzas`.

## Recomendacion tecnica

No conviene separar en apps distintas todavia.

La mejor ruta es:

- Un solo frontend Next.js.
- Resolver experiencia por dominio o subdominio.
- Compartir Supabase Auth.
- Separar rutas y permisos por rol.

Cuando ya tengamos probada la sesion en ambos flujos, movemos la experiencia a:

- `intranet.lodoland.mx`
- `control.lodoland.mx`

sin romper el desarrollo que ya estamos haciendo.
