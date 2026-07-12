import { getToken } from "@/lib/auth-storage";

const API_BASE_URL = "http://localhost:5089/api";

class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

/** Adds the Bearer token from the stored session, if present. */
function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  let body = null;
  const text = await response.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!response.ok) {
    const message =
      (body && typeof body === "object" && body.message) ||
      `Zahtev nije uspeo (${response.status})`;
    throw new ApiError(message, response.status, body);
  }

  return body;
}

/** POST /api/auth/login -> { token, expiresAt, user } */
export function login({ email, password }) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

/** POST /api/auth/register/client -> { token, expiresAt, user } */
export function registerClient({ name, email, password, goal, trainingLocation }) {
  const payload = {
    name,
    email,
    password,
    language: "sr",
    goal,
  };
  if (trainingLocation) payload.trainingLocation = trainingLocation;

  return request("/auth/register/client", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** POST /api/auth/register/trainer -> { token, expiresAt, user } */
export function registerTrainer({ name, email, password, education, bio, credentials }) {
  return request("/auth/register/trainer", {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
      password,
      language: "sr",
      education,
      bio,
      credentials,
    }),
  });
}

/** GET /api/trainers/{id} -> TrainerResponse */
export function getTrainerById(id) {
  return request(`/trainers/${id}`, {
    headers: authHeaders(),
  });
}

/** PATCH /api/trainers/{id} */
export function updateTrainerById(id, patch) {
  return request(`/trainers/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(patch),
  });
}

/** GET /api/trainers/{id}/credentials -> CredentialResponse[] */
export function listTrainerCredentials(trainerId) {
  return request(`/trainers/${trainerId}/credentials`, {
    headers: authHeaders(),
  });
}

/** GET /api/trainers/{id}/exercises -> ExerciseResponse[] */
export function listTrainerExercises(trainerId) {
  return request(`/trainers/${trainerId}/exercises`, {
    headers: authHeaders(),
  });
}

/** POST /api/trainers/{id}/exercises -> ExerciseResponse */
export function createTrainerExercise(trainerId, { name, description, defaultReps, defaultSets }) {
  const payload = { name, defaultReps, defaultSets };
  if (description) payload.description = description;

  return request(`/trainers/${trainerId}/exercises`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
}

/** POST /api/exercises/{id}/demo-video -> attaches a video URL to an existing exercise */
export function recordExerciseDemoVideo(exerciseId, url) {
  return request(`/exercises/${exerciseId}/demo-video`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ url }),
  });
}

export { ApiError };