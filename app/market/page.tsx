import { AppShell } from "@/components/layout/app-shell";
import { MarketClient } from "@/components/market-client";

export const metadata = {
  title: "Маркет",
};

export default function MarketPage() {
  return (
    <AppShell>
      <MarketClient />
    </AppShell>
  );
}
