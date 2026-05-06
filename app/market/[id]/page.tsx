import { AppShell } from "@/components/layout/app-shell";
import { MarketDetailClient } from "@/components/market-detail-client";

export const metadata = {
  title: "Товар",
};

export default async function MarketProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <AppShell>
      <MarketDetailClient id={id} />
    </AppShell>
  );
}
