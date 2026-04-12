const editableFields = [
  "Titulos",
  "Subtitulos",
  "Parrafos",
  "Botones",
  "Etiquetas",
  "Links",
  "Imagenes",
  "Cards",
  "SEO basico"
];

const homepageCollections = [
  "home_featured_event",
  "home_social_cards",
  "home_sponsors",
  "home_influencers",
  "home_sales_items",
  "home_merch_items",
  "cms_item_groups",
  "cms_group_items",
  "cms_group_item_fields"
];

export default function AdminContentPage() {
  return (
    <main className="page-frame">
      <section className="page-card">
        <span className="eyebrow">CMS</span>
        <h1>Contenido Editable</h1>
        <p>
          La base de datos ya contempla un CMS por pagina, seccion y campo para que cada
          elemento se administre de forma individual.
        </p>

        <div className="grid-two">
          <article className="list-card">
            <strong>Campos administrables</strong>
            <ul>
              {editableFields.map((field) => (
                <li key={field}>{field}</li>
              ))}
            </ul>
          </article>
          <article className="list-card">
            <strong>Modelo</strong>
            <p>
              `cms_pages` organiza la pagina, `cms_sections` agrupa los bloques y
              `cms_section_fields` guarda cada pieza editable.
            </p>
            <p>
              Para la home tambien hay tablas por seccion para manejar logos, perfiles, cards,
              redes y productos sin mezclar esos datos con el texto libre.
            </p>
            <p>
              La capa nueva `cms_item_groups` y sus items/campos permite editar banners, menu,
              logos, modales, links, influencers y elementos repetibles pieza por pieza.
            </p>
            <ul>
              {homepageCollections.map((tableName) => (
                <li key={tableName}>{tableName}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>
    </main>
  );
}
