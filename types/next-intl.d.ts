import en_auth from "../messages/en/auth.json";
import en_header from "../messages/en/header.json";
import en_service_center from "../messages/en/service-center.json";
import en_profile from "../messages/en/profile.json";
import en_home from "../messages/en/home.json";
import en_products from "../messages/en/products.json";
import en_wishlist from "../messages/en/wishlist.json";
import en_footer from "../messages/en/footer.json";
import en_cart from "../messages/en/cart.json";
import en_checkout from "../messages/en/checkout.json";
import en_single_product from "../messages/en/single-product.json";
import en_not_found from "../messages/en/not-found.json";
import en_order_success from "../messages/en/order-success.json";
import en_common from "../messages/en/common.json";

type Messages =
  typeof en_auth &
  typeof en_header &
  typeof en_service_center &
  typeof en_profile &
  typeof en_home &
  typeof en_products &
  typeof en_wishlist &
  typeof en_footer &
  typeof en_cart &
  typeof en_checkout &
  typeof en_single_product &
  typeof en_not_found &
  typeof en_order_success &
  typeof en_common;

declare global {
  type IntlMessages = Messages;
}
