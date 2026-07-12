import { useSyncExternalStore } from "react";

export const EQUIPMENT_CATEGORIES = [
  "Kardio",
  "Snaga",
  "Slobodni tegovi",
  "Funkcionalno",
  "Sprave sa kablovima",
];

export const ACCESSORY_CATEGORIES = [
  "Prostirke",
  "Elastične trake",
  "Lopte",
  "Užad",
  "Bučice / kettlebell",
  "Ostalo",
];

const initial = {
  equipment: [
    {
      id: "eq-1",
      name: "Traka za trčanje Pro X1",
      category: "Kardio",
      description: "Profesionalna traka do 20 km/h, nagib 0–15%.",
      location: "Dnevna soba",
      createdAt: new Date().toISOString(),
    },
    {
      id: "eq-2",
      name: "Multifunkcionalni kabl",
      category: "Sprave sa kablovima",
      description: "Dvostruki kabl 2x90kg sa različitim priključcima.",
      location: "Garaža",
      createdAt: new Date().toISOString(),
    },
  ],
  accessories: [
    {
      id: "ac-1",
      name: "Elastična traka srednja",
      category: "Elastične trake",
      description: "Otpor 15–25 kg, dužina 2m.",
      location: "Torba",
      createdAt: new Date().toISOString(),
    },
  ],
};

let state = initial;
const listeners = new Set();

function emit() {
  for (const l of listeners) l();
}

function subscribe(l) {
  listeners.add(l);
  return () => listeners.delete(l);
}

/** React hook returning the live list of items for a given catalog kind ("equipment" | "accessories"). */
export function useCatalog(kind) {
  return useSyncExternalStore(
    subscribe,
    () => state[kind],
    () => state[kind],
  );
}

export function getItem(kind, id) {
  return state[kind].find((i) => i.id === id);
}

export function createItem(kind, data) {
  const item = {
    ...data,
    id: `${kind === "equipment" ? "eq" : "ac"}-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  state = { ...state, [kind]: [item, ...state[kind]] };
  emit();
  return item;
}

export function updateItem(kind, id, data) {
  state = {
    ...state,
    [kind]: state[kind].map((i) => (i.id === id ? { ...i, ...data } : i)),
  };
  emit();
}

export function deleteItem(kind, id) {
  state = { ...state, [kind]: state[kind].filter((i) => i.id !== id) };
  emit();
}
