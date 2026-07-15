import { Toaster } from "@/components/ui/sonner";
import { ClientShell } from "@/components/client/ClientShell";
import { CatalogList } from "@/components/equipment/CatalogList";
import { usePageTitle } from "@/lib/use-page-title";

export default function EquipmentList() {
  usePageTitle("Moje sprave — FitConnect");

  return (
    <ClientShell>
      <Toaster />
      <CatalogList
        kind="equipment"
        title="Sprave"
        subtitle="Sprave za vežbanje."
        newHref="/my-equipment/equipment/new"
        editHrefBase="/my-equipment/equipment"
      />
    </ClientShell>
  );
}