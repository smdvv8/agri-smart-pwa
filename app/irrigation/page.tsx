import { AppShell } from "@/components/layout/app-shell";
import { IrrigationForm } from "@/components/forms/irrigation-form";

export const metadata = {
  title: "Полив",
};

export default function IrrigationPage() {
  return (
    <AppShell>
      <IrrigationForm />
    </AppShell>
  );
}
