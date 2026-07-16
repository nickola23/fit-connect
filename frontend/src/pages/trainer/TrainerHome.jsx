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
  recordCooperationPayment,
  listCooperationPayments,
  listCooperationTrainings,
  listTrainingExercises,
  completeTraining,
  markTrainingMissed,
  getTrainingReview,
  listExerciseEquipment,
  ApiError,
} from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Star,
  Users,
  Dumbbell,
  User,
  Check,
  X,
  CalendarPlus,
  Ban,
  CreditCard,
  History,
  Video,
  Target,
} from "lucide-react";
import { RateTrainingModal } from "@/components/trainer/RateTrainingModal";
import { usePageTitle } from "@/lib/use-page-title";

const TRAINING_STATUS_VARIANT = {
  Scheduled: "secondary",
  Completed: "default",
  Missed: "destructive",
};

function TrainingHistoryModal({ open, onOpenChange, cooperationId, clientName, exerciseCatalog }) {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [exerciseNamesByTraining, setExerciseNamesByTraining] = useState({});
  const [reviewsByTraining, setReviewsByTraining] = useState({});
  const [rateTarget, setRateTarget] = useState(null);

  function loadExerciseNames(trainingsList) {
    trainingsList.forEach((t) => {
      listTrainingExercises(t.id)
        .then((items) => {
          const names = items.map(
            (item) => exerciseCatalog?.get(item.exerciseId) || "Nepoznata vežba"
          );
          setExerciseNamesByTraining((prev) => ({ ...prev, [t.id]: names }));
        })
        .catch(() => {
          setExerciseNamesByTraining((prev) => ({ ...prev, [t.id]: [] }));
        });
    });
  }

  function loadReviewStatus(trainingsList) {
    const completed = trainingsList.filter((t) => t.status === "Completed");
    completed.forEach((t) => {
      getTrainingReview(t.id)
        .then((review) => {
          setReviewsByTraining((prev) => ({ ...prev, [t.id]: review }));
        })
        .catch(() => {
          // no review yet (404) — leave unmarked
        });
    });
  }

  function load() {
    if (!cooperationId) return;
    setLoading(true);
    listCooperationTrainings(cooperationId)
      .then((data) => {
        const sorted = data.sort((a, b) => (a.trainingDate < b.trainingDate ? 1 : -1));
        setTrainings(sorted);
        loadExerciseNames(sorted);
        loadReviewStatus(sorted);
      })
      .catch((error) => {
        const message =
          error instanceof ApiError ? error.message : "Ne mogu da učitam istoriju treninga.";
        toast.error("Greška", { description: message });
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (open) load();
  }, [open, cooperationId]);

  async function handleComplete(id) {
    setBusyId(id);
    try {
      await completeTraining(id);
      toast.success("Trening je označen kao odrađen.");
      load();
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Greška pri označavanju treninga.";
      toast.error("Greška", { description: message });
    } finally {
      setBusyId(null);
    }
  }

  async function handleMissed(id) {
    setBusyId(id);
    try {
      await markTrainingMissed(id);
      toast.success("Trening je označen kao propušten.");
      load();
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Greška pri označavanju treninga.";
      toast.error("Greška", { description: message });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Istorija treninga — {clientName}</DialogTitle>
          <DialogDescription>Svi treninzi dodeljeni ovom klijentu.</DialogDescription>
        </DialogHeader>

        {loading ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Učitavanje…</p>
        ) : trainings.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Još uvek nema dodeljenih treninga.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {trainings.map((t) => (
              <div key={t.id} className="flex flex-col gap-2 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {t.type === "Live" ? (
                      <Video className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Target className="h-4 w-4 text-muted-foreground" />
                    )}
                    <p className="font-medium text-foreground">
                      {new Date(t.trainingDate).toLocaleDateString("sr-RS")}
                    </p>
                    <Badge variant="outline">{t.type === "Live" ? "Uživo" : "Zadati"}</Badge>
                  </div>
                  <Badge variant={TRAINING_STATUS_VARIANT[t.status] || "outline"}>
                    {t.status === "Completed"
                      ? "Odrađen"
                      : t.status === "Missed"
                      ? "Propušten"
                      : "Zakazan"}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground">
                  {exerciseNamesByTraining[t.id] === undefined
                    ? "Učitavanje vežbi…"
                    : exerciseNamesByTraining[t.id].length === 0
                    ? "Nema vežbi"
                    : exerciseNamesByTraining[t.id].join(", ")}
                </p>

                {t.status === "Scheduled" && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busyId === t.id}
                      onClick={() => handleComplete(t.id)}
                    >
                      <Check className="mr-1 h-4 w-4" /> Označi odrađeno
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busyId === t.id}
                      onClick={() => handleMissed(t.id)}
                    >
                      <X className="mr-1 h-4 w-4" /> Označi propušteno
                    </Button>
                  </div>
                )}

                {t.status === "Completed" && (
                  <div className="flex flex-col gap-1">
                    {reviewsByTraining[t.id] ? (
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="shrink-0">
                          <Star className="mr-1 h-3 w-3" /> Ocenjeno · {reviewsByTraining[t.id].rating}/5
                        </Badge>
                        {reviewsByTraining[t.id].comment && (
                          <p className="text-sm text-muted-foreground">
                            {reviewsByTraining[t.id].comment}
                          </p>
                        )}
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => setRateTarget(t)}>
                        <Star className="mr-1 h-4 w-4" /> Oceni trening
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
      </Dialog>

      <RateTrainingModal
        open={!!rateTarget}
        onOpenChange={(open) => !open && setRateTarget(null)}
        training={rateTarget}
        clientName={clientName}
        onSubmitted={(review) => {
          if (rateTarget) {
            setReviewsByTraining((prev) => ({
              ...prev,
              [rateTarget.id]: review || { rating: null, comment: null },
            }));
          }
          setRateTarget(null);
        }}
      />
    </>
  );
}

const COOPERATION_SECTIONS = [
  { status: "Pending", title: "Zahtevi na čekanju" },
  { status: "Accepted", title: "Prihvaćeni" },
  { status: "Active", title: "Aktivni klijenti" },
  { status: "Ended", title: "Završene saradnje" },
];

function CooperationCard({ cooperation, onAccept, onReject, onEnd, onRequestPayment, onShowHistory, isPaid, busy }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 pt-6">
        <div className="flex items-center justify-between">
          <p className="font-medium text-foreground">
            {cooperation.clientName || `Klijent #${cooperation.clientId.slice(0, 8)}`}
          </p>
          <Badge variant="outline">{cooperation.status}</Badge>
        </div>
        {cooperation.clientGoal && (
          <p className="text-sm text-muted-foreground">Cilj: {cooperation.clientGoal}</p>
        )}
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

          {cooperation.status === "Accepted" && !cooperation.isFreeTrial && !isPaid && (
            <Button size="sm" disabled={busy} onClick={() => onRequestPayment(cooperation.id)}>
              <CreditCard className="mr-1 h-4 w-4" /> Zabeleži uplatu
            </Button>
          )}

          {cooperation.status !== "Pending" && cooperation.status !== "Rejected" && (
            <Button size="sm" variant="outline" onClick={() => onShowHistory(cooperation)}>
              <History className="mr-1 h-4 w-4" /> Istorija treninga
            </Button>
          )}

          {(cooperation.status === "Accepted" || cooperation.status === "Active") && (
            <Button size="sm" variant="outline" disabled={busy} onClick={() => onEnd(cooperation.id)}>
              <Ban className="mr-1 h-4 w-4" /> Prekini saradnju
            </Button>
          )}

          {(cooperation.status === "Active" ||
            (cooperation.status === "Accepted" && (cooperation.isFreeTrial || isPaid))) && (
            <Button asChild size="sm" variant="outline" className="w-full">
              <Link 
                to="/trainer/trainings/new" 
                state={{ 
                  cooperationId: cooperation.id, 
                  clientName: cooperation.clientName || cooperation.client?.name || "Klijent" 
                }}
              >
                <CalendarPlus className="mr-2 h-4 w-4" />
                Kreiraj trening
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
  const [paidCooperationIds, setPaidCooperationIds] = useState(() => new Set());
  const [checkingPayments, setCheckingPayments] = useState(false);
  const [historyTarget, setHistoryTarget] = useState(null); // { id, clientName } | null
  const [equipmentByExercise, setEquipmentByExercise] = useState({});

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

  useEffect(() => {
    const shown = exercises.slice(0, 5);
    if (shown.length === 0) return;

    let cancelled = false;

    Promise.all(
      shown.map((ex) =>
        listExerciseEquipment(ex.id)
          .then((items) => [ex.id, items])
          .catch(() => [ex.id, []])
      )
    ).then((results) => {
      if (cancelled) return;
      setEquipmentByExercise((prev) => {
        const next = { ...prev };
        results.forEach(([id, items]) => {
          next[id] = items;
        });
        return next;
      });
    });

    return () => {
      cancelled = true;
    };
  }, [exercises]);

  useEffect(() => {
    const candidates = cooperations.filter(
      (c) => c.status === "Accepted" && !c.isFreeTrial
    );
    if (candidates.length === 0) return;

    let cancelled = false;
    setCheckingPayments(true);

    Promise.all(
      candidates.map((c) =>
        listCooperationPayments(c.id)
          .then((payments) => [c.id, payments.length > 0])
          .catch(() => [c.id, false])
      )
    )
      .then((results) => {
        if (cancelled) return;
        setPaidCooperationIds((prev) => {
          const next = new Set(prev);
          results.forEach(([id, isPaid]) => {
            if (isPaid) next.add(id);
            else next.delete(id);
          });
          return next;
        });
      })
      .finally(() => {
        if (!cancelled) setCheckingPayments(false);
      });

    return () => {
      cancelled = true;
    };
  }, [cooperations]);

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

  async function handleRequestPayment(id) {
    setBusyId(id);
    try {
      await recordCooperationPayment(id);
      toast.success("Uplata je zabeležena.");
      loadCooperations();
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Greška pri beleženju uplate.";
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
                  <li key={ex.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">{ex.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {ex.defaultSets} × {ex.defaultReps}
                      </p>
                      {equipmentByExercise[ex.id]?.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {equipmentByExercise[ex.id].map((eq) => (
                            <Badge key={eq.id} variant="secondary" className="text-xs">
                              {eq.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    {ex.demoVideoUrl && (
                      <Badge variant="outline" className="shrink-0">
                        Video
                      </Badge>
                    )}
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
                    onRequestPayment={handleRequestPayment}
                    onShowHistory={(coop) =>
                      setHistoryTarget({
                        id: coop.id,
                        clientName: coop.clientName || coop.client?.name || "Klijent",
                      })
                    }
                    isPaid={paidCooperationIds.has(c.id)}
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

      <TrainingHistoryModal
        open={!!historyTarget}
        onOpenChange={(open) => !open && setHistoryTarget(null)}
        cooperationId={historyTarget?.id}
        clientName={historyTarget?.clientName}
        exerciseCatalog={new Map(exercises.map((ex) => [ex.id, ex.name]))}
      />
    </TrainerShell>
  );
}