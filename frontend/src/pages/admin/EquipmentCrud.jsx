import { AdminShell } from "@/components/admin/AdminShell";
import { EquipmentCrudTable } from "@/components/admin/EquipmentCrudTable";
import { usePageTitle } from "@/lib/use-page-title";

export default function EquipmentCrud() {
  usePageTitle("Sprave | FitConnect Admin");

  return (
    <AdminShell>
      <EquipmentCrudTable
        type="Apparatus"
        title="Sprave"
        itemLabel="Sprava"
        newLabel="Dodaj spravu"
      />
    </AdminShell>
  );
}