import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { ClientShell } from "@/components/client/ClientShell";
import { CatalogForm } from "@/components/equipment/CatalogForm";
import { getEquipmentById } from "@/lib/api-client";
import { usePageTitle } from "@/lib/use-page-title";
import { toast } from "sonner";

export default function AccessoriesEdit() {
  usePageTitle("Izmena rekvizita — FitConnect");

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
        toast.error("Rekvizit nije pronađen");
        setTimeout(() => navigate("/my-equipment/accessory"), 1500);
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
          kind="accessories"
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
    </ClientShell>
  );
}