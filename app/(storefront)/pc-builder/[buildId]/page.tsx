import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ buildId: string }>;
}

// Shared builds moved to /pc-builder/share/[shareSlug] to avoid collisions
// with static routes like /pc-builder/parts and /pc-builder/ready-made.
export default async function SharedBuildLegacyRedirect({ params }: Props) {
  const { buildId } = await params;
  redirect(`/pc-builder/share/${buildId}`);
}
