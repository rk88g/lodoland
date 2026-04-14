import { getSupabaseEnv } from "./supabase/env";
import { MEDIA_BUCKET } from "./supabase/storage";

type MediaTransformOptions = {
  width?: number;
  height?: number;
  quality?: number;
  resize?: "cover" | "contain" | "fill";
};

export function buildStoragePublicUrl(path: string, bucket = MEDIA_BUCKET) {
  const { url } = getSupabaseEnv();
  return `${url}/storage/v1/object/public/${bucket}/${path}`;
}

export function buildStorageImageUrl(
  path: string,
  bucket = MEDIA_BUCKET,
  options?: MediaTransformOptions
) {
  if (!options || (!options.width && !options.height && !options.quality && !options.resize)) {
    return buildStoragePublicUrl(path, bucket);
  }

  const { url } = getSupabaseEnv();
  const params = new URLSearchParams();

  if (options.width) {
    params.set("width", String(options.width));
  }

  if (options.height) {
    params.set("height", String(options.height));
  }

  if (options.quality) {
    params.set("quality", String(options.quality));
  }

  if (options.resize) {
    params.set("resize", options.resize);
  }

  return `${url}/storage/v1/render/image/public/${bucket}/${path}?${params.toString()}`;
}
