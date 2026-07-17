import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ClientShell } from "@/components/client/ClientShell";
import { SendRequestModal } from "@/components/client/SendRequestModal";
import { ReviewTrainerModal } from "@/components/client/ReviewTrainerModal";
import { PaymentHistoryModal } from "@/components/client/PaymentHistoryModal";
import { TrainingDetailModal } from "@/components/client/TrainingDetailModal";
import { getUser } from "@/lib/auth-storage";
import {
  listTrainers,
  listClientCooperations,
  getClientById,
  getTrainerById,
  endCooperation,
  listCooperationTrainings,
  completeTraining,
  ApiError,
} from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  Star,
  GraduationCap,
  Send,
  Receipt,
  MessageSquarePlus,
  XCircle,
  Video,
  Target,
  Check,
} from "lucide-react";
import { usePageTitle } from "@/lib/use-page-title";

// Saradnja se smatra "aktivnom" (klijent je vezan za jednog trenera) u ovim statusima.
const ACTIVE_STATUSES = ["Pending", "Accepted", "Active"];
// Akcije (plaćanje/recenzija/prekid) imaju smisla tek kad trener prihvati saradnju.
const ACTIONABLE_STATUSES = ["Accepted", "Active"];

const TRAINING_STATUS_VARIANT = {
  Scheduled: "secondary",
  Completed: "default",
  Missed: "destructive",
};

export default function ClientHome() {
  usePageTitle("Klijent — Početna | FitConnect");

  const [loading, setLoading] = useState(true);
  const [activeCooperation, setActiveCooperation] = useState(null);
  const [activeTrainer, setActiveTrainer] = useState(null);
  const [trainers, setTrainers] = useState([]);
  const [hasUsedFreeTrial, setHasUsedFreeTrial] = useState(false);
  const [requestTrainer, setRequestTrainer] = useState(null);

  const [trainings, setTrainings] = useState([]);
  const [trainingsLoading, setTrainingsLoading] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [completingId, setCompletingId] = useState(null);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showPaymentsModal, setShowPaymentsModal] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [ending, setEnding] = useState(false);

  const user = getUser();

  function loadData() {
    if (!user) return;
    setLoading(true);

    Promise.all([listClientCooperations(user.id), getClientById(user.id)])
      .then(async ([cooperations, client]) => {
        setHasUsedFreeTrial(client.freeTrialUsed);

        const current = cooperations.find((c) => ACTIVE_STATUSES.includes(c.status));

        if (current) {
          const trainer = await getTrainerById(current.trainerId);
          setActiveCooperation(current);
          setActiveTrainer(trainer);
          setTrainers([]);
          loadTrainings(current.id);
        } else {
          setActiveCooperation(null);
          setActiveTrainer(null);
          setTrainings([]);
          const trainerList = await listTrainers({ sortBy: "AverageRating" });
          setTrainers(
            Array.isArray(trainerList)
              ? trainerList
              : trainerList?.items ?? trainerList?.data ?? trainerList?.results ?? []
          );
        }
      })
      .catch((error) => {
        const message =
          error instanceof ApiError ? error.message : "Ne mogu da učitam podatke.";
        toast.error("Greška pri učitavanju", { description: message });
      })
      .finally(() => setLoading(false));
  }

  function loadTrainings(cooperationId) {
    setTrainingsLoading(true);
    listCooperationTrainings(cooperationId)
      .then((data) => {
        const sorted = [...data].sort((a, b) => (a.trainingDate < b.trainingDate ? 1 : -1));
        setTrainings(sorted);
      })
      .catch((error) => {
        const message =
          error instanceof ApiError ? error.message : "Ne mogu da učitam treninge.";
        toast.error("Greška pri učitavanju", { description: message });
      })
      .finally(() => setTrainingsLoading(false));
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleEndCooperation() {
    if (!activeCooperation) return;
    setEnding(true);
    try {
      await endCooperation(activeCooperation.id);
      toast.success("Saradnja je prekinuta");
      setShowEndConfirm(false);
      loadData();
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Nije uspelo prekidanje saradnje.";
      toast.error("Greška", { description: message });
    } finally {
      setEnding(false);
    }
  }

  async function handleCompleteTraining(e, training) {
    e.stopPropagation(); // ne otvaraj detalje treninga, samo završi ga
    setCompletingId(training.id);
    try {
      await completeTraining(training.id);
      toast.success("Trening je označen kao odrađen.");
      if (activeCooperation) loadTrainings(activeCooperation.id);
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Nije uspelo završavanje treninga.";
      toast.error("Greška", { description: message });
    } finally {
      setCompletingId(null);
    }
  }

  if (loading)
    return (
      <ClientShell>
        <p className="text-muted-foreground">Učitavanje…</p>
      </ClientShell>
    );

  const canManage = activeCooperation && ACTIONABLE_STATUSES.includes(activeCooperation.status);

  return (
    <ClientShell>
      <div>
        <p className="text-sm text-muted-foreground">Dobrodošao nazad,</p>
        <h1 className="font-display text-3xl font-bold text-foreground">{user?.name}</h1>
      </div>

      {activeCooperation && activeTrainer ? (
        <div className="mt-8">
          <h2 className="mb-3 font-display text-lg font-semibold text-foreground">Tvoj trener</h2>
          <Card>
            <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-display text-xl font-bold text-foreground">{activeTrainer.name}</p>
                  <Badge variant={activeCooperation.status === "Active" ? "default" : "secondary"}>
                    {activeCooperation.status}
                  </Badge>
                </div>
                {activeTrainer.education && (
                  <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <GraduationCap className="h-4 w-4" /> {activeTrainer.education}
                  </p>
                )}
                {activeTrainer.bio && (
                  <p className="mt-2 max-w-xl text-sm text-muted-foreground">{activeTrainer.bio}</p>
                )}
                <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="h-4 w-4" />
                  {activeTrainer.averageRating != null ? activeTrainer.averageRating.toFixed(1) : "—"}
                  <span className="text-xs">({activeTrainer.reviewCount} recenzija)</span>
                </p>
                {activeCooperation.status === "Pending" && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Čeka se odgovor trenera na tvoj zahtev.
                  </p>
                )}
              </div>

              {canManage && (
                <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowPaymentsModal(true)}
                  >
                    <Receipt className="mr-2 h-4 w-4" />
                    Istorija plaćanja
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowReviewModal(true)}
                  >
                    <MessageSquarePlus className="mr-2 h-4 w-4" />
                    Ostavi recenziju
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowEndConfirm(true)}
                    className="text-destructive hover:text-destructive"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Prekini saradnju
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-8">
            <h2 className="mb-3 font-display text-lg font-semibold text-foreground">
              Tvoji treninzi
            </h2>
            {trainingsLoading ? (
              <p className="text-sm text-muted-foreground">Učitavanje…</p>
            ) : trainings.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                Trener ti još uvek nije dodelio nijedan trening.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {trainings.map((training) => (
                  <Card
                    key={training.id}
                    className="cursor-pointer transition-colors hover:border-primary"
                    onClick={() => setSelectedTraining(training)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center justify-between text-base">
                        <span className="flex items-center gap-2">
                          {training.type === "Live" ? (
                            <Video className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Target className="h-4 w-4 text-muted-foreground" />
                          )}
                          {new Date(training.trainingDate).toLocaleDateString("sr-RS")}
                        </span>
                        <Badge variant={TRAINING_STATUS_VARIANT[training.status] || "secondary"}>
                          {training.status}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {training.type === "Live" ? "Uživo" : "Zadat trening"}
                      </p>
                      {training.status === "Scheduled" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-3 w-full"
                          onClick={(e) => handleCompleteTraining(e, training)}
                          disabled={completingId === training.id}
                        >
                          <Check className="mr-1 h-4 w-4" />
                          {completingId === training.id ? "Čuvam..." : "Označi odrađeno"}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-8">
          <h2 className="mb-3 font-display text-lg font-semibold text-foreground">
            Pronađi svog trenera
          </h2>
          {trainers.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Trenutno nema dostupnih trenera.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {trainers.map((trainer) => (
                <Card key={trainer.id} className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-base">{trainer.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col gap-3">
                    {trainer.education && (
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <GraduationCap className="h-3.5 w-3.5 shrink-0" /> {trainer.education}
                      </p>
                    )}
                    <p className="line-clamp-3 text-sm text-muted-foreground">
                      {trainer.bio || "Trener još nije dodao opis."}
                    </p>
                    <p className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="h-4 w-4" />
                      {trainer.averageRating != null ? trainer.averageRating.toFixed(1) : "—"}
                      <span className="text-xs">({trainer.reviewCount})</span>
                    </p>
                    <Button
                      size="sm"
                      className="mt-auto"
                      onClick={() => setRequestTrainer(trainer)}
                    >
                      <Send className="mr-2 h-4 w-4" /> Pošalji zahtev
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      <SendRequestModal
        open={!!requestTrainer}
        onOpenChange={(open) => !open && setRequestTrainer(null)}
        trainer={requestTrainer}
        hasFreeTrialAvailable={!hasUsedFreeTrial}
        onSent={() => {
          setRequestTrainer(null);
          loadData();
        }}
      />

      {activeTrainer && (
        <ReviewTrainerModal
          open={showReviewModal}
          onOpenChange={setShowReviewModal}
          trainer={activeTrainer}
        />
      )}

      {activeCooperation && (
        <PaymentHistoryModal
          open={showPaymentsModal}
          onOpenChange={setShowPaymentsModal}
          cooperationId={activeCooperation.id}
        />
      )}

      <TrainingDetailModal
        open={!!selectedTraining}
        onOpenChange={(open) => !open && setSelectedTraining(null)}
        training={selectedTraining}
      />

      <AlertDialog open={showEndConfirm} onOpenChange={setShowEndConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Prekinuti saradnju sa {activeTrainer?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Ova akcija je trajna. Moći ćeš ponovo da pošalješ zahtev nekom treneru, ali ova
              saradnja se ne može nastaviti.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Otkaži</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEndCooperation}
              disabled={ending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {ending ? "Prekidam..." : "Prekini saradnju"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ClientShell>
  );
}