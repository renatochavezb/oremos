import { Suspense } from "react";
import SignInForm from "@/components/SignInForm";

function SignInFallback() {
  return (
    <main className="min-h-[100dvh] bg-cream-bg flex items-center justify-center">
      <span className="loading loading-spinner loading-lg text-primary" />
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<SignInFallback />}>
      <SignInForm />
    </Suspense>
  );
}
