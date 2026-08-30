import { getTranslations } from "next-intl/server";
import { ResetPasswordFlow } from "@/features/auth";

export async function generateMetadata() {
  const t = await getTranslations("Auth.ResetPassword");
  return { title: t("forgotPasswordTitle"), description: t("forgotPasswordDesc") };
}

export default function ForgotPasswordPage() {
  return (
    <div className="flex w-full items-center justify-center p-6 md:p-10">
      <ResetPasswordFlow />
    </div>
  );
}
