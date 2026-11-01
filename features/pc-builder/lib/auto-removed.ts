import { toast } from "sonner";
import type { AutoRemovedPart } from "@/features/pc-builder/types";

/**
 * Tell the customer about parts the server took out of their build.
 *
 * A build never keeps parts that cannot work together: pick an Intel CPU over
 * an AMD board, or a GPU too big for the power supply, and the part that no
 * longer fits is removed (apps.pc_builder.engine.enforce_compatibility). Every
 * builder action ends in setBuild, so announcing it there covers them all -
 * picking a part, switching brand, quick start, surprise, budget, a fix.
 */
const announced = new WeakSet<AutoRemovedPart[]>();

export function announceAutoRemoved(removed: AutoRemovedPart[] | undefined) {
  if (!removed?.length || typeof document === "undefined") return;
  // The same response can reach setBuild twice (a page's initial build is
  // set again on re-render); say it once.
  if (announced.has(removed)) return;
  announced.add(removed);
  const ar = document.documentElement.lang === "ar";
  for (const part of removed) {
    const name = ar ? part.name_ar || part.name : part.name;
    toast.info(
      ar
        ? `أُزيلت ${name} لأنها لم تعد متوافقة مع باقي القطع.`
        : `${name} was removed: it no longer fits the rest of your build.`
    );
  }
}
