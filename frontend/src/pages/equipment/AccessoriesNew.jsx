import { Toaster } from "@/components/ui/sonner";
import { ClientShell } from "@/components/client/ClientShell";
import { CatalogForm } from "@/components/equipment/CatalogForm";
import { usePageTitle } from "@/lib/use-page-title";

export default function AccessoriesNew() {
  usePageTitle("Novi rekvizit — FitConnect");

  return (
    <ClientShell>
      <Toaster />
      <CatalogForm
        kind="accessories"
        backHref="/my-equipment/accessory"
      />
    </ClientShell>
  );
}