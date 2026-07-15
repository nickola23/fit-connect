import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createEquipment, updateEquipment } from "@/lib/api-client";
import { getUser } from "@/lib/auth-storage";

const schema = z.object({
  name: z.string().trim().min(2, "Naziv mora imati bar 2 karaktera").max(100),
});

export function CatalogForm({ kind, backHref, editingId, initial }) {
  const navigate = useNavigate();
  const isEdit = !!editingId;
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const user = getUser();
  const isAdmin = user?.role === "admin";

  // Običan korisnik ne sme da menja opremu
  useEffect(() => {
    if (isEdit && !isAdmin) {
      toast.error("Nemate dozvolu za izmenu postojećih stavki.");
      navigate(backHref);
    }
  }, [isEdit, isAdmin, navigate, backHref]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);

    const result = schema.safeParse({
      name: fd.get("name"),
    });

    if (!result.success) {
      setErrors({ name: result.error.issues[0].message });
      setSubmitting(false);
      toast.error("Proveri unete podatke");
      return;
    }

    setErrors({});
    
    // Mapiramo interni "kind" u API "type"
    const type = kind === "equipment" ? "Apparatus" : "Accessory";
    const payload = {
      name: result.data.name,
      type,
    };

    try {
      if (isEdit && editingId) {
        await updateEquipment(editingId, payload);
        toast.success("Izmene su uspešno sačuvane");
      } else {
        await createEquipment(payload);
        toast.success("Uspešno dodato u katalog");
      }
      navigate(backHref);
    } catch (err) {
      toast.error(err.message || "Došlo je do greške prilikom čuvanja");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <button
        onClick={() => navigate(backHref)}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Nazad
      </button>

      <h1 className="mt-4 mb-8 font-display text-3xl font-bold tracking-tight text-foreground">
        {isEdit ? "Izmeni stavku" : `Dodaj ${kind === "equipment" ? "novu spravu" : "novi rekvizit"}`}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-border bg-card p-6 sm:p-8" noValidate>
        <div className="space-y-2">
          <Label htmlFor="name">Naziv *</Label>
          <Input 
            id="name" 
            name="name" 
            placeholder={kind === "equipment" ? "npr. Bench klupa" : "npr. Bučice 10kg"}
            defaultValue={initial?.name} 
            aria-invalid={!!errors.name} 
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>

        <div className="flex justify-end gap-3 border-t border-border pt-6">
          <Button type="button" variant="ghost" onClick={() => navigate(backHref)}>
            Otkaži
          </Button>
          <Button type="submit" disabled={submitting} className="min-w-[160px]">
            {submitting ? "Snimam..." : isEdit ? "Sačuvaj" : "Dodaj"}
          </Button>
        </div>
      </form>
    </div>
  );
}