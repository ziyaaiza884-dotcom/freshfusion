import { getSettings } from "@/server/store";
import { ThemePicker } from "@/components/admin/theme-picker";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const { theme } = await getSettings();

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold">Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Choose the storefront theme. It applies to every customer immediately.
      </p>
      <div className="mt-6">
        <ThemePicker current={theme} />
      </div>
    </div>
  );
}
