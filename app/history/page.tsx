import { AppShell } from "@/components/layout/app-shell";
import { HistoryClient } from "@/components/history-client";

export const metadata = {
  title: "История",
};

export default function HistoryPage() {
  return (
    <AppShell>
      <HistoryClient />
    </AppShell>
  );
}
