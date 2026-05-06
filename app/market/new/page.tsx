import { AppShell } from "@/components/layout/app-shell";
import { MarketForm } from "@/components/forms/market-form";

export const metadata = {
  title: "Новый товар",
};

export default function NewMarketProductPage() {
  return (
    <AppShell>
      <MarketForm />
    </AppShell>
  );
}
