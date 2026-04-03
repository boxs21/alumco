export const SEDES = {
  CONCEPCION: { id: 's1', nombre: 'Concepción', slug: 'CONCEPCION', color: '#6366f1', bg: '#eef2ff' },
  COYHAIQUE:  { id: 's2', nombre: 'Coyhaique',  slug: 'COYHAIQUE',  color: '#f59e0b', bg: '#fffbeb' },
} as const;

export type SedeSlug = keyof typeof SEDES;
export type Role = 'ADMIN' | 'COLLABORATOR';
export type TrainingStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type AssignmentTarget = 'ALL' | 'SEDE' | 'AREA' | 'INDIVIDUAL';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  area: string | null;
  sedeId: string | null;
  sedeName: string | null;
  active: boolean;
  nota: number | null;
  completadas: number;
}

export interface Training {
  id: string;
  title: string;
  area: string;
  status: TrainingStatus;
  sedeId: string | null;
  sedeName: string | null;
  completados: number;
  asignados: number;
}

export interface SedeStats {
  colaboradores: number;
  capacitaciones: number;
  cumplimiento: number;
  certificados: number;
}

export const mockUsers: User[] = [
  { id: 'u1', name: 'María González',  email: 'maria@alumco.cl',     role: 'COLLABORATOR', area: 'Cuidado',        sedeId: 's1', sedeName: 'Concepción', active: true,  nota: 85,   completadas: 3 },
  { id: 'u2', name: 'Juan Pérez',      email: 'juan@alumco.cl',      role: 'COLLABORATOR', area: 'Enfermería',     sedeId: 's1', sedeName: 'Concepción', active: true,  nota: null, completadas: 0 },
  { id: 'u3', name: 'Ana Torres',      email: 'ana@alumco.cl',       role: 'COLLABORATOR', area: 'Cuidado',        sedeId: 's2', sedeName: 'Coyhaique',  active: true,  nota: 72,   completadas: 2 },
  { id: 'u4', name: 'Carlos Ruiz',     email: 'carlos@alumco.cl',    role: 'COLLABORATOR', area: 'Administración', sedeId: 's2', sedeName: 'Coyhaique',  active: false, nota: null, completadas: 1 },
  { id: 'u5', name: 'Rosa Muñoz',      email: 'rosa@alumco.cl',      role: 'COLLABORATOR', area: 'Enfermería',     sedeId: 's1', sedeName: 'Concepción', active: true,  nota: 90,   completadas: 4 },
  { id: 'u6', name: 'Pedro Soto',      email: 'pedro@alumco.cl',     role: 'COLLABORATOR', area: 'Cuidado',        sedeId: 's2', sedeName: 'Coyhaique',  active: true,  nota: 68,   completadas: 2 },
  { id: 'u7', name: 'Valentina Lagos', email: 'valentina@alumco.cl', role: 'ADMIN',        area: null,             sedeId: null, sedeName: null,          active: true,  nota: null, completadas: 0 },
];

export const mockTrainings: Training[] = [
  { id: 't1', title: 'Protocolo de Higiene Personal', area: 'Cuidado',     status: 'PUBLISHED', sedeId: null, sedeName: null,        completados: 8,  asignados: 12 },
  { id: 't2', title: 'Manejo de Emergencias Médicas', area: 'Enfermería',  status: 'PUBLISHED', sedeId: 's1', sedeName: 'Concepción', completados: 2,  asignados: 6  },
  { id: 't3', title: 'Normativa SENAMA 2025',         area: 'Todos',       status: 'DRAFT',     sedeId: null, sedeName: null,         completados: 0,  asignados: 0  },
  { id: 't4', title: 'Protocolo de Invierno',         area: 'Cuidado',     status: 'PUBLISHED', sedeId: 's2', sedeName: 'Coyhaique',  completados: 3,  asignados: 5  },
  { id: 't5', title: 'Primeros Auxilios Básicos',     area: 'Todos',       status: 'PUBLISHED', sedeId: null, sedeName: null,         completados: 10, asignados: 18 },
];

export const mockStats: Record<string, SedeStats> = {
  global:     { colaboradores: 18, capacitaciones: 4, cumplimiento: 76, certificados: 10 },
  CONCEPCION: { colaboradores: 10, capacitaciones: 3, cumplimiento: 82, certificados: 6  },
  COYHAIQUE:  { colaboradores: 8,  capacitaciones: 3, cumplimiento: 68, certificados: 4  },
};

export const AREAS = ['Cuidado', 'Enfermería', 'Administración'] as const;

export const mockRecentActivity = [
  { id: 'a1', text: 'María González completó "Protocolo de Higiene Personal"', sede: 'Concepción', sedeId: 's1', time: 'Hace 2 horas' },
  { id: 'a2', text: 'Pedro Soto inició "Protocolo de Invierno"',              sede: 'Coyhaique',  sedeId: 's2', time: 'Hace 3 horas' },
  { id: 'a3', text: 'Rosa Muñoz obtuvo certificado en "Primeros Auxilios"',   sede: 'Concepción', sedeId: 's1', time: 'Hace 5 horas' },
  { id: 'a4', text: 'Ana Torres completó "Protocolo de Invierno"',            sede: 'Coyhaique',  sedeId: 's2', time: 'Ayer' },
  { id: 'a5', text: 'Juan Pérez se registró en la plataforma',                sede: 'Concepción', sedeId: 's1', time: 'Ayer' },
];

export const mockAreaProgress = [
  { area: 'Cuidado',        progreso: 78 },
  { area: 'Enfermería',     progreso: 65 },
  { area: 'Administración', progreso: 82 },
];

export const mockCollaboratorTrainings = [
  { id: 'ct1', trainingId: 't1', title: 'Protocolo de Higiene Personal', status: 'COMPLETED' as const,   score: 85,   date: '2025-03-10', hasCertificate: true,  progress: 100 },
  { id: 'ct2', trainingId: 't5', title: 'Primeros Auxilios Básicos',     status: 'COMPLETED' as const,   score: 90,   date: '2025-03-15', hasCertificate: true,  progress: 100 },
  { id: 'ct3', trainingId: 't2', title: 'Manejo de Emergencias Médicas', status: 'IN_PROGRESS' as const, score: null, date: null,         hasCertificate: false, progress: 45  },
];

export const mockFiles = [
  { id: 'f1', name: 'Manual de Higiene.pdf', type: 'PDF' as const, size: '2.4 MB' },
  { id: 'f2', name: 'Video Instructivo.mp4', type: 'VIDEO' as const, size: '45 MB' },
  { id: 'f3', name: 'Presentación Resumen.pptx', type: 'PRESENTATION' as const, size: '8.1 MB' },
];

export const mockQuestions = [
  {
    id: 'q1',
    text: '¿Cuál es el primer paso del protocolo de higiene?',
    options: [
      { id: 'o1', text: 'Lavado de manos', isCorrect: true },
      { id: 'o2', text: 'Colocarse guantes', isCorrect: false },
      { id: 'o3', text: 'Desinfectar superficies', isCorrect: false },
      { id: 'o4', text: 'Revisar insumos', isCorrect: false },
    ],
  },
  {
    id: 'q2',
    text: '¿Cada cuántas horas se debe realizar el protocolo completo?',
    options: [
      { id: 'o5', text: 'Cada 2 horas', isCorrect: false },
      { id: 'o6', text: 'Cada 4 horas', isCorrect: true },
      { id: 'o7', text: 'Cada 6 horas', isCorrect: false },
      { id: 'o8', text: 'Cada 8 horas', isCorrect: false },
    ],
  },
];
