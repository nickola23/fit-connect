import { Toaster } from "@/components/ui/sonner";
import { ClientShell } from "@/components/client/ClientShell";
import { CatalogList } from "@/components/equipment/CatalogList";
import { usePageTitle } from "@/lib/use-page-title";

export default function AccessoriesList() {
  usePageTitle("Moji rekviziti — FitConnect");

  return (
    <ClientShell>
      <Toaster />
      <CatalogList
        kind="accessories"
        title="Rekviziti"
        subtitle="Sitna oprema i rekviziti."
        newHref="/my-equipment/accessory/new"
        editHrefBase="/my-equipment/accessory"
      />
    </ClientShell>
  );
}