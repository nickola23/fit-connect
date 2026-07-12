import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { TrainerShell } from "@/components/trainer/TrainerShell";
import { getUser } from "@/lib/auth-storage";
import { getTrainerById, listTrainerExercises, ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Users, Dumbbell, User } from "lucide-react";
import { usePageTitle } from "@/lib/use-page-title";

export default function TrainerHome() {
  usePageTitle("Trener — Početna | FitConnect");

  const [trainer, setTrainer] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getUser();
    if (!user) return;

    let cancelled = false;
    setLoading(true);

    Promise.all([getTrainerById(user.id), listTrainerExercises(user.id)])
      .then(([trainerData, exercisesData]) => {
        if (cancelled) return;
        setTrainer(trainerData);
        setExercises(exercisesData);
      })
      .catch((error) => {
        if (cancelled) return;
        const message =
          error instanceof ApiError ? error.message : "Ne mogu da učitam podatke o treneru.";
        toast.error("Greška pri učitavanju", { description: message });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading || !trainer)
    return (
      <TrainerShell>
        <p className="text-muted-foreground">Učitavanje…</p>
      </TrainerShell>
    );

  const statusVariant =
    trainer.registrationStatus === "Approved"
      ? "default"
      : trainer.registrationStatus === "Pending"
      ? "secondary"
      : "destructive";

  return (
    <TrainerShell>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Dobrodošao nazad,</p>
          <h1 className="font-display text-3xl font-bold text-foreground">{trainer.name}</h1>
        </div>
        <Badge variant={statusVariant}>Status: {trainer.registrationStatus}</Badge>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Prosečna ocena</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {trainer.averageRating != null ? trainer.averageRating.toFixed(1) : "—"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Broj recenzija</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trainer.reviewCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Moje vežbe</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exercises.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Poslednje dodate vežbe</CardTitle>
          </CardHeader>
          <CardContent>
            {exercises.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                Još uvek nemaš dodatih vežbi.
                <div className="mt-3">
                  <Button asChild size="sm">
                    <Link to="/trainer/exercises/new">Dodaj prvu vežbu</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {exercises.slice(0, 5).map((ex) => (
                  <li key={ex.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-foreground">{ex.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {ex.defaultSets} × {ex.defaultReps}
                      </p>
                    </div>
                    {ex.demoVideoUrl && <Badge variant="outline">Video</Badge>}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Brze akcije</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button asChild>
              <Link to="/trainer/exercises/new">
                <Dumbbell className="mr-2 h-4 w-4" /> Nova vežba
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/trainer/profile">
                <User className="mr-2 h-4 w-4" /> Moj profil
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </TrainerShell>
  );
}