import { AppShell } from "@/components/layout/app-shell";
import { ProfileClient } from "@/components/profile-client";

export const metadata = {
  title: "Профиль",
};

export default function ProfilePage() {
  return (
    <AppShell>
      <ProfileClient />
    </AppShell>
  );
}
