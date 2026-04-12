export function getPublicAppUrls() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const intranetUrl = process.env.NEXT_PUBLIC_INTRANET_URL || `${siteUrl}/perfil`;
  const controlUrl = process.env.NEXT_PUBLIC_CONTROL_URL || `${siteUrl}/admin`;

  return {
    siteUrl,
    intranetUrl,
    controlUrl
  };
}
