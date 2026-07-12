import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { createItem, updateItem } from "@/lib/catalog-store";

const schema = z.object({
  name: z.string().trim().min(2, "Naziv mora imati bar 2 karaktera").max(100),
  category: z.string().trim().min(1, "Izaberi kategoriju"),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  location: z.string().trim().max(80).optional().or(z.literal("")),
  imageUrl: z.string().trim().url("Nevalidan URL").optional().or(z.literal("")),
});

export function CatalogForm({ kind, categories, backHref, editingId, initial }) {
  const navigate = useNavigate();
  const isEdit = !!editingId;
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [category, setCategory] = useState(initial?.category ?? "");

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);

    const raw = {
      name: fd.get("name"),
      category,
      description: fd.get("description") ?? "",
      location: fd.get("location") ?? "",
      imageUrl: fd.get("imageUrl") ?? "",
    };

    const result = schema.safeParse(raw);
    if (!result.success) {
      const errs = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0]?.toString() ?? "_";
        if (!errs[key]) errs[key] = issue.message;
      }
      setErrors(errs);
      setSubmitting(false);
      toast.error("Proveri unete podatke");
      return;
    }

    setErrors({});
    const payload = {
      name: result.data.name,
      category: result.data.category,
      description: result.data.description ?? "",
      location: result.data.location ?? "",
      imageUrl: result.data.imageUrl || undefined,
    };

    if (isEdit && editingId) {
      updateItem(kind, editingId, payload);
      toast.success("Izmene su sačuvane");
    } else {
      createItem(kind, payload);
      toast.success("Dodato u moju opremu");
    }
    navigate(backHref);
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
        {isEdit ? "Izmeni" : "Dodaj novo"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-border bg-card p-6 sm:p-8" noValidate>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="name">Naziv <span className="text-destructive">*</span></Label>
            <Input id="name" name="name" defaultValue={initial?.name} aria-invalid={!!errors.name} />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label>Kategorija <span className="text-destructive">*</span></Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger aria-invalid={!!errors.category}>
                <SelectValue placeholder="Izaberi" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="location">Gde se nalazi (opciono)</Label>
            <Input
              id="location"
              name="location"
              placeholder="npr. Dnevna soba, garaža, torba..."
              defaultValue={initial?.location}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="imageUrl">URL slike (opciono)</Label>
            <Input
              id="imageUrl"
              name="imageUrl"
              type="url"
              placeholder="https://..."
              defaultValue={initial?.imageUrl}
              aria-invalid={!!errors.imageUrl}
            />
            {errors.imageUrl && <p className="text-xs text-destructive">{errors.imageUrl}</p>}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Napomena (opciono)</Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={initial?.description}
              placeholder="Kratak opis ili napomena..."
            />
          </div>
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
