import { AppShell } from "@/components/layout/app-shell";
import { CropDetailClient } from "@/components/crop-guide-client";

export const metadata = {
  title: "Культура",
};

export default async function CropDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <AppShell>
      <CropDetailClient id={id} />
    </AppShell>
  );
}
