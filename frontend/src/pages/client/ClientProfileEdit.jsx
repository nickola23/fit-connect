import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { ClientShell } from "@/components/client/ClientShell";
import { getUser } from "@/lib/auth-storage";
import {
  getClientById,
  updateClientById,
  listClientHealthRecords,
  createHealthRecord,
  ApiError,
} from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { ArrowLeft } from "lucide-react";
import { usePageTitle } from "@/lib/use-page-title";

// Opcije izvučene direktno iz registracije
const GOAL_OPTIONS = [
  { value: "Weight loss", label: "Mršavljenje" },
  { value: "Muscle gain", label: "Mišićna masa" },
  { value: "Strength", label: "Snaga" },
  { value: "Endurance", label: "Kondicija / izdržljivost" },
  { value: "Mobility", label: "Mobilnost i fleksibilnost" },
  { value: "Rehabilitation", label: "Rehabilitacija" },
  { value: "Nutrition", label: "Ishrana" },
  { value: "General health", label: "Opšte zdravlje" },
];

const TRAINING_LOCATIONS = [
  { value: "Gym", label: "Teretana" },
  { value: "Home", label: "Kuća" },
];

const schema = z.object({
  name: z.string().trim().min(2, "Ime mora imati bar 2 karaktera").max(100),
  email: z.string().trim().email("Neispravan email").max(255),
  goal: z.string().min(1, "Izaberi cilj"),
  trainingLocation: z.string().optional().or(z.literal("")),
});

const healthRecordSchema = z
  .object({
    weight: z.coerce.number().positive("Mora biti pozitivan broj").optional().or(z.literal("").transform(() => undefined)),
    height: z.coerce.number().positive("Mora biti pozitivan broj").optional().or(z.literal("").transform(() => undefined)),
    healthCondition: z.string().trim().max(1000).optional().or(z.literal("").transform(() => undefined)),
  })
  .refine((data) => data.weight != null || data.height != null || data.healthCondition, {
    message: "Unesi bar jedno polje (težinu, visinu ili zdravstveno stanje)",
    path: ["_form"],
  });

export default function ClientProfileEdit() {
  usePageTitle("Izmena profila | FitConnect");

  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [errors, setErrors] = useState({});
  const [goal, setGoal] = useState("");
  const [trainingLocation, setTrainingLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [healthErrors, setHealthErrors] = useState({});
  const [healthSubmitting, setHealthSubmitting] = useState(false);
  const [latestHealthRecord, setLatestHealthRecord] = useState(null);

  useEffect(() => {
    const user = getUser();
    if (!user) return;

    getClientById(user.id)
      .then((c) => {
        setClient(c);
        setGoal(c.goal || "");
        setTrainingLocation(c.trainingLocation || "");
      })
      .catch((error) => {
        const message =
          error instanceof ApiError ? error.message : "Ne mogu da učitam profil.";
        toast.error("Greška pri učitavanju", { description: message });
      });

    listClientHealthRecords(user.id)
      .then((records) => {
        if (records.length === 0) return;
        const latest = [...records].sort((a, b) => (a.recordDate < b.recordDate ? 1 : -1))[0];
        setLatestHealthRecord(latest);
      })
      .catch(() => {
        // tiho ignorišemo — forma će samo biti prazna
      });
  }, []);

  if (!client)
    return (
      <ClientShell>
        <p className="text-muted-foreground">Učitavanje…</p>
      </ClientShell>
    );

  function onSubmit(e) {
    e.preventDefault();
    setErrors({});
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      name: fd.get("name"),
      email: fd.get("email"),
      goal,
      trainingLocation,
    });

    if (!parsed.success) {
      const es = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]?.toString() ?? "_";
        if (!es[key]) es[key] = issue.message;
      }
      setErrors(es);
      return;
    }

    setSubmitting(true);
    updateClientById(client.id, {
      name: parsed.data.name,
      email: parsed.data.email,
      language: "sr", // Jezik je uvek "sr"
      goal: parsed.data.goal,
      trainingLocation: parsed.data.trainingLocation || undefined,
    })
      .then(() => {
        toast.success("Profil je uspešno sačuvan");
        navigate("/client/profile");
      })
      .catch((error) => {
        const message =
          error instanceof ApiError ? error.message : "Izmene nisu sačuvane.";
        toast.error("Greška", { description: message });
      })
      .finally(() => setSubmitting(false));
  }

  function onHealthRecordSubmit(e) {
    e.preventDefault();
    setHealthErrors({});
    const fd = new FormData(e.currentTarget);
    const parsed = healthRecordSchema.safeParse({
      weight: fd.get("weight"),
      height: fd.get("height"),
      healthCondition: fd.get("healthCondition"),
    });

    if (!parsed.success) {
      const es = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]?.toString() ?? "_form";
        if (!es[key]) es[key] = issue.message;
      }
      setHealthErrors(es);
      return;
    }

    setHealthSubmitting(true);
    createHealthRecord(client.id, parsed.data)
      .then(() => {
        toast.success("Zdravstveni podaci su sačuvani");
        navigate("/client/profile");
      })
      .catch((error) => {
        const message =
          error instanceof ApiError ? error.message : "Zapis nije sačuvan.";
        toast.error("Greška", { description: message });
      })
      .finally(() => setHealthSubmitting(false));
  }

  return (
    <ClientShell>
      <Toaster />
      <Link
        to="/client/profile"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Nazad na profil
      </Link>

      <Card className="mt-4 max-w-3xl">
        <CardHeader>
          <CardTitle>Izmeni profil klijenta</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-8">
            <div className="grid gap-2.5">
              <Label htmlFor="name">Ime i prezime *</Label>
              <Input id="name" name="name" defaultValue={client.name} maxLength={100} required />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            <div className="grid gap-2.5">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" name="email" type="email" defaultValue={client.email} maxLength={255} required />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="grid gap-2.5">
              <Label htmlFor="goal">
                Cilj <span className="text-destructive">*</span>
              </Label>
              <Select value={goal} onValueChange={setGoal}>
                <SelectTrigger aria-invalid={!!errors.goal}>
                  <SelectValue placeholder="Izaberi cilj" />
                </SelectTrigger>
                <SelectContent>
                  {GOAL_OPTIONS.map((g) => (
                    <SelectItem key={g.value} value={g.value}>
                      {g.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.goal && <p className="text-xs text-destructive">{errors.goal}</p>}
            </div>

            <div className="grid gap-2.5">
              <Label htmlFor="trainingLocation">Način vežbanja (opciono)</Label>
              <Select value={trainingLocation} onValueChange={setTrainingLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Izaberi" />
                </SelectTrigger>
                <SelectContent>
                  {TRAINING_LOCATIONS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3 border-t border-border pt-6">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Čuvam..." : "Sačuvaj izmene"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/client/profile")}>
                Otkaži
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-6 max-w-3xl">
        <CardHeader>
          <CardTitle>Novi zdravstveni zapis</CardTitle>
          <p className="text-sm text-muted-foreground">
            Ovo dodaje novi unos u istoriju — stari zapisi ostaju sačuvani i vidljivi na profilu.
          </p>
        </CardHeader>
        <CardContent>
          <form key={latestHealthRecord?.id || "empty"} onSubmit={onHealthRecordSubmit} className="space-y-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="grid gap-2.5">
                <Label htmlFor="weight">Težina (kg)</Label>
                <Input
                  id="weight"
                  name="weight"
                  type="number"
                  step="0.1"
                  min="0"
                  defaultValue={latestHealthRecord?.weight ?? ""}
                  placeholder="npr. 78.5"
                />
                {healthErrors.weight && <p className="text-xs text-destructive">{healthErrors.weight}</p>}
              </div>
              <div className="grid gap-2.5">
                <Label htmlFor="height">Visina (cm)</Label>
                <Input
                  id="height"
                  name="height"
                  type="number"
                  step="0.1"
                  min="0"
                  defaultValue={latestHealthRecord?.height ?? ""}
                  placeholder="npr. 180"
                />
                {healthErrors.height && <p className="text-xs text-destructive">{healthErrors.height}</p>}
              </div>
            </div>

            <div className="grid gap-2.5">
              <Label htmlFor="healthCondition">Zdravstveno stanje</Label>
              <Textarea
                id="healthCondition"
                name="healthCondition"
                rows={4}
                maxLength={1000}
                defaultValue={latestHealthRecord?.healthCondition ?? ""}
                placeholder="Npr. povreda kolena, alergije, ograničenja u vežbanju…"
              />
              {healthErrors.healthCondition && (
                <p className="text-xs text-destructive">{healthErrors.healthCondition}</p>
              )}
            </div>

            {healthErrors._form && (
              <p className="text-xs text-destructive">{healthErrors._form}</p>
            )}

            <div className="flex items-center gap-3 border-t border-border pt-6">
              <Button type="submit" disabled={healthSubmitting}>
                {healthSubmitting ? "Čuvam..." : "Sačuvaj zdravstveni zapis"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </ClientShell>
  );
}