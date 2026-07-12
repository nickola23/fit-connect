import { Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { MapPin, Pencil, Plus, Search, Trash2 } from "lucide-react";

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

import { deleteItem, useCatalog } from "@/lib/catalog-store";

export function CatalogList({ kind, title, subtitle, newHref, editHrefBase }) {
  const items = useCatalog(kind);
  const [query, setQuery] = useState("");
  const [toDelete, setToDelete] = useState(null);

  const filtered = items.filter(
    (i) =>
      i.name.toLowerCase().includes(query.toLowerCase()) ||
      i.category.toLowerCase().includes(query.toLowerCase()),
  );

  const confirmDelete = () => {
    if (!toDelete) return;
    deleteItem(kind, toDelete.id);
    toast.success(`Obrisano: ${toDelete.name}`);
    setToDelete(null);
  };

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
            Dodaj novo
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
              ? 'Još nemaš unosa. Klikni na „Dodaj novo“ da počneš.'
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
              <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
                {item.imageUrl ? (
                  // eslint-disable-next-line jsx-a11y/alt-text
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-4xl font-display font-bold text-muted-foreground/40">
                    {item.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <span className="text-xs font-medium uppercase tracking-wide text-primary">
                  {item.category}
                </span>
                <h3 className="mt-1 font-display text-lg font-semibold text-foreground">
                  {item.name}
                </h3>
                {item.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                )}
                {item.location && (
                  <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {item.location}
                  </p>
                )}
                <div className="mt-4 flex justify-end gap-1 border-t border-border pt-3">
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
              </div>
            </article>
          ))}
        </div>
      )}

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Obrisati "{toDelete?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Ova akcija je nepovratna. Zapis će biti trajno uklonjen.
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
    </div>
  );
}
