import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { listCooperationPayments, ApiError } from "@/lib/api-client";

export function PaymentHistoryModal({ open, onOpenChange, cooperationId }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open || !cooperationId) return;
    setLoading(true);
    listCooperationPayments(cooperationId)
      .then(setPayments)
      .catch((error) => {
        const message =
          error instanceof ApiError ? error.message : "Ne mogu da učitam istoriju plaćanja.";
        toast.error("Greška", { description: message });
      })
      .finally(() => setLoading(false));
  }, [open, cooperationId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Istorija plaćanja</DialogTitle>
          <DialogDescription>
            Plaćanje evidentira tvoj trener nakon svake uplate mesečne članarine — ovde samo
            pratiš istoriju.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <p className="text-sm text-muted-foreground">Učitavanje…</p>
        ) : payments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Još nema evidentiranih plaćanja za ovu saradnju.
          </p>
        ) : (
          <ul className="max-h-72 space-y-2 overflow-y-auto">
            {payments.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <span className="text-sm text-foreground">
                  {new Date(p.paymentDate).toLocaleDateString("sr-RS")}
                </span>
                <span className="font-medium text-foreground">
                  {p.amount.toLocaleString("sr-RS")} RSD
                </span>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}