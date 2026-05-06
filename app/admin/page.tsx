import { AppShell } from "@/components/layout/app-shell";
import { AdminHome } from "@/components/admin-client";

export const metadata = {
  title: "Admin",
};

export default function AdminPage() {
  return (
    <AppShell>
      <AdminHome />
    </AppShell>
  );
}
