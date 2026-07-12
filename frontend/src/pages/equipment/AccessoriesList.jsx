import { Toaster } from "@/components/ui/sonner";
import { EquipmentShell } from "@/components/equipment/EquipmentShell";
import { CatalogList } from "@/components/equipment/CatalogList";
import { usePageTitle } from "@/lib/use-page-title";

export default function AccessoriesList() {
  usePageTitle("Moji rekviziti — FitConnect");

  return (
    <EquipmentShell>
      <Toaster />
      <CatalogList
        kind="accessories"
        title="Moji rekviziti"
        subtitle="Sitna oprema i rekviziti koje posedujem."
        newHref="/my-equipment/accessory/new"
        editHrefBase="/my-equipment/accessory"
      />
    </EquipmentShell>
  );
}
