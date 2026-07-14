import { Toaster } from "@/components/ui/sonner";
import { ClientShell } from "@/components/client/ClientShell";
import { CatalogForm } from "@/components/equipment/CatalogForm";
import { usePageTitle } from "@/lib/use-page-title";

export default function EquipmentNew() {
  usePageTitle("Nova sprava — FitConnect");

  return (
    <ClientShell>
      <Toaster />
      <CatalogForm
        kind="equipment"
        backHref="/my-equipment/equipment"
      />
    </ClientShell>
  );
}