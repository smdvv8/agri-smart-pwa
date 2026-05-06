import { AppShell } from "@/components/layout/app-shell";
import { DashboardClient } from "@/components/dashboard-client";

export const metadata = {
  title: "Панель",
};

export default function DashboardPage() {
  return (
    <AppShell>
      <DashboardClient />
    </AppShell>
  );
}
