import { AdminSidebar, AdminTopbar } from "@/components/admin/sidebar";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="ff-admin flex min-h-screen flex-col bg-background text-foreground md:flex-row">
      <AdminTopbar />
      <AdminSidebar />
      <div className="flex-1 overflow-x-auto">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </div>
      </div>
    </div>
  );
}
