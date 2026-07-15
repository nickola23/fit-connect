import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TrainerShell } from "@/components/trainer/TrainerShell";
import { getUser } from "@/lib/auth-storage";
import {
  listTrainerPricingTiers,
  createPricingTier,
  updatePricingTier,
  deactivatePricingTier,
  activatePricingTier,
  ApiError,
} from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Pencil, Plus, Power, PowerOff } from "lucide-react";
import { usePageTitle } from "@/lib/use-page-title";

function PriceEditor({ tier, onSaved }) {
  const [editing, setEditing] = useState(false);
  const [price, setPrice] = useState(tier.monthlyPrice);
  const [saving, setSaving] = useState(false);

  async function save() {
    const value = Number(price);
    if (!value || value <= 0) {
      toast.error("Unesi validnu cenu");
      return;
    }
    setSaving(true);
    try {
      const updated = await updatePricingTier(tier.id, { monthlyPrice: value });
      toast.success("Cena je izmenjena");
      setEditing(false);
      onSaved(updated);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Izmena nije uspela.";
      toast.error("Greška", { description: message });
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold text-foreground">
          {tier.monthlyPrice.toLocaleString("sr-RS")} RSD / mesec
        </span>
        <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
          <Pencil className="mr-1.5 h-3.5 w-3.5" />
          Izmeni cenu
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        min={1}
        step="0.01"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="w-40"
      />
      <Button size="sm" onClick={save} disabled={saving}>
        {saving ? "Čuvam..." : "Sačuvaj"}
      </Button>
      <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
        Otkaži
      </Button>
    </div>
  );
}

export default function PricingTiers() {
  usePageTitle("Moji paketi | FitConnect");

  const user = getUser();
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);

  const [sessionsPerWeek, setSessionsPerWeek] = useState(3);
  const [monthlyPrice, setMonthlyPrice] = useState("");
  const [creating, setCreating] = useState(false);

  function loadTiers() {
    if (!user) return;
    setLoading(true);
    listTrainerPricingTiers(user.id)
      .then(setTiers)
      .catch((error) => {
        const message =
          error instanceof ApiError ? error.message : "Ne mogu da učitam pakete.";
        toast.error("Greška pri učitavanju", { description: message });
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadTiers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleTierUpdated(updated) {
    setTiers((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }

  async function handleToggleActive(tier) {
    setTogglingId(tier.id);
    try {
      const updated = tier.active
        ? await deactivatePricingTier(tier.id)
        : await activatePricingTier(tier.id);
      toast.success(tier.active ? "Paket je deaktiviran" : "Paket je aktiviran");
      handleTierUpdated(updated);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Akcija nije uspela.";
      toast.error("Greška", { description: message });
    } finally {
      setTogglingId(null);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    const sessions = Number(sessionsPerWeek);
    const price = Number(monthlyPrice);

    if (!sessions || sessions < 1) {
      toast.error("Unesi validan broj treninga nedeljno");
      return;
    }
    if (!price || price <= 0) {
      toast.error("Unesi validnu cenu");
      return;
    }

    setCreating(true);
    try {
      const created = await createPricingTier(user.id, {
        sessionsPerWeek: sessions,
        monthlyPrice: price,
      });
      setTiers((prev) => [...prev, created]);
      setSessionsPerWeek(3);
      setMonthlyPrice("");
      toast.success("Paket je kreiran");
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        toast.error("Već imaš paket sa tim brojem treninga nedeljno");
      } else {
        const message = error instanceof ApiError ? error.message : "Paket nije kreiran.";
        toast.error("Greška", { description: message });
      }
    } finally {
      setCreating(false);
    }
  }

  return (
    <TrainerShell>
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">Moji paketi</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Definiši koliko treninga nedeljno klijent dobija i po kojoj mesečnoj ceni.
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Postojeći paketi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p className="text-sm text-muted-foreground">Učitavanje…</p>
            ) : tiers.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Još nemaš definisan nijedan paket. Napravi prvi sa desne strane.
              </p>
            ) : (
              tiers.map((tier) => (
                <div
                  key={tier.id}
                  className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">
                        {tier.sessionsPerWeek}x nedeljno
                      </p>
                      <Badge variant={tier.active ? "default" : "secondary"}>
                        {tier.active ? "Aktivan" : "Neaktivan"}
                      </Badge>
                    </div>
                    <div className="mt-2">
                      <PriceEditor tier={tier} onSaved={handleTierUpdated} />
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(tier)}
                    disabled={togglingId === tier.id}
                    className="shrink-0"
                  >
                    {tier.active ? (
                      <>
                        <PowerOff className="mr-1.5 h-3.5 w-3.5" />
                        Deaktiviraj
                      </>
                    ) : (
                      <>
                        <Power className="mr-1.5 h-3.5 w-3.5" />
                        Aktiviraj
                      </>
                    )}
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Novi paket</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-5">
              <div className="grid gap-2.5">
                <Label htmlFor="sessionsPerWeek">Treninga nedeljno *</Label>
                <Input
                  id="sessionsPerWeek"
                  type="number"
                  min={1}
                  max={14}
                  value={sessionsPerWeek}
                  onChange={(e) => setSessionsPerWeek(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Ne može se menjati nakon kreiranja paketa.
                </p>
              </div>

              <div className="grid gap-2.5">
                <Label htmlFor="monthlyPrice">Mesečna cena (RSD) *</Label>
                <Input
                  id="monthlyPrice"
                  type="number"
                  min={1}
                  step="0.01"
                  placeholder="npr. 6000"
                  value={monthlyPrice}
                  onChange={(e) => setMonthlyPrice(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={creating}>
                <Plus className="mr-2 h-4 w-4" />
                {creating ? "Kreiram..." : "Kreiraj paket"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </TrainerShell>
  );
}