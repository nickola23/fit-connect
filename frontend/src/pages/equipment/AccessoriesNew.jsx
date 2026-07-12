import { Toaster } from "@/components/ui/sonner";
import { EquipmentShell } from "@/components/equipment/EquipmentShell";
import { CatalogForm } from "@/components/equipment/CatalogForm";
import { ACCESSORY_CATEGORIES } from "@/lib/catalog-store";
import { usePageTitle } from "@/lib/use-page-title";

export default function AccessoriesNew() {
  usePageTitle("Novi rekvizit — FitConnect");

  return (
    <EquipmentShell>
      <Toaster />
      <CatalogForm
        kind="accessories"
        categories={ACCESSORY_CATEGORIES}
        backHref="/my-equipment/accessory"
      />
    </EquipmentShell>
  );
}
