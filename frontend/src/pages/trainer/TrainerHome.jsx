import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { TrainerShell } from "@/components/trainer/TrainerShell";
import { getUser } from "@/lib/auth-storage";
import {
  getTrainerById,
  listTrainerExercises,
  listTrainerCooperations,
  acceptCooperation,
  rejectCooperation,
  endCooperation,
  ApiError,
} from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Users, Dumbbell, User, Check, X, CalendarPlus, Ban } from "lucide-react";
import { usePageTitle } from "@/lib/use-page-title";

const COOPERATION_SECTIONS = [
  { status: "Pending", title: "Zahtevi na čekanju" },
  { status: "Accepted", title: "Prihvaćeni" },
  { status: "Active", title: "Aktivni klijenti" },
  { status: "Ended", title: "Završene saradnje" },
];

function CooperationCard({ cooperation, onAccept, onReject, onEnd, busy }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 pt-6">
        <div className="flex items-center justify-between">
          <p className="font-medium text-foreground">
            Klijent #{cooperation.clientId.slice(0, 8)}
          </p>
          <Badge variant="outline">{cooperation.status}</Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Zahtev poslat: {new Date(cooperation.requestDate).toLocaleDateString("sr-RS")}
          {cooperation.isFreeTrial && " · Besplatni probni termin"}
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          {cooperation.status === "Pending" && (
            <>
              <Button size="sm" disabled={busy} onClick={() => onAccept(cooperation.id)}>
                <Check className="mr-1 h-4 w-4" /> Prihvati
              </Button>
              <Button size="sm" variant="outline" disabled={busy} onClick={() => onReject(cooperation.id)}>
                <X className="mr-1 h-4 w-4" /> Odbij
              </Button>
            </>
          )}

          {(cooperation.status === "Accepted" || cooperation.status === "Active") && (
            <Button size="sm" variant="outline" disabled={busy} onClick={() => onEnd(cooperation.id)}>
              <Ban className="mr-1 h-4 w-4" /> Prekini saradnju
            </Button>
          )}

          {cooperation.status === "Active" && (
            <Button size="sm" asChild>
              <Link to={`/trainer/cooperations/${cooperation.id}/trainings/new`}>
                <CalendarPlus className="mr-1 h-4 w-4" /> Kreiraj trening
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function TrainerHome() {
  usePageTitle("Trener — Početna | FitConnect");

  const [trainer, setTrainer] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [cooperations, setCooperations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const user = getUser();

  function loadCooperations() {
    if (!user) return;
    listTrainerCooperations(user.id)
      .then(setCooperations)
      .catch((error) => {
        const message =
          error instanceof ApiError ? error.message : "Ne mogu da učitam zahteve klijenata.";
        toast.error("Greška pri učitavanju zahteva", { description: message });
      });
  }

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    setLoading(true);

    Promise.all([getTrainerById(user.id), listTrainerExercises(user.id), listTrainerCooperations(user.id)])
      .then(([trainerData, exercisesData, cooperationsData]) => {
        if (cancelled) return;
        setTrainer(trainerData);
        setExercises(exercisesData);
        setCooperations(cooperationsData);
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

  async function handleAccept(id) {
    setBusyId(id);
    try {
      await acceptCooperation(id);
      toast.success("Zahtev je prihvaćen.");
      loadCooperations();
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Greška pri prihvatanju zahteva.";
      toast.error("Greška", { description: message });
    } finally {
      setBusyId(null);
    }
  }

  async function handleReject(id) {
    setBusyId(id);
    try {
      await rejectCooperation(id);
      toast.success("Zahtev je odbijen.");
      loadCooperations();
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Greška pri odbijanju zahteva.";
      toast.error("Greška", { description: message });
    } finally {
      setBusyId(null);
    }
  }

  async function handleEnd(id) {
    setBusyId(id);
    try {
      await endCooperation(id);
      toast.success("Saradnja je prekinuta.");
      loadCooperations();
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Greška pri prekidu saradnje.";
      toast.error("Greška", { description: message });
    } finally {
      setBusyId(null);
    }
  }

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

      <div className="mt-10 flex flex-col gap-8">
        {COOPERATION_SECTIONS.map(({ status, title }) => {
          const items = cooperations.filter((c) => c.status === status);
          if (items.length === 0) return null;
          return (
            <div key={status}>
              <h2 className="mb-3 font-display text-lg font-semibold text-foreground">{title}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((c) => (
                  <CooperationCard
                    key={c.id}
                    cooperation={c}
                    busy={busyId === c.id}
                    onAccept={handleAccept}
                    onReject={handleReject}
                    onEnd={handleEnd}
                  />
                ))}
              </div>
            </div>
          );
        })}
        {cooperations.length === 0 && (
          <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Još uvek nema zahteva klijenata.
          </div>
        )}
      </div>
    </TrainerShell>
  );
}