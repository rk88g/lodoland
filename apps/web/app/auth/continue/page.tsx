import { AuthContinueScreen } from "../../../components/auth-continue-screen";

export const dynamic = "force-dynamic";

type AuthContinuePageProps = {
  searchParams?: {
    to?: string;
  };
};

export default function AuthContinuePage({ searchParams }: AuthContinuePageProps) {
  return <AuthContinueScreen nextTarget={searchParams?.to || "/perfil"} />;
}
