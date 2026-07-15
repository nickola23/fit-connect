import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RateExerciseModal } from "@/components/client/RateExerciseModal";
import { listTrainingExercises, ApiError } from "@/lib/api-client";
import { CheckCircle2, Circle, Star, Video, Target } from "lucide-react";

export function TrainingDetailModal({ open, onOpenChange, training }) {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rateExercise, setRateExercise] = useState(null);

  function load() {
    if (!training) return;
    setLoading(true);
    listTrainingExercises(training.id)
      .then(setExercises)
      .catch((error) => {
        const message =
          error instanceof ApiError ? error.message : "Ne mogu da učitam vežbe treninga.";
        toast.error("Greška", { description: message });
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (open) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, training?.id]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {training?.type === "Live" ? (
                <Video className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Target className="h-4 w-4 text-muted-foreground" />
              )}
              Trening — {training && new Date(training.trainingDate).toLocaleDateString("sr-RS")}
            </DialogTitle>
            <DialogDescription>
              Označi svaku odrađenu vežbu i oceni koliko ti je bila teška.
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Učitavanje…</p>
          ) : exercises.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Ovaj trening nema dodatih vežbi.
            </p>
          ) : (
            <div className="divide-y divide-border">
              {exercises.map((ex, index) => (
                <div key={ex.id} className="flex flex-col gap-2 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {ex.completed ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                      ) : (
                        <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                      <p className="font-medium text-foreground">Vežba {index + 1}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {ex.assignedSets} × {ex.assignedReps}
                    </span>
                  </div>

                  {ex.completed ? (
                    <div className="ml-6 flex flex-col gap-1">
                      {ex.difficultyRating != null && (
                        <p className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                          {ex.difficultyRating} / 5
                        </p>
                      )}
                      {ex.clientComment && (
                        <p className="text-sm italic text-muted-foreground">
                          „{ex.clientComment}“
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="ml-6">
                      <Button size="sm" variant="outline" onClick={() => setRateExercise(ex)}>
                        Označi kao odrađeno i oceni
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <RateExerciseModal
        open={!!rateExercise}
        onOpenChange={(o) => !o && setRateExercise(null)}
        exercise={rateExercise}
        onSubmitted={() => {
          setRateExercise(null);
          load();
        }}
      />
    </>
  );
}