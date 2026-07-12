import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { EquipmentShell } from "@/components/equipment/EquipmentShell";
import { CatalogForm } from "@/components/equipment/CatalogForm";
import { EQUIPMENT_CATEGORIES, getItem } from "@/lib/catalog-store";
import { usePageTitle } from "@/lib/use-page-title";

export default function EquipmentEdit() {
  usePageTitle("Izmena sprave — FitConnect");

  const { id } = useParams();
  const navigate = useNavigate();
  const item = getItem("equipment", id);

  useEffect(() => {
    if (!item) {
      const t = setTimeout(() => navigate("/my-equipment/equipment"), 1500);
      return () => clearTimeout(t);
    }
  }, [item, navigate]);

  return (
    <EquipmentShell>
      <Toaster />
      {item ? (
        <CatalogForm
          kind="equipment"
          categories={EQUIPMENT_CATEGORIES}
          backHref="/my-equipment/equipment"
          editingId={id}
          initial={item}
        />
      ) : (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">Sprava nije pronađena. Vraćam te na listu...</p>
          <Button className="mt-4" onClick={() => navigate("/my-equipment/equipment")}>
            Nazad
          </Button>
        </div>
      )}
    </EquipmentShell>
  );
}
