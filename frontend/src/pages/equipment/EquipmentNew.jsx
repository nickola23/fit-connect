import { Toaster } from "@/components/ui/sonner";
import { EquipmentShell } from "@/components/equipment/EquipmentShell";
import { CatalogForm } from "@/components/equipment/CatalogForm";
import { EQUIPMENT_CATEGORIES } from "@/lib/catalog-store";
import { usePageTitle } from "@/lib/use-page-title";

export default function EquipmentNew() {
  usePageTitle("Nova sprava — FitConnect");

  return (
    <EquipmentShell>
      <Toaster />
      <CatalogForm
        kind="equipment"
        categories={EQUIPMENT_CATEGORIES}
        backHref="/my-equipment/equipment"
      />
    </EquipmentShell>
  );
}
