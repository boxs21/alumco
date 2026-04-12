// Configuration constants — sede names and training areas.
// These are real business values, not mock data.

export const SEDES = {
  CONCEPCION: { id: "294d17a7-e282-4789-82ff-bbf0de6015c2", nombre: "Concepción" },
  COYHAIQUE:  { id: "2e309cf3-84fe-49b0-8de9-7aa5eeb4a96a", nombre: "Coyhaique" },
} as const;

export type SedeKey = keyof typeof SEDES;

export const SEDE_ID_MAP: Record<string, string> = {
  CONCEPCION: SEDES.CONCEPCION.id,
  COYHAIQUE:  SEDES.COYHAIQUE.id,
};

export const AREAS = ["Cuidado", "Enfermería", "Administración"] as const;
export type Area = (typeof AREAS)[number];

/** Returns the display name for a sede_id ('s1' | 's2' | null). */
export function sedeName(sedeId: string | null): string | null {
  if (sedeId === SEDES.CONCEPCION.id) return SEDES.CONCEPCION.nombre;
  if (sedeId === SEDES.COYHAIQUE.id)  return SEDES.COYHAIQUE.nombre;
  return null;
}
