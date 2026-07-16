import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getEquipment, createEquipment, updateEquipment, deleteEquipment, ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Plus, Pencil, Trash2 } from "lucide-react";

/**
 * Admin CRUD table for the shared equipment catalog.
 * type: "Apparatus" (sprave) | "Accessory" (rekviziti) — same backend catalog, filtered by type.
 */
export function EquipmentCrudTable({ type, title, itemLabel, newLabel }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // null = creating new
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  function load() {
    setLoading(true);
    getEquipment(type)
      .then(setItems)
      .catch((error) => {
        const message = error instanceof ApiError ? error.message : `Ne mogu da učitam ${itemLabel.toLowerCase()}e.`;
        toast.error("Greška pri učitavanju", { description: message });
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  function openCreate() {
    setEditingItem(null);
    setName("");
    setFormOpen(true);
  }

  function openEdit(item) {
    setEditingItem(item);
    setName(item.name);
    setFormOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error(`Unesi naziv ${itemLabel.toLowerCase()}e`);
      return;
    }

    setSaving(true);
    try {
      if (editingItem) {
        await updateEquipment(editingItem.id, { name: trimmed, type });
        toast.success(`${itemLabel} je izmenjena`);
      } else {
        await createEquipment({ name: trimmed, type });
        toast.success(`${itemLabel} je dodata`);
      }
      setFormOpen(false);
      load();
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        toast.error("Već postoji stavka sa tim nazivom");
      } else {
        const message = error instanceof ApiError ? error.message : "Čuvanje nije uspelo.";
        toast.error("Greška", { description: message });
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteEquipment(deleteTarget.id);
      toast.success(`${itemLabel} je obrisana`);
      setDeleteTarget(null);
      load();
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        toast.error("Ne može da se obriše", {
          description: "Stavka je povezana sa vežbom ili klijentom.",
        });
      } else {
        const message = error instanceof ApiError ? error.message : "Brisanje nije uspelo.";
        toast.error("Greška", { description: message });
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <Toaster />
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Deo je zajedničkog kataloga opreme, razlikuju se samo po tipu.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {newLabel}
        </Button>
      </div>

      <div className="mt-6 rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Naziv</TableHead>
              <TableHead className="w-32 text-right">Akcije</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={2} className="py-8 text-center text-muted-foreground">
                  Učitavanje…
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="py-8 text-center text-muted-foreground">
                  Još nema unetih stavki.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-foreground">{item.name}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(item)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editingItem ? `Izmeni ${itemLabel.toLowerCase()}u` : newLabel}</DialogTitle>
            <DialogDescription>
              {editingItem
                ? "Ažuriraj naziv stavke."
                : `Dodaj novu stavku u katalog (${itemLabel.toLowerCase()}).`}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="equipment-name">Naziv *</Label>
              <Input
                id="equipment-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="npr. Bučice"
                autoFocus
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Otkaži
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Čuvam..." : "Sačuvaj"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Obrisati "{deleteTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Ova akcija je nepovratna. Brisanje neće uspeti ako je stavka povezana sa nekom
              vežbom ili klijentom.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Otkaži</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Brišem..." : "Obriši"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}