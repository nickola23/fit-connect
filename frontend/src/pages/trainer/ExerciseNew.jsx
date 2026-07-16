import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { TrainerShell } from "@/components/trainer/TrainerShell";
import { getUser } from "@/lib/auth-storage";
import {
  createTrainerExercise,
  recordExerciseDemoVideo,
  uploadFile,
  getEquipment,
  addExerciseEquipment,
  ApiError,
} from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { ArrowLeft, Plus, X, Dumbbell } from "lucide-react";
import { usePageTitle } from "@/lib/use-page-title";

const schema = z.object({
  name: z.string().trim().min(2, "Naziv mora imati bar 2 karaktera").max(100),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  defaultReps: z.coerce.number().int().min(1, "Bar 1").max(1000),
  defaultSets: z.coerce.number().int().min(1, "Bar 1").max(100),
});

export default function ExerciseNew() {
  usePageTitle("Nova vežba | FitConnect");

  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [equipmentCatalog, setEquipmentCatalog] = useState([]);
  const [loadingEquipment, setLoadingEquipment] = useState(true);
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState([]);
  const [demoVideoFile, setDemoVideoFile] = useState(null);

  useEffect(() => {
    getEquipment()
      .then(setEquipmentCatalog)
      .catch(() => toast.error("Greška pri učitavanju opreme/rekvizita"))
      .finally(() => setLoadingEquipment(false));
  }, []);

  function toggleEquipment(id) {
    setSelectedEquipmentIds((prev) =>
      prev.includes(id) ? prev.filter((eid) => eid !== id) : [...prev, id]
    );
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErrors({});
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      name: fd.get("name"),
      description: fd.get("description"),
      defaultReps: fd.get("defaultReps"),
      defaultSets: fd.get("defaultSets"),
    });
    if (!parsed.success) {
      const es = {};
      for (const issue of parsed.error.issues) es[issue.path.join(".")] = issue.message;
      setErrors(es);
      return;
    }

    const user = getUser();
    if (!user) return;

    setSubmitting(true);
    try {
      const exercise = await createTrainerExercise(user.id, {
        name: parsed.data.name,
        description: parsed.data.description || undefined,
        defaultReps: parsed.data.defaultReps,
        defaultSets: parsed.data.defaultSets,
      });

      if (demoVideoFile) {
        const { url } = await uploadFile(demoVideoFile, "ExerciseDemoVideos");
        await recordExerciseDemoVideo(exercise.id, url);
      }

      if (selectedEquipmentIds.length > 0) {
        await Promise.all(
          selectedEquipmentIds.map((equipmentId) =>
            addExerciseEquipment(exercise.id, equipmentId)
          )
        );
      }

      toast.success("Vežba je kreirana");
      navigate("/trainer");
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Vežba nije kreirana.";
      toast.error("Greška", { description: message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <TrainerShell>
      <Toaster />
      <Link
        to="/trainer"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Nazad
      </Link>

      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Nova vežba</CardTitle>
            <p className="text-sm text-muted-foreground">
              Podaci koji se šalju na POST /api/trainers/{"{id}"}/exercises.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-8">
              <div className="grid gap-2.5">
                <Label htmlFor="name">Naziv vežbe *</Label>
                <Input id="name" name="name" placeholder="npr. Barbell Squat" maxLength={100} required />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>

              <div className="grid gap-2.5">
                <Label htmlFor="description">Opis</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={4}
                  maxLength={1000}
                  placeholder="Kratko uputstvo za izvođenje…"
                />
                {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="grid gap-2.5">
                  <Label htmlFor="defaultSets">Podrazumevane serije *</Label>
                  <Input id="defaultSets" name="defaultSets" type="number" min={1} max={100} defaultValue={3} required />
                  {errors.defaultSets && <p className="text-xs text-destructive">{errors.defaultSets}</p>}
                </div>
                <div className="grid gap-2.5">
                  <Label htmlFor="defaultReps">Podrazumevana ponavljanja *</Label>
                  <Input id="defaultReps" name="defaultReps" type="number" min={1} max={1000} defaultValue={10} required />
                  {errors.defaultReps && <p className="text-xs text-destructive">{errors.defaultReps}</p>}
                </div>
              </div>

              <div className="grid gap-2.5">
                <Label htmlFor="demoVideoFile">Demo video (opciono)</Label>
                <Input
                  id="demoVideoFile"
                  name="demoVideoFile"
                  type="file"
                  accept="video/*"
                  onChange={(e) => setDemoVideoFile(e.target.files?.[0] ?? null)}
                />
              </div>

              <div className="grid gap-2.5">
                <Label>Izabrana oprema/rekviziti</Label>
                {selectedEquipmentIds.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nema izabrane opreme — vežba ne zahteva ništa posebno, ili izaberi iz kataloga sa desne strane.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedEquipmentIds.map((id) => {
                      const item = equipmentCatalog.find((eq) => eq.id === id);
                      if (!item) return null;
                      return (
                        <Badge key={id} variant="secondary" className="flex items-center gap-1 pr-1">
                          {item.name}
                          <button
                            type="button"
                            onClick={() => toggleEquipment(id)}
                            className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 border-t border-border pt-6">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Kreiram..." : "Kreiraj vežbu"}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate("/trainer")}>
                  Otkaži
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="lg:col-span-1">
          <Card className="flex h-[calc(100vh-12rem)] flex-col">
            <CardHeader className="flex-shrink-0">
              <CardTitle className="flex items-center gap-2 text-base">
                <Dumbbell className="h-4 w-4 text-primary" />
                Katalog opreme/rekvizita
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto pr-2">
              {loadingEquipment ? (
                <p className="py-4 text-center text-xs text-muted-foreground">Učitavanje...</p>
              ) : equipmentCatalog.length === 0 ? (
                <p className="py-4 text-center text-xs text-muted-foreground">
                  Nema unetih sprava/rekvizita.
                </p>
              ) : (
                <div className="space-y-2">
                  {equipmentCatalog.map((item) => {
                    const isSelected = selectedEquipmentIds.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-lg border border-border bg-card/50 p-2.5 transition-colors hover:bg-accent/40"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                          {item.type && (
                            <p className="text-xs text-muted-foreground">{item.type}</p>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          disabled={isSelected}
                          onClick={() => toggleEquipment(item.id)}
                          className="h-8 px-2"
                        >
                          {isSelected ? "Dodato" : <Plus className="h-4 w-4" />}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </TrainerShell>
  );
}