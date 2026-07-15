import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { TrainerShell } from "@/components/trainer/TrainerShell";
import { getUser } from "@/lib/auth-storage";
import { listTrainerExercises, createTraining, ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Plus, Trash2, Dumbbell, ClipboardList } from "lucide-react";
import { usePageTitle } from "@/lib/use-page-title";

export default function TrainingNew() {
  usePageTitle("Novi trening | FitConnect");
  const location = useLocation();
  const navigate = useNavigate();
  const user = getUser();

  // Podaci prosleđeni sa TrainerHome
  const { cooperationId, clientName } = location.state || {};

  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Polja forme za sam trening
  const [trainingName, setTrainingName] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [trainingType, setTrainingType] = useState("Live"); // "Live" | "Assigned"
  const [meetingLink, setMeetingLink] = useState("");
  const [targetDate, setTargetDate] = useState("");
  
  // Izabrane vežbe unutar ovog treninga
  const [selectedExercises, setSelectedExercises] = useState([]);

  useEffect(() => {
    if (!cooperationId) {
      toast.error("Nema aktivne saradnje. Vraćam vas na početnu.");
      navigate("/trainer");
      return;
    }
    loadExercises();
  }, [cooperationId]);

  const loadExercises = async () => {
    try {
      setLoading(true);
      const data = await listTrainerExercises(user.id);
      setExercises(data);
    } catch (err) {
      toast.error("Greška pri učitavanju šablona vežbi");
    } finally {
      setLoading(false);
    }
  };

  // Dodavanje vežbe u trening sa njenim podrazumevanim vrednostima
  const handleAddExercise = (exerciseTemplate) => {
    const isAlreadyAdded = selectedExercises.some(e => e.exerciseId === exerciseTemplate.id);
    if (isAlreadyAdded) {
      toast.error("Ova vežba je već dodata u trening");
      return;
    }

    const newExercise = {
      exerciseId: exerciseTemplate.id,
      name: exerciseTemplate.name,
      reps: exerciseTemplate.defaultReps || 10,
      sets: exerciseTemplate.defaultSets || 3,
    };

    setSelectedExercises([...selectedExercises, newExercise]);
  };

  const handleRemoveExercise = (exerciseId) => {
    setSelectedExercises(selectedExercises.filter(e => e.exerciseId !== exerciseId));
  };

  // Menjanje vrednosti reps i sets isključivo za ovu instancu u treningu
  const handleValueChange = (exerciseId, field, value) => {
    const numValue = parseInt(value, 10) || 0;
    setSelectedExercises(prev =>
      prev.map(e => (e.exerciseId === exerciseId ? { ...e, [field]: numValue } : e))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!trainingName.trim()) {
      toast.error("Naziv treninga je obavezan");
      return;
    }
    if (!scheduledDate) {
      toast.error("Datum je obavezan");
      return;
    }
    if (selectedExercises.length === 0) {
      toast.error("Morate dodati bar jednu vežbu u trening");
      return;
    }
    if (trainingType === "Live" && !meetingLink.trim()) {
      toast.error("Link za sastanak je obavezan za uživo trening");
      return;
    }
    if (trainingType === "Assigned" && !targetDate) {
      toast.error("Ciljni datum je obavezan za zadati trening");
      return;
    }

    try {
      setSubmitting(true);
      
      // Spremamo body prema AssignTrainingRequest strukturi iz dokumentacije
      const payload = {
        type: trainingType, // "Live" ili "Assigned"
        trainingDate: scheduledDate, // YYYY-MM-DD
        ...(trainingType === "Live"
          ? { meetingLink: meetingLink.trim() }
          : { targetDate }),
        exercises: selectedExercises.map(e => ({
          exerciseId: e.exerciseId,
          reps: e.reps,
          sets: e.sets
        }))
      };

      // Prvi argument je cooperationId, drugi je payload (AssignTrainingRequest)
      await createTraining(cooperationId, payload);
      
      toast.success("Trening uspešno kreiran i dodeljen klijentu!");
      setTimeout(() => navigate("/trainer"), 1500);
    } catch (err) {
      toast.error(err.message || "Greška pri kreiranju treninga");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <TrainerShell>
        <div className="text-center py-12 text-muted-foreground">Učitavanje...</div>
      </TrainerShell>
    );
  }

  return (
    <TrainerShell>
      <Toaster />
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/trainer")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Nazad
          </Button>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Kreiranje treninga za klijenta: <span className="text-primary">{clientName}</span>
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          
          {/* Leva kolona: Detalji treninga i izabrane vežbe */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Detalji treninga</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="trainingName">Naziv treninga</Label>
                  <Input
                    id="trainingName"
                    placeholder="npr. Trening nogu i stomaka"
                    value={trainingName}
                    onChange={(e) => setTrainingName(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="scheduledDate">Datum realizacije</Label>
                  <Input
                    id="scheduledDate"
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Tip treninga</Label>
                  <RadioGroup
                    value={trainingType}
                    onValueChange={setTrainingType}
                    className="flex items-center gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Live" id="type-live" />
                      <Label htmlFor="type-live" className="font-normal cursor-pointer">
                        Uživo (Live)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Assigned" id="type-assigned" />
                      <Label htmlFor="type-assigned" className="font-normal cursor-pointer">
                        Zadati (Assigned)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {trainingType === "Live" ? (
                  <div className="grid gap-2">
                    <Label htmlFor="meetingLink">Link za sastanak</Label>
                    <Input
                      id="meetingLink"
                      type="url"
                      placeholder="https://meet.example.com/abc"
                      value={meetingLink}
                      onChange={(e) => setMeetingLink(e.target.value)}
                      required
                    />
                  </div>
                ) : (
                  <div className="grid gap-2">
                    <Label htmlFor="targetDate">Ciljni datum za izvršenje</Label>
                    <Input
                      id="targetDate"
                      type="date"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      required
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Struktura treninga (Izabrane vežbe)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedExercises.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    Još niste dodali nijednu vežbu. Izaberite vežbe iz kataloga sa desne strane.
                  </p>
                ) : (
                  <div className="divide-y divide-border">
                    {selectedExercises.map((item, index) => (
                      <div key={item.exerciseId} className="flex items-center justify-between py-4 first:pt-0 last:pb-0 gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {index + 1}. {item.name}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <Label className="text-xs text-muted-foreground">Serije</Label>
                            <Input
                              type="number"
                              className="h-8 w-16 text-center"
                              min="1"
                              value={item.sets}
                              onChange={(e) => handleValueChange(item.exerciseId, "sets", e.target.value)}
                            />
                          </div>

                          <div className="flex items-center gap-1.5">
                            <Label className="text-xs text-muted-foreground">Ponavljanja</Label>
                            <Input
                              type="number"
                              className="h-8 w-16 text-center"
                              min="1"
                              value={item.reps}
                              onChange={(e) => handleValueChange(item.exerciseId, "reps", e.target.value)}
                            />
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => handleRemoveExercise(item.exerciseId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => navigate("/trainer")}>
                Otkaži
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Kreiram..." : "Dodeli klijentu"}
              </Button>
            </div>
          </div>

          {/* Desna kolona: Šabloni vežbi */}
          <div className="lg:col-span-1">
            <Card className="h-[calc(100vh-12rem)] flex flex-col">
              <CardHeader className="flex-shrink-0">
                <CardTitle className="text-base flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-primary" />
                  Katalog vežbi
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-y-auto flex-1 pr-2">
                {exercises.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    Nemate registrovanih šablona vežbi.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {exercises.map((template) => {
                      const isAdded = selectedExercises.some(e => e.exerciseId === template.id);
                      return (
                        <div
                          key={template.id}
                          className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-card/50 hover:bg-accent/40 transition-colors"
                        >
                          <div className="min-w-0 pr-2">
                            <p className="text-sm font-medium text-foreground truncate">
                              {template.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Podrazumevano: {template.defaultSets || 3}x{template.defaultReps || 10}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            disabled={isAdded}
                            onClick={() => handleAddExercise(template)}
                            className="h-8 px-2"
                          >
                            {isAdded ? "Dodato" : <Plus className="h-4 w-4" />}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

        </form>
      </div>
    </TrainerShell>
  );
}