import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { EquipmentShell } from "@/components/equipment/EquipmentShell";
import { CatalogForm } from "@/components/equipment/CatalogForm";
import { ACCESSORY_CATEGORIES, getItem } from "@/lib/catalog-store";
import { usePageTitle } from "@/lib/use-page-title";

export default function AccessoriesEdit() {
  usePageTitle("Izmena rekvizita — FitConnect");

  const { id } = useParams();
  const navigate = useNavigate();
  const item = getItem("accessories", id);

  useEffect(() => {
    if (!item) {
      const t = setTimeout(() => navigate("/my-equipment/accessory"), 1500);
      return () => clearTimeout(t);
    }
  }, [item, navigate]);

  return (
    <EquipmentShell>
      <Toaster />
      {item ? (
        <CatalogForm
          kind="accessories"
          categories={ACCESSORY_CATEGORIES}
          backHref="/my-equipment/accessory"
          editingId={id}
          initial={item}
        />
      ) : (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">Rekvizit nije pronađen. Vraćam te na listu...</p>
          <Button className="mt-4" onClick={() => navigate("/my-equipment/accessory")}>
            Nazad
          </Button>
        </div>
      )}
    </EquipmentShell>
  );
}
