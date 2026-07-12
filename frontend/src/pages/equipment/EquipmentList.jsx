import { Toaster } from "@/components/ui/sonner";
import { EquipmentShell } from "@/components/equipment/EquipmentShell";
import { CatalogList } from "@/components/equipment/CatalogList";
import { usePageTitle } from "@/lib/use-page-title";

export default function EquipmentList() {
  usePageTitle("Moje sprave — FitConnect");

  return (
    <EquipmentShell>
      <Toaster />
      <CatalogList
        kind="equipment"
        title="Moje sprave"
        subtitle="Sprave za vežbanje koje posedujem i koristim."
        newHref="/my-equipment/equipment/new"
        editHrefBase="/my-equipment/equipment"
      />
    </EquipmentShell>
  );
}
