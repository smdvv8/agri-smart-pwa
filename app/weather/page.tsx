import { AppShell } from "@/components/layout/app-shell";
import { WeatherClient } from "@/components/weather-client";

export const metadata = {
  title: "Погода",
};

export default function WeatherPage() {
  return (
    <AppShell>
      <WeatherClient />
    </AppShell>
  );
}
