import { redirect } from "next/navigation";
import { AuthPortal } from "../../../components/auth-portal";
import { getCurrentSessionProfile } from "../../../lib/auth/session";

export const dynamic = "force-dynamic";

type AdminLoginPageProps = {
  searchParams?: {
    error?: string;
    message?: string;
  };
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const session = await getCurrentSessionProfile();

  if (session.user && (session.profile?.role === "admin" || session.profile?.role === "super_admin")) {
    redirect("/admin");
  }

  const errorMessage = searchParams?.error ? decodeURIComponent(searchParams.error) : null;
  const message = searchParams?.message ? decodeURIComponent(searchParams.message) : null;

  return (
    <AuthPortal
      errorMessage={errorMessage}
      message={message}
      mode="control"
    />
  );
}
