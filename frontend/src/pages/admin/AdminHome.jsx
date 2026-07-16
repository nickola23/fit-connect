import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { listTrainers, ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserRoundCheck, ArrowRight, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { usePageTitle } from "@/lib/use-page-title";

export default function AdminHome() {
  usePageTitle("Admin — Početna | FitConnect");

  const [pendingTrainers, setPendingTrainers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [ratedTrainers, setRatedTrainers] = useState([]);
  const [ratedTotalCount, setRatedTotalCount] = useState(0);
  const [ratedPage, setRatedPage] = useState(1);
  const [ratedLoading, setRatedLoading] = useState(true);
  const ratedPageSize = 10;

  function load() {
    setLoading(true);
    listTrainers({ registrationStatus: "Pending", pageSize: 100 })
      .then((response) => setPendingTrainers(response.items || []))
      .catch((error) => {
        const message =
          error instanceof ApiError ? error.message : "Ne mogu da učitam zahteve za registraciju.";
        toast.error("Greška pri učitavanju", { description: message });
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  function loadRatedTrainers(page) {
    setRatedLoading(true);
    listTrainers({ sortBy: "AverageRating", sortDirection: "DESC", page, pageSize: ratedPageSize })
      .then((response) => {
        setRatedTrainers(response.items || []);
        setRatedTotalCount(response.totalCount || 0);
      })
      .catch((error) => {
        const message =
          error instanceof ApiError ? error.message : "Ne mogu da učitam listu trenera.";
        toast.error("Greška pri učitavanju", { description: message });
      })
      .finally(() => setRatedLoading(false));
  }

  useEffect(() => {
    loadRatedTrainers(ratedPage);
  }, [ratedPage]);

  const ratedTotalPages = Math.max(1, Math.ceil(ratedTotalCount / ratedPageSize));

  return (
    <AdminShell>
      <Toaster />
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">Admin — Početna</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pregled zahteva za registraciju trenera.
        </p>
      </div>

      <Card className="mt-8">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <UserRoundCheck className="h-5 w-5 text-primary" />
            Zahtevi za registraciju trenera
          </CardTitle>
          {pendingTrainers.length > 0 && (
            <Badge variant="secondary">{pendingTrainers.length} na čekanju</Badge>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Učitavanje...</p>
          ) : pendingTrainers.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Trenutno nema zahteva na čekanju.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pendingTrainers.map((trainer) => (
                <div
                  key={trainer.id}
                  className="flex flex-col justify-between rounded-xl border border-border bg-card p-5"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-display text-lg font-semibold text-foreground">
                        {trainer.name}
                      </p>
                      <Badge variant="outline">Pending</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground break-words">
                      {trainer.email}
                    </p>
                    {trainer.education && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        {trainer.education}
                      </p>
                    )}
                  </div>

                  <Button asChild className="mt-4 w-full">
                    <Link to={`/admin/trainers/${trainer.id}`}>
                      Pregledaj zahtev <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Treneri sortirani po proseku ocena
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ratedLoading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Učitavanje...</p>
          ) : ratedTrainers.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Nema trenera za prikaz.
            </div>
          ) : (
            <>
              <ul className="divide-y divide-border">
                {ratedTrainers.map((trainer, index) => (
                  <li key={trainer.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 shrink-0 text-sm text-muted-foreground">
                        {(ratedPage - 1) * ratedPageSize + index + 1}.
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{trainer.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{trainer.email}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge variant="outline">{trainer.registrationStatus}</Badge>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                        {trainer.averageRating != null ? (
                          <span className="font-medium text-foreground">
                            {trainer.averageRating.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                        <span className="text-muted-foreground">
                          ({trainer.reviewCount ?? 0})
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Strana {ratedPage} od {ratedTotalPages} · {ratedTotalCount} trenera ukupno
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={ratedPage <= 1}
                    onClick={() => setRatedPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={ratedPage >= ratedTotalPages}
                    onClick={() => setRatedPage((p) => Math.min(ratedTotalPages, p + 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </AdminShell>
  );
}