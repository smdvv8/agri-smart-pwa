import { AppShell } from "@/components/layout/app-shell";
import { DiagnosisForm } from "@/components/forms/diagnosis-form";

export const metadata = {
  title: "Диагностика",
};

export default function DiagnosisPage() {
  return (
    <AppShell>
      <DiagnosisForm />
    </AppShell>
  );
}
