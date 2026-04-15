import { redirect } from "next/navigation";
import { AuthPortal } from "../../components/auth-portal";
import { getCurrentSessionProfile } from "../../lib/auth/session";

export const dynamic = "force-dynamic";

type LoginPageProps = {
  searchParams?: {
    error?: string;
    message?: string;
  };
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getCurrentSessionProfile();

  if (session.user) {
    if (session.profile?.role === "admin" || session.profile?.role === "super_admin") {
      redirect("/admin");
    }

    if (session.profile?.role === "staff") {
      redirect("/staff/tickets");
    }

    redirect("/perfil");
  }

  const errorMessage = searchParams?.error ? decodeURIComponent(searchParams.error) : null;
  const message = searchParams?.message ? decodeURIComponent(searchParams.message) : null;

  return (
    <AuthPortal
      errorMessage={errorMessage}
      message={message}
      mode="customer"
    />
  );
}
