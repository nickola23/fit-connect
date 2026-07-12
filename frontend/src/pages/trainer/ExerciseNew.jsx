import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { TrainerShell } from "@/components/trainer/TrainerShell";
import { getUser } from "@/lib/auth-storage";
import { createTrainerExercise, recordExerciseDemoVideo, ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { ArrowLeft } from "lucide-react";
import { usePageTitle } from "@/lib/use-page-title";

const schema = z.object({
  name: z.string().trim().min(2, "Naziv mora imati bar 2 karaktera").max(100),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  defaultReps: z.coerce.number().int().min(1, "Bar 1").max(1000),
  defaultSets: z.coerce.number().int().min(1, "Bar 1").max(100),
  demoVideoUrl: z.string().trim().url("Neispravan URL").optional().or(z.literal("")),
});

export default function ExerciseNew() {
  usePageTitle("Nova vežba | FitConnect");

  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErrors({});
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      name: fd.get("name"),
      description: fd.get("description"),
      defaultReps: fd.get("defaultReps"),
      defaultSets: fd.get("defaultSets"),
      demoVideoUrl: fd.get("demoVideoUrl"),
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

      if (parsed.data.demoVideoUrl) {
        await recordExerciseDemoVideo(exercise.id, parsed.data.demoVideoUrl);
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

      <Card className="mt-4 max-w-3xl">
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
              <Label htmlFor="demoVideoUrl">Demo video URL</Label>
              <Input
                id="demoVideoUrl"
                name="demoVideoUrl"
                type="url"
                placeholder="https://…/demo.mp4"
              />
              {errors.demoVideoUrl && <p className="text-xs text-destructive">{errors.demoVideoUrl}</p>}
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
    </TrainerShell>
  );
}