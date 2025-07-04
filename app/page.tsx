import AuthGuard from "../components/auth-guard";
import TopPage from "@/components/TopPage";

export default function Home() {
  return (
    <AuthGuard>
      <div>
        <TopPage />
      </div>
    </AuthGuard>
  );
}
