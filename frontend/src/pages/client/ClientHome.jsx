import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ClientShell } from "@/components/client/ClientShell";
import { getUser } from "@/lib/auth-storage";
import {
  listTrainers,
  listClientCooperations,
  getTrainerById,
  createCooperation,
  ApiError,
} from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, GraduationCap, Send } from "lucide-react";
import { usePageTitle } from "@/lib/use-page-title";

// Saradnja se smatra "aktivnom" (klijent je vezan za jednog trenera) u ovim statusima.
const ACTIVE_STATUSES = ["Pending", "Accepted", "Active"];

export default function ClientHome() {
  usePageTitle("Klijent — Početna | FitConnect");

  const [loading, setLoading] = useState(true);
  const [activeCooperation, setActiveCooperation] = useState(null);
  const [activeTrainer, setActiveTrainer] = useState(null);
  const [trainers, setTrainers] = useState([]);
  const [sendingId, setSendingId] = useState(null);

  const user = getUser();

  function loadData() {
    if (!user) return;
    setLoading(true);

    listClientCooperations(user.id)
      .then(async (cooperations) => {
        const current = cooperations.find((c) => ACTIVE_STATUSES.includes(c.status));

        if (current) {
          const trainer = await getTrainerById(current.trainerId);
          setActiveCooperation(current);
          setActiveTrainer(trainer);
          setTrainers([]);
        } else {
          setActiveCooperation(null);
          setActiveTrainer(null);
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

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSendRequest(trainerId) {
    setSendingId(trainerId);
    try {
      await createCooperation({ trainerId, isFreeTrial: true });
      toast.success("Zahtev je poslat treneru.");
      loadData();
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Greška pri slanju zahteva.";
      toast.error("Greška", { description: message });
    } finally {
      setSendingId(null);
    }
  }

  if (loading)
    return (
      <ClientShell>
        <p className="text-muted-foreground">Učitavanje…</p>
      </ClientShell>
    );

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
            <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
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
            </CardContent>
          </Card>
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
                      disabled={sendingId === trainer.id}
                      onClick={() => handleSendRequest(trainer.id)}
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
    </ClientShell>
  );
}