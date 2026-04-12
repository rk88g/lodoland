import Fastify from "fastify";

const app = Fastify({
  logger: true
});

app.get("/health", async () => {
  return {
    ok: true,
    service: "lodoland-api"
  };
});

app.get("/v1/catalog", async () => {
  return {
    modules: ["events", "raffles", "pools", "products", "content"],
    note: "Placeholder API. Connect controllers and Supabase queries in the next phase."
  };
});

app.get("/v1/content/pages", async () => {
  return {
    pages: ["home", "login", "profile", "admin"],
    cms: "Prepared for cms_pages, cms_sections and cms_section_fields."
  };
});

app.get("/v1/auth/config", async () => {
  return {
    provider: "supabase-auth",
    flows: ["email-password", "magic-link", "oauth"]
  };
});

const port = Number(process.env.PORT ?? 4000);

app
  .listen({
    port,
    host: "0.0.0.0"
  })
  .catch((error) => {
    app.log.error(error);
    process.exit(1);
  });

