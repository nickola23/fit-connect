import { AdminShell } from "@/components/admin/AdminShell";
import { EquipmentCrudTable } from "@/components/admin/EquipmentCrudTable";
import { usePageTitle } from "@/lib/use-page-title";

export default function AccessoryCrud() {
  usePageTitle("Rekviziti | FitConnect Admin");

  return (
    <AdminShell>
      <EquipmentCrudTable
        type="Accessory"
        title="Rekviziti"
        itemLabel="Rekvizit"
        newLabel="Dodaj rekvizit"
      />
    </AdminShell>
  );
}