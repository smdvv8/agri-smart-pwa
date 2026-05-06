import { AppShell } from "@/components/layout/app-shell";
import { SettingsClient } from "@/components/profile-client";

export const metadata = {
  title: "Настройки",
};

export default function SettingsPage() {
  return (
    <AppShell>
      <SettingsClient />
    </AppShell>
  );
}
