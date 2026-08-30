import { StaticImageData } from "next/image";

export function imageAspectRatio(src: string | StaticImageData): string {
  if (typeof src === "object" && src !== null && "width" in src && "height" in src) {
    const w = src.width;
    const h = src.height;
    if (w > 0 && h > 0) return `${w} / ${h}`;
  }
  return "3 / 4";
}
