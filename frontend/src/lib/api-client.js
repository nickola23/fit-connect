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

/** GET /api/trainers?sortBy=&sortDirection= -> TrainerResponse[] (non-admins only see Approved) */
export function listTrainers({ sortBy, sortDirection } = {}) {
  const params = new URLSearchParams();
  if (sortBy) params.set("sortBy", sortBy);
  if (sortDirection) params.set("sortDirection", sortDirection);
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

export { ApiError };