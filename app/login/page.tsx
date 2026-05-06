import { Suspense } from "react";
import { LoginForm } from "@/components/forms/auth-form";

export const metadata = {
  title: "Вход",
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
