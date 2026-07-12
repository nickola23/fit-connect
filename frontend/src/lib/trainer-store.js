// Mock local store za podatke o treneru i njegovim vežbama.
// Kada se poveže sa .NET API-jem, zameniti pozivima ka /api/trainers/{id} i /api/trainers/{id}/exercises.

const TRAINER_KEY = "fitconnect.trainer.profile";
const EXERCISES_KEY = "fitconnect.trainer.exercises";

const defaultTrainer = {
  id: "trainer-demo-1",
  name: "Marko Marković",
  email: "marko@fitconnect.rs",
  language: "sr",
  education: "Fakultet sporta i fizičkog vaspitanja",
  bio: "5 godina iskustva u treningu snage i kondicije.",
  registrationStatus: "Approved",
  averageRating: 4.7,
  reviewCount: 18,
  credentials: [
    {
      id: "cred-1",
      type: "License",
      fileUrl: "https://example.com/license.pdf",
      issuedBy: "National Fitness Board",
      uploadDate: "2025-01-15",
    },
  ],
};

function isBrowser() {
  return typeof window !== "undefined";
}

export function getTrainer() {
  if (!isBrowser()) return defaultTrainer;
  const raw = window.localStorage.getItem(TRAINER_KEY);
  if (!raw) {
    window.localStorage.setItem(TRAINER_KEY, JSON.stringify(defaultTrainer));
    return defaultTrainer;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return defaultTrainer;
  }
}

/** patch: { name, email, language, education, bio } */
export function updateTrainer(patch) {
  const current = getTrainer();
  const next = { ...current, ...patch };
  if (isBrowser()) window.localStorage.setItem(TRAINER_KEY, JSON.stringify(next));
  return next;
}

export function listExercises() {
  if (!isBrowser()) return [];
  const raw = window.localStorage.getItem(EXERCISES_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/** data: { name, description?, defaultReps, defaultSets, demoVideoUrl? } */
export function createExercise(data) {
  const items = listExercises();
  const item = {
    id: `ex-${Date.now()}`,
    name: data.name,
    description: data.description,
    defaultReps: data.defaultReps,
    defaultSets: data.defaultSets,
    demoVideoUrl: data.demoVideoUrl?.trim() ? data.demoVideoUrl.trim() : null,
  };
  const next = [item, ...items];
  if (isBrowser()) window.localStorage.setItem(EXERCISES_KEY, JSON.stringify(next));
  return item;
}