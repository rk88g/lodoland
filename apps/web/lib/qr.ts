export function buildQrCodeUrl(value: string, size = 220) {
  const encoded = encodeURIComponent(value);

  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}`;
}
