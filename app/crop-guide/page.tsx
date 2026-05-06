import { AppShell } from "@/components/layout/app-shell";
import { CropGuideClient } from "@/components/crop-guide-client";

export const metadata = {
  title: "Культуры",
};

export default function CropGuidePage() {
  return (
    <AppShell>
      <CropGuideClient />
    </AppShell>
  );
}
