import { STORE, orPlaceholder } from "@/config/store";
import type { LegalSection } from "../components/legal-page";

/**
 * Terms, returns, shipping, contact and about.
 *
 * All five were 404s while product pages promised "Easy Returns" and "Free
 * Delivery" — claims with no page behind them. These state what the store
 * actually does today: cash on delivery, delivery within Jordan, and returns
 * under Jordanian consumer law. Anything the store has not decided is written
 * as a visible placeholder rather than invented.
 */

const UPDATED_EN = "Last updated: 14 October 2026";
const UPDATED_AR = "آخر تحديث: ١٤ تشرين الأول ٢٠٢٦";

export type LegalContent = {
  kicker: string;
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
};

function email() {
  return orPlaceholder(STORE.email, "contact email");
}
function phone() {
  return orPlaceholder(STORE.phone, "phone number");
}
function address(rtl: boolean) {
  return rtl
    ? orPlaceholder(STORE.addressAr || STORE.address, "عنوان المتجر")
    : orPlaceholder(STORE.address, "store address");
}

// ── Terms ────────────────────────────────────────────────────────────────────
export function termsContent(rtl: boolean): LegalContent {
  if (rtl) {
    return {
      kicker: "قانوني",
      title: "الشروط والأحكام",
      updated: UPDATED_AR,
      intro: `باستخدامك ${STORE.domain} أو بطلبك منّا، فإنك توافق على الشروط التالية.`,
      sections: [
        {
          heading: "الطلبات",
          body: [
            "يصبح الطلب مؤكداً عندما نؤكده لك. نحتفظ بالحق في رفض أو إلغاء أي طلب في حال نفاد المخزون أو وجود خطأ واضح في السعر أو الوصف، وفي هذه الحالة لا تُحصَّل منك أي مبالغ.",
            "الأسعار بالدينار الأردني وشاملة ضريبة المبيعات حيثما تنطبق.",
          ],
        },
        {
          heading: "الدفع",
          body: [
            "الدفع عند الاستلام هو طريقة الدفع المتاحة حالياً: تدفع للمندوب عند تسليم طلبك.",
          ],
        },
        {
          heading: "الكفالة",
          body: [
            "تخضع المنتجات لكفالة الشركة المصنّعة. مدة الكفالة وشروطها تختلف حسب المنتج والشركة المصنّعة؛ راجع صفحة المنتج أو تواصل معنا قبل الشراء إن كانت الكفالة عاملاً في قرارك.",
          ],
        },
        {
          heading: "استخدام الموقع",
          body: [
            "محتوى الموقع — النصوص والصور والشعارات — مملوك لنا أو لأصحابه، ولا يجوز نسخه لاستخدام تجاري دون إذن.",
            "لا نتحمل المسؤولية عن الأخطاء المطبعية غير المقصودة، ونصحّحها فور علمنا بها.",
          ],
        },
        {
          heading: "التواصل",
          body: [`للاستفسار: ${email()} أو ${phone()}.`],
        },
      ],
    };
  }

  return {
    kicker: "Legal",
    title: "Terms & Conditions",
    updated: UPDATED_EN,
    intro: `By using ${STORE.domain} or placing an order with us, you agree to the terms below.`,
    sections: [
      {
        heading: "Orders",
        body: [
          "An order becomes binding when we confirm it. We may refuse or cancel an order if an item is out of stock or if there is an obvious error in its price or description — in that case you are charged nothing.",
          "Prices are in Jordanian Dinar and include sales tax where it applies.",
        ],
      },
      {
        heading: "Payment",
        body: [
          "Cash on delivery is the payment method we currently offer: you pay the courier when your order arrives.",
        ],
      },
      {
        heading: "Warranty",
        body: [
          "Products carry the manufacturer's warranty. Length and terms vary by product and manufacturer — check the product page, or ask us before buying if the warranty matters to your decision.",
        ],
      },
      {
        heading: "Using this site",
        body: [
          "The content of this site — text, images and logos — belongs to us or to its owners, and may not be copied for commercial use without permission.",
          "We are not liable for inadvertent typographical errors, and we correct them as soon as we know.",
        ],
      },
      {
        heading: "Contact",
        body: [`Questions: ${email()} or ${phone()}.`],
      },
    ],
  };
}

// ── Returns ──────────────────────────────────────────────────────────────────
export function returnsContent(rtl: boolean): LegalContent {
  if (rtl) {
    return {
      kicker: "المساعدة",
      title: "الإرجاع والاستبدال",
      updated: UPDATED_AR,
      intro: "إذا وصلك المنتج تالفاً أو مختلفاً عمّا طلبت، تواصل معنا وسنصلح الأمر.",
      sections: [
        {
          heading: "المنتجات التالفة أو الخاطئة",
          body: [
            "افحص طلبك عند الاستلام. إذا كان المنتج تالفاً أو غير الذي طلبته، تواصل معنا خلال ٤٨ ساعة مع صور للمنتج وعلبته، وسنستبدله أو نعيد لك المبلغ.",
          ],
        },
        {
          heading: "تغيير رأيك",
          body: [
            "يمكنك إرجاع منتج غير مستخدم بعلبته الأصلية وكامل ملحقاته خلال ١٤ يوماً من الاستلام. تكلفة الإرجاع على المشتري ما لم يكن الخطأ منّا.",
            "لا تُرجَع المنتجات المستهلكة أو التي فُتح ختمها لأسباب صحية، ولا البرمجيات أو البطاقات الرقمية بعد تفعيلها.",
          ],
        },
        {
          heading: "الكفالة",
          body: [
            "الأعطال التي تظهر بعد فترة الإرجاع تُعالَج عبر كفالة الشركة المصنّعة. تواصل معنا وسنرشدك إلى مركز الصيانة المعتمد.",
          ],
        },
        {
          heading: "كيف تطلب إرجاعاً",
          body: [`راسلنا على ${email()} أو ${phone()} ومعك رقم طلبك.`],
        },
      ],
    };
  }

  return {
    kicker: "Help",
    title: "Returns & Exchanges",
    updated: UPDATED_EN,
    intro: "If something arrives damaged or isn't what you ordered, contact us and we'll put it right.",
    sections: [
      {
        heading: "Damaged or wrong items",
        body: [
          "Check your order when it arrives. If an item is damaged or isn't what you ordered, contact us within 48 hours with photographs of the item and its packaging, and we'll replace it or refund you.",
        ],
      },
      {
        heading: "Changing your mind",
        body: [
          "You may return an unused item, in its original packaging and with all its accessories, within 14 days of delivery. Return shipping is the buyer's cost unless the mistake was ours.",
          "Consumables, items whose seal has been broken for hygiene reasons, and software or digital cards once activated cannot be returned.",
        ],
      },
      {
        heading: "Warranty",
        body: [
          "Faults that appear after the return window are handled under the manufacturer's warranty. Contact us and we'll point you to the authorised service centre.",
        ],
      },
      {
        heading: "How to request a return",
        body: [`Email ${email()} or call ${phone()} with your order number.`],
      },
    ],
  };
}

// ── Shipping ─────────────────────────────────────────────────────────────────
export function shippingContent(rtl: boolean): LegalContent {
  if (rtl) {
    return {
      kicker: "المساعدة",
      title: "التوصيل",
      updated: UPDATED_AR,
      intro: "نوصل داخل الأردن، والدفع عند الاستلام.",
      sections: [
        {
          heading: "المناطق والمدة",
          body: [
            "نوصل إلى جميع محافظات المملكة. تستغرق الطلبات عادة من يوم إلى يومي عمل داخل عمّان، وقد تستغرق وقتاً أطول خارجها.",
          ],
        },
        {
          heading: "رسوم التوصيل",
          body: [
            "تُحتسب رسوم التوصيل عند إتمام الطلب وتظهر قبل تأكيدك للطلب، فلا توجد مفاجآت عند الاستلام.",
          ],
        },
        {
          heading: "تتبّع طلبك",
          body: [
            "نرسل لك بريداً إلكترونياً عند تأكيد الطلب وعند شحنه. يمكنك متابعة حالة طلباتك من صفحة حسابك.",
          ],
        },
      ],
    };
  }

  return {
    kicker: "Help",
    title: "Delivery",
    updated: UPDATED_EN,
    intro: "We deliver across Jordan, and you pay when your order arrives.",
    sections: [
      {
        heading: "Where and how long",
        body: [
          "We deliver to every governorate in Jordan. Orders usually arrive within one to two working days inside Amman, and may take longer elsewhere.",
        ],
      },
      {
        heading: "Delivery charges",
        body: [
          "The delivery charge is calculated at checkout and shown before you confirm your order, so there are no surprises at the door.",
        ],
      },
      {
        heading: "Following your order",
        body: [
          "We email you when your order is confirmed and again when it ships. You can follow the status of your orders from your account page.",
        ],
      },
    ],
  };
}

// ── About ────────────────────────────────────────────────────────────────────
export function aboutContent(rtl: boolean): LegalContent {
  if (rtl) {
    return {
      kicker: "عن المتجر",
      title: `عن ${STORE.nameAr}`,
      updated: UPDATED_AR,
      intro: `${STORE.nameAr} متجر كمبيوتر وإلكترونيات في الأردن.`,
      sections: [
        {
          heading: "ما نبيعه",
          body: [
            "قطع الحاسوب وأجهزة اللابتوب والشاشات والملحقات ومعدات الألعاب، من علامات تجارية أصلية مع كفالة الشركة المصنّعة.",
            "ولمن يريد بناء جهازه بنفسه، تتيح أداة «اصنع جهازك» اختيار القطع مع التحقق من توافقها مباشرة.",
          ],
        },
        {
          heading: "كيف نعمل",
          body: [
            "نبيع عبر موقعنا وعبر Instagram و Facebook و WhatsApp وفي المتجر. الدفع عند الاستلام، والتوصيل داخل الأردن.",
          ],
        },
        {
          heading: "تواصل معنا",
          body: [
            `البريد الإلكتروني: ${email()}`,
            `الهاتف / WhatsApp: ${phone()}`,
            `العنوان: ${address(true)}، الأردن`,
          ],
        },
      ],
    };
  }

  return {
    kicker: "About",
    title: `About ${STORE.name}`,
    updated: UPDATED_EN,
    intro: `${STORE.name} is a computer and electronics store in Jordan.`,
    sections: [
      {
        heading: "What we sell",
        body: [
          "PC components, laptops, monitors, accessories and gaming gear — genuine brands, with the manufacturer's warranty.",
          "If you would rather build your own, the Build Your PC tool lets you pick parts and checks that they fit together as you go.",
        ],
      },
      {
        heading: "How we work",
        body: [
          "We sell through this site, through Instagram, Facebook and WhatsApp, and in person. Payment is cash on delivery, and we deliver across Jordan.",
        ],
      },
      {
        heading: "Get in touch",
        body: [
          `Email: ${email()}`,
          `Phone / WhatsApp: ${phone()}`,
          `Address: ${address(false)}, Jordan`,
        ],
      },
    ],
  };
}

// ── Contact ──────────────────────────────────────────────────────────────────
export function contactContent(rtl: boolean): LegalContent {
  if (rtl) {
    return {
      kicker: "تواصل",
      title: "تواصل معنا",
      updated: UPDATED_AR,
      intro: "نرد عادة في نفس يوم العمل.",
      sections: [
        {
          heading: "طرق التواصل",
          body: [
            {
              list: [
                `البريد الإلكتروني: ${email()}`,
                `الهاتف / WhatsApp: ${phone()}`,
                `العنوان: ${address(true)}، الأردن`,
              ],
            },
          ],
        },
        {
          heading: "بخصوص طلب قائم",
          body: [
            "إذا كان لديك طلب قائم، افتح صفحة حسابك وأرسل تذكرة دعم من هناك — يصلنا معها رقم الطلب فنساعدك أسرع.",
          ],
        },
      ],
    };
  }

  return {
    kicker: "Contact",
    title: "Contact us",
    updated: UPDATED_EN,
    intro: "We usually reply the same working day.",
    sections: [
      {
        heading: "How to reach us",
        body: [
          {
            list: [
              `Email: ${email()}`,
              `Phone / WhatsApp: ${phone()}`,
              `Address: ${address(false)}, Jordan`,
            ],
          },
        ],
      },
      {
        heading: "About an existing order",
        body: [
          "If your question is about an order you've placed, open your account page and send a support ticket from there — it reaches us with the order attached, so we can help faster.",
        ],
      },
    ],
  };
}
