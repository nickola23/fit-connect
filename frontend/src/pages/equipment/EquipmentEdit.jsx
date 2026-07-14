import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { ClientShell } from "@/components/client/ClientShell";
import { CatalogForm } from "@/components/equipment/CatalogForm";
import { getEquipmentById } from "@/lib/api-client";
import { usePageTitle } from "@/lib/use-page-title";
import { toast } from "sonner";

export default function EquipmentEdit() {
  usePageTitle("Izmena sprave — FitConnect");

  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEquipmentById(id)
      .then((data) => {
        setItem(data);
      })
      .catch(() => {
        toast.error("Sprava nije pronađena");
        setTimeout(() => navigate("/my-equipment/equipment"), 1500);
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  return (
    <ClientShell>
      <Toaster />
      {loading ? (
        <div className="text-center text-muted-foreground py-8">Učitavanje...</div>
      ) : item ? (
        <CatalogForm
          kind="equipment"
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
    </ClientShell>
  );
}