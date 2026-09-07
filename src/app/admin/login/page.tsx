import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin/login-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-surface-muted/40 px-4">
      <Suspense>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
