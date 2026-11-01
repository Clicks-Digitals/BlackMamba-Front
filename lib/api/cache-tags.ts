/**
 * Cache tags shared by the fetches that cache product data and the
 * /api/revalidate route that expires them.
 *
 * revalidatePath only refreshes the page it is given. A product removed in the
 * panel kept showing up in "You may also like" on the cart and on every other
 * product's page for up to a minute, because those lists are cached under
 * other paths. Tagging them lets one product change expire them all.
 */
export const PRODUCTS_TAG = "products";

/**
 * The ready-made PC list. A fix made in the panel - a part swapped, a price
 * corrected - showed the old build on the storefront for up to a minute.
 */
export const READY_MADE_TAG = "pc-ready-made";
