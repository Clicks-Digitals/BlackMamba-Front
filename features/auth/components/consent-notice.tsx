import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * S2: sign-up and guest checkout carried no reference to the terms or the
 * privacy policy at all — neither a box nor a line of text — while both
 * pages now exist.
 *
 * A sentence above the button rather than a tick box: an unticked box stops
 * the sale without telling anyone anything, and continuing is itself the
 * agreement. The links are what matters, and they are here.
 */
export function ConsentNotice({
  action,
  rtl,
  className,
}: {
  /** What the button does: "creating an account", "placing this order". */
  action: "register" | "order";
  rtl: boolean;
  className?: string;
}) {
  const copy = rtl
    ? {
        register: "بإنشاء حساب فإنك توافق على",
        order: "بإتمام الطلب فإنك توافق على",
        terms: "الشروط والأحكام",
        and: "و",
        privacy: "سياسة الخصوصية",
      }
    : {
        register: "By creating an account you agree to our",
        order: "By placing this order you agree to our",
        terms: "Terms",
        and: "and",
        privacy: "Privacy Policy",
      };

  return (
    <p
      className={cn(
        "text-center text-[11.5px] leading-relaxed text-muted-foreground",
        rtl && "font-cairo",
        className
      )}
    >
      {copy[action]}{" "}
      <Link href="/terms" className="underline underline-offset-2 hover:text-foreground">
        {copy.terms}
      </Link>{" "}
      {copy.and}{" "}
      <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
        {copy.privacy}
      </Link>
      .
    </p>
  );
}
