import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { markTrainingExerciseComplete, ApiError } from "@/lib/api-client";

export function RateExerciseModal({ open, onOpenChange, exercise, onSubmitted }) {
  const [rating, setRating] = useState(3);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setRating(exercise?.difficultyRating || 3);
      setComment(exercise?.clientComment || "");
    }
  }, [open, exercise]);

  async function handleSubmit() {
    if (!exercise) return;
    setSubmitting(true);
    try {
      await markTrainingExerciseComplete(exercise.id, {
        difficultyRating: rating,
        comment: comment.trim() || undefined,
      });
      toast.success("Vežba je označena kao odrađena");
      onOpenChange(false);
      onSubmitted?.();
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Vežba nije sačuvana.";
      toast.error("Greška", { description: message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Oceni vežbu</DialogTitle>
          <DialogDescription>
            Označi vežbu kao odrađenu i oceni koliko je bila teška. Trener će videti tvoju ocenu i
            komentar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label>Koliko je bilo teško? *</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((value) => {
                const filled = value <= (hoverRating || rating);
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    onMouseEnter={() => setHoverRating(value)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-0.5"
                  >
                    <Star
                      className={`h-7 w-7 transition-colors ${
                        filled ? "fill-primary text-primary" : "text-muted-foreground"
                      }`}
                    />
                  </button>
                );
              })}
              <span className="ml-2 text-sm text-muted-foreground">{rating} / 5</span>
            </div>
            <p className="text-xs text-muted-foreground">1 = prelako, 5 = preteško</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="exercise-comment">Komentar (opciono)</Label>
            <Textarea
              id="exercise-comment"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Npr. poslednja serija je bila preteška…"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Otkaži
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Čuvam..." : "Sačuvaj"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}