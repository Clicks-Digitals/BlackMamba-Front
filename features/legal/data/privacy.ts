import { STORE, orPlaceholder } from "@/config/store";
import type { LegalSection } from "../components/legal-page";

const LAST_UPDATED_EN = "Last updated: 11 October 2026";
const LAST_UPDATED_AR = "آخر تحديث: 11 تشرين الأول 2026";

function email() {
  return orPlaceholder(STORE.email, "contact email");
}

export function privacyContent(rtl: boolean): {
  kicker: string;
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
} {
  if (rtl) {
    const addr = orPlaceholder(STORE.addressAr || STORE.address, "عنوان المتجر");
    const phone = orPlaceholder(STORE.phone, "رقم الهاتف");
    return {
      kicker: "قانوني",
      title: "سياسة الخصوصية",
      updated: LAST_UPDATED_AR,
      intro:
        "توضّح هذه السياسة ما نجمعه من معلومات شخصية عند الشراء منا أو مراسلتنا، وكيف نستخدمها، وكيف تطلب منا حذفها.",
      sections: [
        {
          heading: "من نحن",
          body: [
            `${STORE.nameAr} ("نحن") متجر كمبيوتر وإلكترونيات في الأردن. نبيع عبر موقعنا ${STORE.domain}، وحساباتنا على Instagram و Facebook، وعبر WhatsApp والهاتف، وفي المتجر.`,
          ],
        },
        {
          heading: "ما الذي نجمعه",
          body: [
            {
              list: [
                "بيانات الطلب التي تعطينا إياها: اسمك، رقم هاتفك، منطقتك وعنوان التوصيل، المنتجات التي تطلبها، وطريقة الدفع (حالياً الدفع عند الاستلام فقط).",
                "الرسائل التي ترسلها لنا على Instagram أو Facebook Messenger أو WhatsApp أو موقعنا، بما فيها الصور والمرفقات، واسمك واسم المستخدم الظاهران على تلك المنصة.",
                "بيانات الموقع: ملفات تعريف الارتباط (الكوكيز) اللازمة لعمل سلة التسوق وتسجيل الدخول، وبيانات تقنية أساسية مثل نوع المتصفح والصفحات التي تزورها. نستخدم Google Analytics و Meta Pixel لقياس أداء الموقع.",
              ],
            },
            "الدفع عند الاستلام هو طريقة الدفع الوحيدة لدينا، لذلك لا نطلب أرقام البطاقات ولا نجمعها ولا نخزّنها.",
          ],
        },
        {
          heading: "كيف نستخدمها",
          body: [
            "نستخدم معلوماتك فقط من أجل:",
            {
              list: [
                "استلام طلباتك وتجهيزها وتوصيلها ومتابعتها، ومعالجة الإرجاع والكفالة؛",
                "الرد على استفساراتك والاحتفاظ بسجل المحادثة ليتمكن أي من موظفينا من مساعدتك؛",
                "الاحتفاظ بالسجلات المحاسبية التي يفرضها القانون.",
              ],
            },
            "لا نبيع معلوماتك، ولا نستخدم رسائلك للإعلانات.",
          ],
        },
        {
          heading: "مع من نشاركها",
          body: [
            "فقط ما تحتاجه كل جهة لأداء عملها لصالحنا:",
            {
              list: [
                "شركات التوصيل: اسمك ورقم هاتفك وعنوانك لإيصال طلبك.",
                "مزوّدو الخدمات الذين يشغّلون أنظمتنا نيابة عنا: استضافة الموقع وقاعدة البيانات، وتخزين الملفات، وخدمة ذكاء اصطناعي تقرأ الرسائل الواردة لتجهّز مسودة طلب يراجعها موظفونا. كل طلب يراجعه ويؤكده شخص من فريقنا دائماً، ولا يحق لهؤلاء المزوّدين استخدام معلوماتك لأي غرض آخر.",
                "الجهات الرسمية عندما يفرض القانون ذلك.",
              ],
            },
          ],
        },
        {
          heading: "رسائل Instagram و Facebook",
          body: [
            "عندما تراسل حسابنا على Instagram أو Facebook، ترسل Meta تلك الرسالة إلى نظام الطلبات لدينا. لا نرى إلا الرسائل المرسلة إلى حساباتنا التجارية، ولا نرى أبداً محادثاتك الأخرى. نستخدمها فقط للرد عليك ومعالجة طلبك، ولا نبيعها ولا نشاركها مع وسطاء البيانات ولا نستخدمها للإعلانات، ونلتزم في ذلك بشروط منصة Meta.",
          ],
        },
        {
          heading: "مدة الاحتفاظ وكيف نحميها",
          body: [
            "نحتفظ بسجلات الطلبات طالما احتجنا إليها للتوصيل والإرجاع والكفالة وللسجلات المحاسبية التي يفرضها القانون. ونحتفظ بالرسائل طالما احتجنا إليها لخدمتك، أو إلى أن تطلب حذفها.",
            "تُخزَّن معلوماتك على خوادم محمية، ولا يطّلع عليها إلا موظفونا، ولا يرى كل حساب موظف إلا ما يحتاجه عمله.",
          ],
        },
        {
          heading: "خياراتك وكيفية حذف بياناتك",
          body: [
            "يمكنك في أي وقت أن تطلب الاطلاع على المعلومات التي نحتفظ بها عنك أو تصحيحها أو حذفها. لتقديم الطلب:",
            {
              list: [
                'أرسل لنا رسالة على Instagram أو Facebook تقول "احذف بياناتي"، أو',
                `راسلنا على البريد الإلكتروني ${email()}.`,
              ],
            },
            "سنؤكد استلام طلبك ونحذف رسائلك وملفك كعميل خلال 30 يوماً. إذا كان القانون يلزمنا بالاحتفاظ بسجل طلب، كالفاتورة، نحتفظ بذلك السجل وحده ونحذف كل ما عداه.",
            "ويمكنك التوقف عن مراسلتنا في أي وقت؛ حظر حسابنا أو إزالته في Instagram أو Facebook يمنع وصول أي رسائل جديدة إلينا.",
          ],
        },
        {
          heading: "الأطفال",
          body: [
            "خدماتنا غير موجّهة للأطفال دون 13 عاماً، ولا نجمع معلوماتهم عن علم. إذا كنت تعتقد أن طفلاً أرسل لنا معلومات شخصية، تواصل معنا وسنحذفها.",
          ],
        },
        {
          heading: "التعديلات والتواصل",
          body: [
            "إذا عدّلنا هذه السياسة، سننشر النسخة الجديدة على هذه الصفحة مع تاريخ جديد.",
            `للاستفسار، تواصل مع ${STORE.nameAr}:`,
            {
              list: [
                `البريد الإلكتروني: ${email()}`,
                `الهاتف / WhatsApp: ${phone}`,
                `العنوان: ${addr}، الأردن`,
              ],
            },
          ],
        },
      ],
    };
  }

  const addr = orPlaceholder(STORE.address, "store address");
  const phone = orPlaceholder(STORE.phone, "phone number");
  return {
    kicker: "Legal",
    title: "Privacy Policy",
    updated: LAST_UPDATED_EN,
    intro:
      "This policy explains what personal information we collect when you shop with us or message us, how we use it, and how to ask us to delete it.",
    sections: [
      {
        heading: "Who we are",
        body: [
          `${STORE.name} ("we", "us") is a computer and electronics store in Jordan. We sell through our website ${STORE.domain}, our Instagram and Facebook accounts, WhatsApp, phone, and in person.`,
        ],
      },
      {
        heading: "What we collect",
        body: [
          {
            list: [
              "Order details you give us: your name, phone number, delivery area and address, the products you order, and how you pay (currently cash on delivery only).",
              "Messages you send us on Instagram, Facebook Messenger, WhatsApp or our website, including any photos or attachments, and your public profile name and username on that platform.",
              "Website information: the cookies our website needs to keep your cart and login working, and basic technical data such as your browser type and pages visited. We use Google Analytics and the Meta Pixel to measure how the site performs.",
            ],
          },
          "Cash on delivery is the only way to pay, so we never ask for, collect or store card numbers.",
        ],
      },
      {
        heading: "How we use it",
        body: [
          "We use your information only to:",
          {
            list: [
              "take, prepare, deliver and follow up on your orders, returns and warranty claims;",
              "answer your questions and keep a record of our conversation so any of our staff can help you;",
              "keep the accounting records the law requires.",
            ],
          },
          "We do not sell your information, and we do not use your messages for advertising.",
        ],
      },
      {
        heading: "Who we share it with",
        body: [
          "Only what each one needs to do its job for us:",
          {
            list: [
              "Delivery companies get your name, phone number and address to bring your order.",
              "Service providers that run our systems on our behalf: website and database hosting, file storage, and an AI service that reads incoming messages to draft an order for our staff to check. A person on our team always reviews and confirms every order. These providers may not use your information for anything else.",
              "Authorities, when the law requires it.",
            ],
          },
        ],
      },
      {
        heading: "Instagram and Facebook messages",
        body: [
          "When you message our Instagram or Facebook account, Meta sends that message to our order system. We see only messages sent to our own business accounts, never your other conversations. We use them only to reply to you and handle your order. We don't sell this data, share it with data brokers, or use it for advertising. Our use of it follows Meta's Platform Terms.",
        ],
      },
      {
        heading: "How long we keep it and how we protect it",
        body: [
          "We keep order records for as long as we need them for delivery, returns, warranty and the accounting records the law requires. We keep messages while we need them to serve you, or until you ask us to delete them.",
          "Your information is stored on secured servers. Only our staff can see it, and staff accounts can't see more than their work needs.",
        ],
      },
      {
        heading: "Your choices and how to delete your data",
        body: [
          "You can ask us at any time to see, correct or delete the information we hold about you. To ask:",
          {
            list: [
              'send us a message on Instagram or Facebook saying "delete my data", or',
              `email ${email()}.`,
            ],
          },
          "We'll confirm your request and delete your messages and customer profile within 30 days. If we must keep an order record by law, such as an invoice, we keep only that record and remove everything else.",
          "You can also stop messaging us at any time. Blocking or removing our account in Instagram or Facebook stops any new messages from reaching us.",
        ],
      },
      {
        heading: "Children",
        body: [
          "Our services are not aimed at children under 13, and we don't knowingly collect their information. If you believe a child has sent us personal information, contact us and we'll delete it.",
        ],
      },
      {
        heading: "Changes and contact",
        body: [
          "If we change this policy, we'll post the new version on this page with a new date.",
          `Questions? Contact ${STORE.name}:`,
          {
            list: [
              `Email: ${email()}`,
              `Phone / WhatsApp: ${phone}`,
              `Address: ${addr}, Jordan`,
            ],
          },
        ],
      },
    ],
  };
}
