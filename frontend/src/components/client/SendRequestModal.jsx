import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listTrainerPricingTiers, createCooperation, ApiError } from "@/lib/api-client";
import { Sparkles, Send } from "lucide-react";

export function SendRequestModal({ open, onOpenChange, trainer, hasFreeTrialAvailable, onSent }) {
  const [tiers, setTiers] = useState([]);
  const [loadingTiers, setLoadingTiers] = useState(true);
  const [selectedTierId, setSelectedTierId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open || !trainer) return;

    setSelectedTierId(null);

    if (hasFreeTrialAvailable) {
      setTiers([]);
      setLoadingTiers(false);
      return;
    }

    setLoadingTiers(true);
    listTrainerPricingTiers(trainer.id)
      .then((data) => {
        const active = data.filter((t) => t.active);
        setTiers(active);
        if (active.length > 0) setSelectedTierId(active[0].id);
      })
      .catch((error) => {
        const message =
          error instanceof ApiError ? error.message : "Ne mogu da učitam pakete trenera.";
        toast.error("Greška", { description: message });
      })
      .finally(() => setLoadingTiers(false));
  }, [open, trainer, hasFreeTrialAvailable]);

  async function handleSubmit() {
    if (!trainer) return;

    if (!hasFreeTrialAvailable && !selectedTierId) {
      toast.error("Izaberi paket");
      return;
    }

    setSubmitting(true);
    try {
      await createCooperation(
        hasFreeTrialAvailable
          ? { trainerId: trainer.id, isFreeTrial: true }
          : { trainerId: trainer.id, pricingTierId: selectedTierId, isFreeTrial: false }
      );
      toast.success("Zahtev je poslat treneru.");
      onOpenChange(false);
      onSent?.();
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Greška pri slanju zahteva.";
      toast.error("Greška", { description: message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Pošalji zahtev — {trainer?.name}</DialogTitle>
          <DialogDescription>
            Izaberi paket saradnje pre nego što pošalješ zahtev treneru.
          </DialogDescription>
        </DialogHeader>

        {hasFreeTrialAvailable ? (
          <div className="space-y-3">
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
              <p className="flex items-center gap-2 font-medium text-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                Tvoja prva saradnja je besplatna!
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Iskoristi svoj besplatni probni termin — plaćeni paketi postaju dostupni tek
                posle toga.
              </p>
            </div>

            <div className="space-y-2 opacity-50">
              <p className="text-sm font-medium text-foreground">Plaćeni paketi</p>
              <div className="rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground">
                Onemogućeno dok ne iskoristiš besplatnu probnu saradnju.
              </div>
            </div>
          </div>
        ) : loadingTiers ? (
          <p className="text-sm text-muted-foreground">Učitavanje paketa…</p>
        ) : tiers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Ovaj trener trenutno nema aktivnih paketa.
          </p>
        ) : (
          <div className="space-y-2">
            {tiers.map((tier) => {
              const selected = selectedTierId === tier.id;
              return (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => setSelectedTierId(tier.id)}
                  className={`flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors ${
                    selected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-accent"
                  }`}
                >
                  <div>
                    <p className="font-medium text-foreground">{tier.sessionsPerWeek}x nedeljno</p>
                    <p className="text-sm text-muted-foreground">
                      {tier.monthlyPrice.toLocaleString("sr-RS")} RSD / mesec
                    </p>
                  </div>
                  {selected && <Badge>Izabrano</Badge>}
                </button>
              );
            })}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Otkaži
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || (!hasFreeTrialAvailable && (loadingTiers || tiers.length === 0))}
          >
            <Send className="mr-2 h-4 w-4" />
            {submitting ? "Šaljem..." : "Pošalji zahtev"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}