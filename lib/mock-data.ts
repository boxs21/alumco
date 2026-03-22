// lib/mock-data.ts — Datos mock según CLAUDE.md

export const SEDES = {
  CONCEPCION: {
    id: "s1",
    nombre: "Concepción",
    slug: "CONCEPCION" as const,
    color: "#0f7ea3",
    bg: "#e0f2f9",
  },
  COYHAIQUE: {
    id: "s2",
    nombre: "Coyhaique",
    slug: "COYHAIQUE" as const,
    color: "#c8943a",
    bg: "#fdf3e3",
  },
};

export type SedeSlug = "CONCEPCION" | "COYHAIQUE";

export type Sede = (typeof SEDES)[keyof typeof SEDES];

export type Role = "ADMIN" | "COLLABORATOR";

export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  area: string | null;
  sedeId: string | null;
  sede: Sede | null;
  active: boolean;
}

export interface MockTraining {
  id: string;
  title: string;
  area: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  sedeId: string | null;
  sede: Sede | null;
  completados: number;
  asignados: number;
}

export interface MockStats {
  colaboradores: number;
  capacitaciones: number;
  cumplimiento: number;
  certificados: number;
}

export const mockUsers: MockUser[] = [
  {
    id: "u1",
    name: "María González",
    email: "maria@alumco.cl",
    role: "COLLABORATOR",
    area: "Cuidado",
    sedeId: "s1",
    sede: SEDES.CONCEPCION,
    active: true,
  },
  {
    id: "u2",
    name: "Juan Pérez",
    email: "juan@alumco.cl",
    role: "COLLABORATOR",
    area: "Enfermería",
    sedeId: "s1",
    sede: SEDES.CONCEPCION,
    active: true,
  },
  {
    id: "u3",
    name: "Ana Torres",
    email: "ana@alumco.cl",
    role: "COLLABORATOR",
    area: "Cuidado",
    sedeId: "s2",
    sede: SEDES.COYHAIQUE,
    active: true,
  },
  {
    id: "u4",
    name: "Carlos Ruiz",
    email: "carlos@alumco.cl",
    role: "COLLABORATOR",
    area: "Administración",
    sedeId: "s2",
    sede: SEDES.COYHAIQUE,
    active: true,
  },
  {
    id: "u5",
    name: "Valentina Lagos",
    email: "valentina@alumco.cl",
    role: "ADMIN",
    area: null,
    sedeId: null,
    sede: null,
    active: true,
  },
];

export const mockTrainings: MockTraining[] = [
  {
    id: "t1",
    title: "Protocolo de Higiene Personal",
    area: "Cuidado",
    status: "PUBLISHED",
    sedeId: null,
    sede: null,
    completados: 8,
    asignados: 12,
  },
  {
    id: "t2",
    title: "Manejo de Emergencias Médicas",
    area: "Enfermería",
    status: "PUBLISHED",
    sedeId: "s1",
    sede: SEDES.CONCEPCION,
    completados: 2,
    asignados: 6,
  },
  {
    id: "t3",
    title: "Normativa SENAMA 2025",
    area: "Todos",
    status: "DRAFT",
    sedeId: null,
    sede: null,
    completados: 0,
    asignados: 0,
  },
  {
    id: "t4",
    title: "Protocolo de Invierno",
    area: "Cuidado",
    status: "PUBLISHED",
    sedeId: "s2",
    sede: SEDES.COYHAIQUE,
    completados: 3,
    asignados: 5,
  },
];

export const mockStats: Record<string, MockStats> = {
  global: {
    colaboradores: 18,
    capacitaciones: 3,
    cumplimiento: 76,
    certificados: 10,
  },
  CONCEPCION: {
    colaboradores: 10,
    capacitaciones: 2,
    cumplimiento: 82,
    certificados: 6,
  },
  COYHAIQUE: {
    colaboradores: 8,
    capacitaciones: 2,
    cumplimiento: 68,
    certificados: 4,
  },
};
