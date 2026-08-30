import { redirect } from "next/navigation";
import { ProfileTabs, getProfileAction } from "@/features/profile";

export async function ProfilePage() {
  const { user, unauthorized } = await getProfileAction();
  if (!user) {
    if (unauthorized) {
      // Token present but server rejected it — clear stale session before re-login
      redirect(`/login?error=session_expired&callback=${encodeURIComponent("/profile")}`);
    }
    redirect(`/login?callback=${encodeURIComponent("/profile")}`);
  }

  return <ProfileTabs user={user} />;
}
