import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-md">
      <AuthForm mode="login" />
    </main>
  );
}
