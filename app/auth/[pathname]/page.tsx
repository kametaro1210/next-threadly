import { AuthView } from "@neondatabase/auth/react";
import { authLocalization } from "@/lib/auth-localization";

export default async function AuthPage({
  params,
}: {
  params: Promise<{ pathname: string }>;
}) {
  const { pathname } = await params;
  return (
    <div className="flex min-h-[100dvh] w-full flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <AuthView
          pathname={pathname}
          localization={authLocalization}
        />
      </div>
    </div>
  );
}