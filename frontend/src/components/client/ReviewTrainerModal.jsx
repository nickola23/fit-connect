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
import { upsertTrainerReview, ApiError } from "@/lib/api-client";

export function ReviewTrainerModal({ open, onOpenChange, trainer, onSubmitted }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await upsertTrainerReview(trainer.id, { rating, comment: comment.trim() || undefined });
      toast.success("Recenzija je sačuvana");
      onOpenChange(false);
      onSubmitted?.();
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Recenzija nije sačuvana.";
      toast.error("Greška", { description: message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Oceni trenera — {trainer?.name}</DialogTitle>
          <DialogDescription>
            Tvoja ocena i komentar biće javno vidljivi na profilu trenera.
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
            <Label htmlFor="review-comment">Komentar (opciono)</Label>
            <Textarea
              id="review-comment"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Podeli svoje iskustvo sa treningom…"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Otkaži
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Čuvam..." : "Sačuvaj recenziju"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}