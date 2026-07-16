import { getToken } from "@/lib/auth-storage";

const API_BASE_URL = "http://localhost:5089/api";
// Uploaded files (credentials, demo videos) are served as static files directly
// off the API's origin, not under /api — e.g. http://localhost:5089/uploads/...
const FILE_ORIGIN = API_BASE_URL.replace(/\/api$/, "");

/**
 * Turns a relative upload path (e.g. "/uploads/credentials/<guid>.pdf") returned
 * by uploadFile()/CredentialResponse.fileUrl/ExerciseResponse.demoVideoUrl into
 * an absolute URL usable in <a href>/<video src>. Leaves already-absolute URLs
 * (http://, https://) untouched.
 */
export function resolveFileUrl(path) {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path;
  return `${FILE_ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;
}

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

/**
 * POST /api/files?category=... -> { url } (multipart, field name "file")
 * category: "Credentials" | "ExerciseDemoVideos"
 * Returns the relative url (e.g. "/uploads/credentials/<guid>.pdf") to send
 * as fileUrl/url in the endpoint that actually uses it.
 */
export async function uploadFile(file, category) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/files?category=${category}`, {
    method: "POST",
    headers: {
      ...authHeaders(),
      // No Content-Type here on purpose — the browser sets the multipart
      // boundary itself. Setting it manually breaks the upload.
    },
    body: formData,
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
      `Otpremanje fajla nije uspelo (${response.status})`;
    throw new ApiError(message, response.status, body);
  }

  return body; // { url: "..." }
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

/** GET /api/trainers/{id}/cooperations?status=... -> CooperationResponse[] */
export function listTrainerCooperations(trainerId, status) {
  const query = status ? `?status=${status}` : "";
  return request(`/trainers/${trainerId}/cooperations${query}`, {
    headers: authHeaders(),
  });
}

/** POST /api/cooperations/{id}/accept */
export function acceptCooperation(id) {
  return request(`/cooperations/${id}/accept`, {
    method: "POST",
    headers: authHeaders(),
  });
}

/** POST /api/cooperations/{id}/reject */
export function rejectCooperation(id) {
  return request(`/cooperations/${id}/reject`, {
    method: "POST",
    headers: authHeaders(),
  });
}

/** POST /api/cooperations/{id}/end */
export function endCooperation(id) {
  return request(`/cooperations/${id}/end`, {
    method: "POST",
    headers: authHeaders(),
  });
}

/** GET /api/trainers?sortBy=&sortDirection=&registrationStatus=Pending&page=&pageSize= -> PagedResult<TrainerResponse> (non-admins only see Approved; Admin can filter by registrationStatus) */
export function listTrainers({ sortBy, sortDirection, registrationStatus, page, pageSize } = {}) {
  const params = new URLSearchParams();
  if (sortBy) params.set("sortBy", sortBy);
  if (sortDirection) params.set("sortDirection", sortDirection);
  if (registrationStatus) params.set("registrationStatus", registrationStatus);
  if (page) params.set("page", page);
  if (pageSize) params.set("pageSize", pageSize);
  const query = params.toString() ? `?${params.toString()}` : "";
  return request(`/trainers${query}`, {
    headers: authHeaders(),
  });
}

/** GET /api/clients/{id}/cooperations -> CooperationResponse[] (history for FR27) */
export function listClientCooperations(clientId) {
  return request(`/clients/${clientId}/cooperations`, {
    headers: authHeaders(),
  });
}

/** POST /api/cooperations -> CooperationResponse */
export function createCooperation({ trainerId, pricingTierId, isFreeTrial }) {
  const payload = { trainerId, isFreeTrial: !!isFreeTrial };
  if (!isFreeTrial && pricingTierId) payload.pricingTierId = pricingTierId;

  return request("/cooperations", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
}

/** GET /api/clients/{id} -> ClientResponse */
export function getClientById(id) {
  return request(`/clients/${id}`, {
    headers: authHeaders(),
  });
}

/** PATCH /api/clients/{id} */
export function updateClientById(id, patch) {
  return request(`/clients/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(patch),
  });
}

/** GET /api/equipment?type=Apparatus -> EquipmentResponse[] */
export function getEquipment(type) {
  const query = type ? `?type=${type}` : "";
  return request(`/equipment${query}`, {
    headers: authHeaders(),
  });
}

/** GET /api/equipment/{id} -> EquipmentResponse */
export function getEquipmentById(id) {
  return request(`/equipment/${id}`, {
    headers: authHeaders(),
  });
}

/** POST /api/equipment -> EquipmentResponse */
export function createEquipment(payload) {
  return request(`/equipment`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
}

/** PATCH /api/equipment/{id} -> EquipmentResponse */
export function updateEquipment(id, payload) {
  return request(`/equipment/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
}

/** DELETE /api/equipment/{id} */
export function deleteEquipment(id) {
  return request(`/equipment/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
}

/** GET /api/trainers/{id}/pricing-tiers -> PricingTierResponse[] (owning trainer/Admin also sees inactive) */
export function listTrainerPricingTiers(trainerId) {
  return request(`/trainers/${trainerId}/pricing-tiers`, {
    headers: authHeaders(),
  });
}

/** POST /api/trainers/{id}/pricing-tiers -> PricingTierResponse */
export function createPricingTier(trainerId, { sessionsPerWeek, monthlyPrice }) {
  return request(`/trainers/${trainerId}/pricing-tiers`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ sessionsPerWeek, monthlyPrice }),
  });
}

/** PATCH /api/pricing-tiers/{id} -> PricingTierResponse (price only, sessionsPerWeek is fixed) */
export function updatePricingTier(id, { monthlyPrice }) {
  return request(`/pricing-tiers/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ monthlyPrice }),
  });
}

/** POST /api/pricing-tiers/{id}/deactivate */
export function deactivatePricingTier(id) {
  return request(`/pricing-tiers/${id}/deactivate`, {
    method: "POST",
    headers: authHeaders(),
  });
}

/** POST /api/pricing-tiers/{id}/activate */
export function activatePricingTier(id) {
  return request(`/pricing-tiers/${id}/activate`, {
    method: "POST",
    headers: authHeaders(),
  });
}

/** GET /api/cooperations/{id}/payments -> PaymentResponse[] (read-only for client; only trainer/Admin can record one) */
export function listCooperationPayments(cooperationId) {
  return request(`/cooperations/${cooperationId}/payments`, {
    headers: authHeaders(),
  });
}

/** PUT /api/trainers/{id}/reviews -> TrainerReviewResponse (Client only, create-or-replace own review) */
export function upsertTrainerReview(trainerId, { rating, comment }) {
  return request(`/trainers/${trainerId}/reviews`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ rating, comment }),
  });
}

/** POST /api/cooperations/{id}/payments -> PaymentResponse (no body, amount = locked-in pricing tier price) */
export function recordCooperationPayment(id) {
  return request(`/cooperations/${id}/payments`, {
    method: "POST",
    headers: authHeaders(),
  });
}

/** POST /api/cooperations/{id}/trainings -> TrainingResponse */
export function createTraining(cooperationId, payload) {
  return request(`/cooperations/${cooperationId}/trainings`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
}

/** GET /api/cooperations/{id}/trainings -> TrainingResponse[] (full history, FR15/FR27) */
export function listCooperationTrainings(cooperationId) {
  return request(`/cooperations/${cooperationId}/trainings`, {
    headers: authHeaders(),
  });
}

/** GET /api/trainings/{id}/exercises -> TrainingExerciseResponse[] */
export function listTrainingExercises(trainingId) {
  return request(`/trainings/${trainingId}/exercises`, {
    headers: authHeaders(),
  });
}

/** POST /api/trainings/{id}/complete -> explicit action, no auto-complete */
export function completeTraining(trainingId) {
  return request(`/trainings/${trainingId}/complete`, {
    method: "POST",
    headers: authHeaders(),
  });
}

/** POST /api/trainings/{id}/missed -> explicit action */
export function markTrainingMissed(trainingId) {
  return request(`/trainings/${trainingId}/missed`, {
    method: "POST",
    headers: authHeaders(),
  });
}

/** PATCH /api/training-exercises/{id}/complete -> 204 (owning client only) */
export function markTrainingExerciseComplete(id, { difficultyRating, comment } = {}) {
  const payload = {};
  if (difficultyRating != null) payload.difficultyRating = difficultyRating;
  if (comment) payload.comment = comment;

  return request(`/training-exercises/${id}/complete`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
}

/** GET /api/trainings/{id}/review -> TrainingReviewResponse (any Trainer; peer-only, never client-visible) */
export function getTrainingReview(trainingId) {
  return request(`/trainings/${trainingId}/review`, {
    headers: authHeaders(),
  });
}

/** POST /api/trainings/{id}/review -> TrainingReviewResponse (that training's trainer only; 409 if not Completed or already reviewed) */
export function createTrainingReview(trainingId, { rating, comment }) {
  const payload = { rating };
  if (comment) payload.comment = comment;

  return request(`/trainings/${trainingId}/review`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
}

/** GET /api/exercises/{id}/equipment -> EquipmentResponse[] */
export function listExerciseEquipment(exerciseId) {
  return request(`/exercises/${exerciseId}/equipment`, {
    headers: authHeaders(),
  });
}

/** POST /api/exercises/{id}/equipment/{equipmentId} -> links equipment to an exercise (no body, idempotent) */
export function addExerciseEquipment(exerciseId, equipmentId) {
  return request(`/exercises/${exerciseId}/equipment/${equipmentId}`, {
    method: "POST",
    headers: authHeaders(),
  });
}

/** DELETE /api/exercises/{id}/equipment/{equipmentId} -> unlinks equipment from an exercise (idempotent) */
export function removeExerciseEquipment(exerciseId, equipmentId) {
  return request(`/exercises/${exerciseId}/equipment/${equipmentId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
}

/** GET /api/clients/{id}/equipment -> EquipmentResponse[] (equipment the client owns) */
export function listClientEquipment(clientId) {
  return request(`/clients/${clientId}/equipment`, {
    headers: authHeaders(),
  });
}

/** POST /api/clients/{id}/equipment/{equipmentId} -> marks equipment as owned by the client (no body, idempotent) */
export function addClientEquipment(clientId, equipmentId) {
  return request(`/clients/${clientId}/equipment/${equipmentId}`, {
    method: "POST",
    headers: authHeaders(),
  });
}

/** DELETE /api/clients/{id}/equipment/{equipmentId} -> unmarks equipment as owned (idempotent) */
export function removeClientEquipment(clientId, equipmentId) {
  return request(`/clients/${clientId}/equipment/${equipmentId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
}

/** GET /api/clients/{id}/health-records?fromDate=&toDate= -> HealthRecordResponse[] (that client, or their Accepted/Active trainer; no admin access, NFR5) */
export function listClientHealthRecords(clientId, { fromDate, toDate } = {}) {
  const params = new URLSearchParams();
  if (fromDate) params.set("fromDate", fromDate);
  if (toDate) params.set("toDate", toDate);
  const query = params.toString() ? `?${params.toString()}` : "";
  return request(`/clients/${clientId}/health-records${query}`, {
    headers: authHeaders(),
  });
}

/** POST /api/clients/{id}/health-records -> HealthRecordResponse (that client only; append-only log, FR18) */
export function createHealthRecord(clientId, { weight, height, healthCondition } = {}) {
  const payload = {};
  if (weight != null) payload.weight = weight;
  if (height != null) payload.height = height;
  if (healthCondition) payload.healthCondition = healthCondition;

  return request(`/clients/${clientId}/health-records`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
}

/** POST /api/trainers/{id}/credentials -> CredentialResponse (that trainer, or Admin) */
export function addTrainerCredential(trainerId, { type, fileUrl, issuedBy }) {
  const payload = { type, fileUrl };
  if (issuedBy) payload.issuedBy = issuedBy;

  return request(`/trainers/${trainerId}/credentials`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
}

/** DELETE /api/trainers/{id}/credentials/{credentialId} -> blocked with 409 if it's the trainer's last valid License/Diploma */
export function deleteTrainerCredential(trainerId, credentialId) {
  return request(`/trainers/${trainerId}/credentials/${credentialId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
}

/** POST /api/trainers/{id}/approve -> Admin only, trainer must currently be Pending */
export function approveTrainer(id) {
  return request(`/trainers/${id}/approve`, {
    method: "POST",
    headers: authHeaders(),
  });
}

/** POST /api/trainers/{id}/reject -> Admin only, trainer must currently be Pending */
export function rejectTrainer(id) {
  return request(`/trainers/${id}/reject`, {
    method: "POST",
    headers: authHeaders(),
  });
}

export { ApiError };