import { useState } from "react";
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
import { createTrainingReview, ApiError } from "@/lib/api-client";

/**
 * Trainer rates a completed training/client session.
 * Peer-only visibility: the client this review is about never sees it,
 * only other trainers can (per the API docs).
 */
export function RateTrainingModal({ open, onOpenChange, training, clientName, onSubmitted }) {
  const [rating, setRating] = useState(3);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!training) return;
    setSubmitting(true);
    try {
      const trimmedComment = comment.trim() || undefined;
      const review = await createTrainingReview(training.id, {
        rating,
        comment: trimmedComment,
      });
      toast.success("Ocena treninga je sačuvana");
      onOpenChange(false);
      onSubmitted?.(review || { rating, comment: trimmedComment || null });
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Ocena nije sačuvana.";
      toast.error("Greška", { description: message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Oceni trening{clientName ? ` — ${clientName}` : ""}</DialogTitle>
          <DialogDescription>
            Ova ocena je vidljiva samo drugim trenerima, klijent je nikada neće videti.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label>Ocena *</Label>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="training-review-comment">Komentar (opciono)</Label>
            <Textarea
              id="training-review-comment"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Npr. klijent nije radio vežbe kako treba…"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Otkaži
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Čuvam..." : "Sačuvaj ocenu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}