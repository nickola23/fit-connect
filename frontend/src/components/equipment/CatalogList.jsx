import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { getEquipment, deleteEquipment } from "@/lib/api-client";
import { getUser } from "@/lib/auth-storage";

export function CatalogList({ kind, title, subtitle, newHref, editHrefBase }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [toDelete, setToDelete] = useState(null);

  const user = getUser();
  const isAdmin = user?.role === "admin";

  // Mapiramo naš interni ključ u API parametar tipa
  const apiType = kind === "equipment" ? "Apparatus" : "Accessory";

  useEffect(() => {
    loadItems();
  }, [kind]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await getEquipment(apiType);
      setItems(data);
    } catch (err) {
      toast.error("Greška pri učitavanju opreme");
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(query.toLowerCase())
  );

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteEquipment(toDelete.id);
      toast.success(`Obrisano: ${toDelete.name}`);
      setItems((prev) => prev.filter((i) => i.id !== toDelete.id));
    } catch (err) {
      if (err.status === 409) {
        toast.error("Nije moguće obrisati", {
          description: "Ova stavka je već povezana sa klijentom ili vežbom."
        });
      } else {
        toast.error(err.message || "Neuspešno brisanje");
      }
    } finally {
      setToDelete(null);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Učitavanje...</div>;
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="mt-1 text-muted-foreground">{subtitle}</p>
        </div>
        <Button asChild size="lg">
          <Link to={newHref}>
            <Plus className="mr-2 h-4 w-4" />
            Dodaj u katalog
          </Link>
        </Button>
      </div>

      <div className="mb-6 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pretraži..."
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 py-16 text-center">
          <p className="text-muted-foreground">
            {items.length === 0
              ? 'Katalog je prazan. Klikni na „Dodaj u katalog“ da započneš.'
              : "Nema rezultata za pretragu."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <article
              key={item.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lg"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-muted flex items-center justify-center">
                <div className="text-5xl font-display font-bold text-muted-foreground/30">
                  {item.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <span className="text-xs font-medium uppercase tracking-wide text-primary">
                  {kind === "equipment" ? "Sprava" : "Rekvizit"}
                </span>
                <h3 className="mt-1 font-display text-lg font-semibold text-foreground">
                  {item.name}
                </h3>
                
                {/* Isključivo admini vide opcije za izmenu i brisanje */}
                {isAdmin && (
                  <div className="mt-auto flex justify-end gap-1 border-t border-border pt-4 mt-6">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`${editHrefBase}/${item.id}`}>
                        <Pencil className="mr-1.5 h-3.5 w-3.5" />
                        Izmeni
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setToDelete({ id: item.id, name: item.name })}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                      Obriši
                    </Button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {isAdmin && (
        <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Obrisati "{toDelete?.name}"?</AlertDialogTitle>
              <AlertDialogDescription>
                Ova akcija je nepovratna. Ukoliko je stavka već dodeljena nekoj vežbi ili klijentu, brisanje neće uspeti.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Otkaži</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Obriši
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}