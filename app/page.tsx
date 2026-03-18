"use client";
import { useState } from "react";

const COLORS = {
  bg: "#0f1117",
  surface: "#181c27",
  surfaceHover: "#1e2336",
  border: "#2a3050",
  accent: "#22d3ee",
  accentDim: "#0e7490",
  accentGlow: "rgba(34,211,238,0.12)",
  text: "#e8eaf6",
  textMuted: "#6b7db3",
  textDim: "#3d4f7a",
  success: "#4ade80",
  danger: "#f87171",
  warning: "#fbbf24",
};

const styles = {
  app: {
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    background: COLORS.bg,
    minHeight: "100vh",
    color: COLORS.text,
  },
  loginWrap: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: `radial-gradient(ellipse at 60% 40%, rgba(34,211,238,0.07) 0%, ${COLORS.bg} 60%)`,
  },
  loginCard: {
    background: COLORS.surface,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 16,
    padding: "48px 40px",
    width: 380,
    boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
  },
  loginLogo: { display: "flex", alignItems: "center", gap: 10, marginBottom: 32 },
  logoMark: {
    width: 36, height: 36, background: COLORS.accent, borderRadius: 8,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 700, fontSize: 16, color: COLORS.bg,
  },
  logoText: { fontSize: 18, fontWeight: 600, color: COLORS.text },
  loginTitle: { fontSize: 24, fontWeight: 700, marginBottom: 6 },
  loginSub: { fontSize: 14, color: COLORS.textMuted, marginBottom: 32 },
  label: { fontSize: 13, color: COLORS.textMuted, marginBottom: 6, display: "block" },
  input: {
    width: "100%", background: COLORS.bg, border: `1px solid ${COLORS.border}`,
    borderRadius: 8, padding: "10px 14px", color: COLORS.text, fontSize: 14,
    outline: "none", boxSizing: "border-box" as const, marginBottom: 16,
  },
  btnPrimary: {
    width: "100%", background: COLORS.accent, color: COLORS.bg, border: "none",
    borderRadius: 8, padding: "12px 0", fontWeight: 700, fontSize: 15,
    cursor: "pointer", marginBottom: 12,
  },
  btnSecondary: {
    width: "100%", background: "transparent", color: COLORS.accent,
    border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "11px 0",
    fontWeight: 600, fontSize: 14, cursor: "pointer",
  },
  layout: { display: "flex", minHeight: "100vh" },
  sidebar: {
    width: 220, background: COLORS.surface, borderRight: `1px solid ${COLORS.border}`,
    padding: "24px 0", flexShrink: 0, display: "flex", flexDirection: "column" as const,
  },
  sidebarLogo: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "0 20px 28px", borderBottom: `1px solid ${COLORS.border}`, marginBottom: 16,
  },
  navItem: (active: boolean) => ({
    display: "flex", alignItems: "center", gap: 10, padding: "10px 20px", fontSize: 14,
    color: active ? COLORS.accent : COLORS.textMuted,
    background: active ? COLORS.accentGlow : "transparent",
    borderLeft: active ? `3px solid ${COLORS.accent}` : "3px solid transparent",
    cursor: "pointer", fontWeight: active ? 600 : 400,
  }),
  main: { flex: 1, padding: "32px 36px", overflowY: "auto" as const },
  pageTitle: { fontSize: 24, fontWeight: 700, marginBottom: 4 },
  pageSub: { fontSize: 14, color: COLORS.textMuted, marginBottom: 32 },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 },
  statCard: {
    background: COLORS.surface, border: `1px solid ${COLORS.border}`,
    borderRadius: 12, padding: "20px 20px",
  },
  statLabel: { fontSize: 12, color: COLORS.textMuted, marginBottom: 8, textTransform: "uppercase" as const, letterSpacing: "0.08em" },
  statValue: { fontSize: 28, fontWeight: 700, marginBottom: 2 },
  statDelta: { fontSize: 12, color: COLORS.success },
  card: {
    background: COLORS.surface, border: `1px solid ${COLORS.border}`,
    borderRadius: 12, marginBottom: 24, overflow: "hidden",
  },
  cardHeader: {
    padding: "18px 24px", borderBottom: `1px solid ${COLORS.border}`,
    display: "flex", justifyContent: "space-between", alignItems: "center",
  },
  cardTitle: { fontSize: 15, fontWeight: 600 },
  table: { width: "100%", borderCollapse: "collapse" as const },
  th: {
    padding: "12px 24px", textAlign: "left" as const, fontSize: 11, color: COLORS.textDim,
    textTransform: "uppercase" as const, letterSpacing: "0.1em",
    borderBottom: `1px solid ${COLORS.border}`, background: "rgba(255,255,255,0.02)",
  },
  td: { padding: "14px 24px", fontSize: 14, borderBottom: `1px solid ${COLORS.border}` },
  badge: (color: string) => ({
    display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
    background: color === "green" ? "rgba(74,222,128,0.12)" : color === "yellow" ? "rgba(251,191,36,0.12)" : "rgba(99,102,241,0.12)",
    color: color === "green" ? COLORS.success : color === "yellow" ? COLORS.warning : "#818cf8",
  }),
  btnSmall: {
    background: COLORS.accentGlow, color: COLORS.accent, border: `1px solid ${COLORS.accentDim}`,
    borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer",
  },
  btnGhost: {
    background: "transparent", color: COLORS.textMuted, border: `1px solid ${COLORS.border}`,
    borderRadius: 6, padding: "5px 12px", fontSize: 12, cursor: "pointer",
  },
  trainingHero: {
    background: `linear-gradient(135deg, ${COLORS.surface} 0%, #1a2040 100%)`,
    border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: "32px", marginBottom: 24,
  },
  progressBar: () => ({
    height: 6, background: COLORS.border, borderRadius: 99,
    overflow: "hidden", position: "relative" as const,
  }),
  progressFill: (pct: number) => ({
    position: "absolute" as const, left: 0, top: 0, bottom: 0,
    width: `${pct}%`, background: COLORS.accent, borderRadius: 99,
  }),
  fileList: { display: "flex", flexDirection: "column" as const, gap: 12, marginBottom: 24 },
  fileItem: (active: boolean) => ({
    display: "flex", alignItems: "center", gap: 16, padding: "16px 20px",
    background: active ? COLORS.accentGlow : COLORS.surface,
    border: `1px solid ${active ? COLORS.accentDim : COLORS.border}`,
    borderRadius: 10, cursor: "pointer",
  }),
  fileIcon: (type: string) => ({
    width: 40, height: 40, borderRadius: 8,
    background: type === "pdf" ? "rgba(248,113,113,0.15)" : type === "video" ? "rgba(251,191,36,0.15)" : "rgba(99,102,241,0.15)",
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0,
  }),
  quizWrap: { maxWidth: 640, margin: "0 auto" },
  questionCard: {
    background: COLORS.surface, border: `1px solid ${COLORS.border}`,
    borderRadius: 14, padding: "32px", marginBottom: 20,
  },
  optionItem: (selected: boolean) => ({
    display: "flex", alignItems: "center", gap: 14, padding: "14px 18px",
    background: selected ? COLORS.accentGlow : "transparent",
    border: `1px solid ${selected ? COLORS.accentDim : COLORS.border}`,
    borderRadius: 8, cursor: "pointer", marginBottom: 10, transition: "all 0.15s",
  }),
  optionDot: (selected: boolean) => ({
    width: 18, height: 18, borderRadius: "50%",
    border: `2px solid ${selected ? COLORS.accent : COLORS.textDim}`,
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  }),
  optionDotFill: { width: 8, height: 8, borderRadius: "50%", background: COLORS.accent },
  resultCard: {
    background: COLORS.surface, border: `1px solid ${COLORS.border}`,
    borderRadius: 16, padding: "48px", textAlign: "center" as const,
    maxWidth: 480, margin: "0 auto",
  },
  resultCircle: (passed: boolean) => ({
    width: 100, height: 100, borderRadius: "50%",
    background: passed ? "rgba(74,222,128,0.12)" : "rgba(248,113,113,0.12)",
    border: `3px solid ${passed ? COLORS.success : COLORS.danger}`,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 36, margin: "0 auto 24px",
  }),
  portalGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 },
  portalCard: {
    background: COLORS.surface, border: `1px solid ${COLORS.border}`,
    borderRadius: 12, padding: "24px", cursor: "pointer",
  },
  portalCardTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
};

// ─── TYPES ───
interface Cap { id: number; titulo: string; area: string; estado: string; colaboradores: number; completados: number; }

// ─── DATA MOCK ───
const capacitaciones: Cap[] = [
  { id: 1, titulo: "Protocolo de Higiene Personal", area: "Cuidado", estado: "Publicado", colaboradores: 12, completados: 8 },
  { id: 2, titulo: "Manejo de Emergencias Médicas", area: "Enfermería", estado: "Publicado", colaboradores: 6, completados: 2 },
  { id: 3, titulo: "Normativa SENAMA 2025", area: "Todos", estado: "Borrador", colaboradores: 0, completados: 0 },
];

const colaboradores = [
  { nombre: "María González", area: "Cuidado", estado: "Completado", nota: 85 },
  { nombre: "Juan Pérez", area: "Enfermería", estado: "Pendiente", nota: null },
  { nombre: "Ana Torres", area: "Cuidado", estado: "Completado", nota: 72 },
  { nombre: "Carlos Ruiz", area: "Enfermería", estado: "En progreso", nota: null },
];

const archivos = [
  { nombre: "Manual de higiene personal.pdf", tipo: "pdf", duracion: "15 min lectura" },
  { nombre: "Video explicativo — técnicas básicas", tipo: "video", duracion: "8 min" },
  { nombre: "Presentación: normativa vigente", tipo: "ppt", duracion: "5 min lectura" },
];

const preguntas = [
  {
    texto: "¿Con qué frecuencia se debe realizar el lavado de manos durante el turno?",
    opciones: ["Una vez al iniciar el turno", "Antes y después de cada atención directa al residente", "Solo cuando las manos están visiblemente sucias", "Cada 2 horas independientemente de la actividad"],
    correcta: 1,
  },
  {
    texto: "¿Cuál es el tiempo mínimo recomendado para el lavado de manos con agua y jabón?",
    opciones: ["10 segundos", "20 segundos", "40 segundos", "60 segundos"],
    correcta: 1,
  },
  {
    texto: "En caso de contacto con fluidos corporales, ¿qué debe hacer primero?",
    opciones: ["Continuar la atención y lavarse al terminar", "Lavarse las manos inmediatamente y notificar al supervisor", "Usar gel antibacterial y continuar", "Esperar al término del turno para reportar"],
    correcta: 1,
  },
];

// ─── COMPONENTS ───
function Sidebar({ rol, active, onNav, onLogout }: { rol: string | null; active: string; onNav: (id: string) => void; onLogout: () => void }) {
  const adminNav = [
    { id: "dashboard", icon: "⊞", label: "Dashboard" },
    { id: "capacitaciones", icon: "📚", label: "Capacitaciones" },
    { id: "colaboradores", icon: "👥", label: "Colaboradores" },
  ];
  const portalNav = [
    { id: "portal", icon: "⊞", label: "Mis capacitaciones" },
    { id: "historial", icon: "📋", label: "Mi historial" },
  ];
  const nav = rol === "admin" ? adminNav : portalNav;
  return (
    <div style={styles.sidebar}>
      <div style={styles.sidebarLogo}>
        <div style={styles.logoMark}>A</div>
        <span style={styles.logoText}>ALUMCO</span>
      </div>
      <div style={{ flex: 1 }}>
        {nav.map((item) => (
          <div key={item.id} style={styles.navItem(active === item.id)} onClick={() => onNav(item.id)}>
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
      <div style={{ padding: "0 16px" }}>
        <div style={{ ...styles.navItem(false), borderTop: `1px solid ${COLORS.border}`, paddingTop: 16 }} onClick={onLogout}>
          <span>↩</span>
          <span>Cerrar sesión</span>
        </div>
      </div>
    </div>
  );
}

function LoginPage({ onLogin }: { onLogin: (rol: string) => void }) {
  const [hover, setHover] = useState<string | null>(null);
  return (
    <div style={styles.loginWrap}>
      <div style={styles.loginCard}>
        <div style={styles.loginLogo}>
          <div style={styles.logoMark}>A</div>
          <span style={styles.logoText}>ALUMCO Capacitación</span>
        </div>
        <div style={styles.loginTitle}>Iniciar sesión</div>
        <div style={styles.loginSub}>Sistema de Gestión del Aprendizaje</div>
        <label style={styles.label}>Correo electrónico</label>
        <input style={styles.input} defaultValue="admin@alumco.cl" placeholder="correo@alumco.cl" />
        <label style={styles.label}>Contraseña</label>
        <input style={styles.input} type="password" defaultValue="••••••••" />
        <button
          style={{ ...styles.btnPrimary, opacity: hover === "admin" ? 0.88 : 1 }}
          onMouseEnter={() => setHover("admin")}
          onMouseLeave={() => setHover(null)}
          onClick={() => onLogin("admin")}
        >
          Entrar como Administrador
        </button>
        <button
          style={{ ...styles.btnSecondary, opacity: hover === "colab" ? 0.8 : 1 }}
          onMouseEnter={() => setHover("colab")}
          onMouseLeave={() => setHover(null)}
          onClick={() => onLogin("colaborador")}
        >
          Entrar como Colaborador
        </button>
        <div style={{ marginTop: 20, fontSize: 12, color: COLORS.textDim, textAlign: "center" }}>
          Demo MVP — ONG ALUMCO · 2026
        </div>
      </div>
    </div>
  );
}

function Dashboard({ onNav }: { onNav: (id: string) => void }) {
  return (
    <div style={styles.main}>
      <div style={styles.pageTitle}>Dashboard</div>
      <div style={styles.pageSub}>Resumen general de capacitaciones — Marzo 2026</div>
      <div style={styles.statsGrid}>
        {[
          { label: "Colaboradores", value: "18", delta: "+2 este mes", color: COLORS.accent },
          { label: "Capacitaciones activas", value: "3", delta: "1 en borrador", color: COLORS.warning },
          { label: "Completadas (mes)", value: "10", delta: "↑ 25% vs febrero", color: COLORS.success },
          { label: "Certificados emitidos", value: "10", delta: "Descargables", color: "#818cf8" },
        ].map((s) => (
          <div key={s.label} style={styles.statCard}>
            <div style={styles.statLabel}>{s.label}</div>
            <div style={{ ...styles.statValue, color: s.color }}>{s.value}</div>
            <div style={{ ...styles.statDelta, color: s.color }}>{s.delta}</div>
          </div>
        ))}
      </div>
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <span style={styles.cardTitle}>Capacitaciones recientes</span>
          <button style={styles.btnSmall} onClick={() => onNav("capacitaciones")}>Ver todas</button>
        </div>
        <table style={styles.table}>
          <thead>
            <tr>{["Título", "Área", "Estado", "Progreso", ""].map((h) => <th key={h} style={styles.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {capacitaciones.map((c) => (
              <tr key={c.id}>
                <td style={styles.td}>{c.titulo}</td>
                <td style={styles.td}><span style={{ color: COLORS.textMuted }}>{c.area}</span></td>
                <td style={styles.td}><span style={styles.badge(c.estado === "Publicado" ? "green" : "yellow")}>{c.estado}</span></td>
                <td style={styles.td}>
                  {c.colaboradores > 0 ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ ...styles.progressBar(), width: 80 }}>
                        <div style={styles.progressFill(Math.round((c.completados / c.colaboradores) * 100))} />
                      </div>
                      <span style={{ fontSize: 12, color: COLORS.textMuted }}>{c.completados}/{c.colaboradores}</span>
                    </div>
                  ) : <span style={{ color: COLORS.textDim, fontSize: 13 }}>Sin asignar</span>}
                </td>
                <td style={styles.td}><button style={styles.btnGhost}>Ver detalle</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <span style={styles.cardTitle}>Colaboradores — estado reciente</span>
          <button style={styles.btnSmall} onClick={() => onNav("colaboradores")}>Ver todos</button>
        </div>
        <table style={styles.table}>
          <thead>
            <tr>{["Nombre", "Área", "Estado", "Última nota"].map((h) => <th key={h} style={styles.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {colaboradores.map((c) => (
              <tr key={c.nombre}>
                <td style={styles.td}>{c.nombre}</td>
                <td style={styles.td}><span style={{ color: COLORS.textMuted }}>{c.area}</span></td>
                <td style={styles.td}>
                  <span style={styles.badge(c.estado === "Completado" ? "green" : c.estado === "En progreso" ? "purple" : "yellow")}>{c.estado}</span>
                </td>
                <td style={styles.td}>
                  {c.nota ? <span style={{ color: c.nota >= 60 ? COLORS.success : COLORS.danger, fontWeight: 600 }}>{c.nota}%</span>
                    : <span style={{ color: COLORS.textDim }}>—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CapacitacionesPage({ onVerCapacitacion }: { onVerCapacitacion: (c: Cap) => void }) {
  return (
    <div style={styles.main}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <div style={styles.pageTitle}>Capacitaciones</div>
          <div style={styles.pageSub}>Gestiona y publica módulos de capacitación</div>
        </div>
        <button style={{ ...styles.btnSmall, fontSize: 14, padding: "8px 18px" }}>+ Nueva capacitación</button>
      </div>
      <div style={styles.card}>
        <table style={styles.table}>
          <thead>
            <tr>{["Título", "Área", "Estado", "Asignados", "Completados", ""].map((h) => <th key={h} style={styles.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {capacitaciones.map((c) => (
              <tr key={c.id}>
                <td style={{ ...styles.td, fontWeight: 500 }}>{c.titulo}</td>
                <td style={styles.td}><span style={{ color: COLORS.textMuted }}>{c.area}</span></td>
                <td style={styles.td}><span style={styles.badge(c.estado === "Publicado" ? "green" : "yellow")}>{c.estado}</span></td>
                <td style={styles.td}><span style={{ color: COLORS.textMuted }}>{c.colaboradores}</span></td>
                <td style={styles.td}>
                  {c.colaboradores > 0
                    ? <span style={{ color: COLORS.success }}>{c.completados} / {c.colaboradores}</span>
                    : <span style={{ color: COLORS.textDim }}>—</span>}
                </td>
                <td style={{ ...styles.td, display: "flex", gap: 8 }}>
                  <button style={styles.btnSmall} onClick={() => onVerCapacitacion(c)}>Ver</button>
                  <button style={styles.btnGhost}>Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TrainingView({ cap, onStartQuiz, onBack }: { cap: Cap; onStartQuiz: () => void; onBack: () => void }) {
  const [activeFile, setActiveFile] = useState(0);
  return (
    <div style={styles.main}>
      <button style={{ ...styles.btnGhost, marginBottom: 24 }} onClick={onBack}>← Volver</button>
      <div style={styles.trainingHero}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <span style={styles.badge("green")}>{cap.area}</span>
            <div style={{ fontSize: 22, fontWeight: 700, margin: "12px 0 6px" }}>{cap.titulo}</div>
            <div style={{ color: COLORS.textMuted, fontSize: 14, marginBottom: 20 }}>
              3 archivos de estudio · Evaluación disponible al finalizar
            </div>
          </div>
          <span style={styles.badge("green")}>{cap.estado}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ ...styles.progressBar(), flex: 1 }}>
            <div style={styles.progressFill(66)} />
          </div>
          <span style={{ fontSize: 13, color: COLORS.textMuted }}>2 / 3 revisados</span>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Material de estudio</div>
          <div style={styles.fileList}>
            {archivos.map((f, i) => (
              <div key={i} style={styles.fileItem(activeFile === i)} onClick={() => setActiveFile(i)}>
                <div style={styles.fileIcon(f.tipo)}>
                  {f.tipo === "pdf" ? "📄" : f.tipo === "video" ? "▶" : "📊"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 3 }}>{f.nombre}</div>
                  <div style={{ fontSize: 12, color: COLORS.textMuted }}>{f.duracion}</div>
                </div>
                {i < 2 && <span style={{ fontSize: 18, color: COLORS.success }}>✓</span>}
              </div>
            ))}
          </div>
        </div>
        <div style={{ ...styles.card, padding: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Evaluación</div>
          <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 20, lineHeight: 1.6 }}>
            3 preguntas · Nota mínima aprobación: 60% · 3 intentos disponibles
          </div>
          <div style={{ marginBottom: 16 }}>
            {["Completar el material", "Responder la evaluación", "Obtener certificado"].map((step, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, fontSize: 13 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: "50%",
                  background: i < 1 ? COLORS.success : i === 1 ? COLORS.accentGlow : COLORS.surface,
                  border: `2px solid ${i < 1 ? COLORS.success : i === 1 ? COLORS.accent : COLORS.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, color: i < 1 ? COLORS.bg : i === 1 ? COLORS.accent : COLORS.textDim,
                  fontWeight: 700, flexShrink: 0,
                }}>
                  {i < 1 ? "✓" : i + 1}
                </div>
                <span style={{ color: i === 0 ? COLORS.success : i === 1 ? COLORS.text : COLORS.textDim }}>{step}</span>
              </div>
            ))}
          </div>
          <button style={{ ...styles.btnPrimary, marginBottom: 0 }} onClick={onStartQuiz}>
            Comenzar evaluación
          </button>
        </div>
      </div>
    </div>
  );
}

function QuizPage({ onFinish }: { onFinish: (score: number) => void }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (idx: number) => {
    if (!submitted) setAnswers({ ...answers, [current]: idx });
  };

  const handleSubmit = () => {
    const correct = preguntas.filter((q, i) => answers[i] === q.correcta).length;
    const score = Math.round((correct / preguntas.length) * 100);
    setSubmitted(true);
    setTimeout(() => onFinish(score), 200);
  };

  const q = preguntas[current];
  return (
    <div style={styles.main}>
      <div style={styles.quizWrap}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 14, color: COLORS.textMuted }}>Pregunta {current + 1} de {preguntas.length}</div>
          <div style={{ display: "flex", gap: 6 }}>
            {preguntas.map((_, i) => (
              <div key={i} style={{
                width: 28, height: 6, borderRadius: 99,
                background: i === current ? COLORS.accent : i < current ? COLORS.accentDim : COLORS.border,
                cursor: "pointer",
              }} onClick={() => setCurrent(i)} />
            ))}
          </div>
        </div>
        <div style={styles.questionCard}>
          <div style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.6, marginBottom: 24 }}>{q.texto}</div>
          {q.opciones.map((op, i) => (
            <div key={i} style={styles.optionItem(answers[current] === i)} onClick={() => handleSelect(i)}>
              <div style={styles.optionDot(answers[current] === i)}>
                {answers[current] === i && <div style={styles.optionDotFill} />}
              </div>
              <span style={{ fontSize: 14 }}>{op}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <button style={{ ...styles.btnGhost, flex: 1, padding: "11px 0" }}
            onClick={() => setCurrent(Math.max(0, current - 1))} disabled={current === 0}>
            ← Anterior
          </button>
          {current < preguntas.length - 1 ? (
            <button style={{ ...styles.btnPrimary, flex: 1, marginBottom: 0 }}
              onClick={() => setCurrent(current + 1)} disabled={answers[current] === undefined}>
              Siguiente →
            </button>
          ) : (
            <button style={{ ...styles.btnPrimary, flex: 1, marginBottom: 0 }}
              onClick={handleSubmit} disabled={Object.keys(answers).length < preguntas.length}>
              Enviar evaluación
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultPage({ score, onBack }: { score: number; onBack: () => void }) {
  const passed = score >= 60;
  return (
    <div style={styles.main}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={styles.resultCard}>
          <div style={styles.resultCircle(passed)}>{passed ? "✓" : "✗"}</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
            {passed ? "¡Evaluación aprobada!" : "Evaluación no aprobada"}
          </div>
          <div style={{ fontSize: 42, fontWeight: 800, color: passed ? COLORS.success : COLORS.danger, margin: "12px 0" }}>
            {score}%
          </div>
          <div style={{ color: COLORS.textMuted, fontSize: 14, marginBottom: 32, lineHeight: 1.6 }}>
            {passed
              ? "Has completado exitosamente la capacitación. Tu certificado está disponible para descargar."
              : "No alcanzaste el puntaje mínimo de 60%. Puedes intentarlo nuevamente."}
          </div>
          {passed && <button style={{ ...styles.btnPrimary, marginBottom: 12 }}>📄 Descargar certificado</button>}
          <button style={styles.btnGhost} onClick={onBack}>
            {passed ? "Volver al portal" : "Reintentar evaluación"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PortalHome({ onVerCapacitacion }: { onVerCapacitacion: (c: Cap) => void }) {
  const misCapacitaciones = [
    { id: 1, titulo: "Protocolo de Higiene Personal", area: "Cuidado", estado: "En progreso", progreso: 66, fechaLimite: "31 mar", colaboradores: 0, completados: 0 },
    { id: 2, titulo: "Manejo de Emergencias Médicas", area: "Enfermería", estado: "Pendiente", progreso: 0, fechaLimite: "15 abr", colaboradores: 0, completados: 0 },
  ];
  return (
    <div style={styles.main}>
      <div style={styles.pageTitle}>Mis capacitaciones</div>
      <div style={styles.pageSub}>Bienvenida, María González — Residencia Hualpén</div>
      <div style={styles.portalGrid}>
        {misCapacitaciones.map((c) => (
          <div key={c.id} style={styles.portalCard} onClick={() => onVerCapacitacion(c)}>
            <div style={styles.portalCardTop}>
              <span style={styles.badge(c.estado === "En progreso" ? "purple" : "yellow")}>{c.estado}</span>
              <span style={{ fontSize: 12, color: COLORS.textMuted }}>Límite: {c.fechaLimite}</span>
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{c.titulo}</div>
            <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 16 }}>{c.area}</div>
            <div style={{ ...styles.progressBar(), marginBottom: 8 }}>
              <div style={styles.progressFill(c.progreso)} />
            </div>
            <div style={{ fontSize: 12, color: COLORS.textMuted }}>{c.progreso}% completado</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── APP ───
export default function App() {
  const [screen, setScreen] = useState("login");
  const [rol, setRol] = useState<string | null>(null);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [selectedCap, setSelectedCap] = useState<Cap | null>(null);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  const handleLogin = (r: string) => {
    setRol(r);
    setActiveNav(r === "admin" ? "dashboard" : "portal");
    setScreen("app");
  };

  const handleLogout = () => { setRol(null); setScreen("login"); setSelectedCap(null); setQuizScore(null); };
  const handleNav = (id: string) => { setActiveNav(id); setSelectedCap(null); setQuizScore(null); };
  const handleVerCapacitacion = (cap: Cap) => { setSelectedCap(cap); setActiveNav("training"); setQuizScore(null); };
  const handleStartQuiz = () => setActiveNav("quiz");
  const handleFinishQuiz = (score: number) => { setQuizScore(score); setActiveNav("result"); };

  if (screen === "login") return <div style={styles.app}><LoginPage onLogin={handleLogin} /></div>;

  let content;
  if (activeNav === "training" && selectedCap) {
    content = <TrainingView cap={selectedCap} onStartQuiz={handleStartQuiz} onBack={() => handleNav(rol === "admin" ? "capacitaciones" : "portal")} />;
  } else if (activeNav === "quiz") {
    content = <QuizPage onFinish={handleFinishQuiz} />;
  } else if (activeNav === "result" && quizScore !== null) {
    content = <ResultPage score={quizScore} onBack={() => handleNav(rol === "admin" ? "capacitaciones" : "portal")} />;
  } else if (rol === "admin") {
    if (activeNav === "dashboard") content = <Dashboard onNav={handleNav} />;
    else if (activeNav === "capacitaciones") content = <CapacitacionesPage onVerCapacitacion={handleVerCapacitacion} />;
    else content = (
      <div style={styles.main}>
        <div style={styles.pageTitle}>Colaboradores</div>
        <div style={styles.pageSub}>18 colaboradores registrados en el sistema</div>
        <div style={styles.card}>
          <table style={styles.table}>
            <thead><tr>{["Nombre", "Área", "Estado", "Última nota"].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr></thead>
            <tbody>{colaboradores.map(c => (
              <tr key={c.nombre}>
                <td style={{ ...styles.td, fontWeight: 500 }}>{c.nombre}</td>
                <td style={styles.td}><span style={{ color: COLORS.textMuted }}>{c.area}</span></td>
                <td style={styles.td}><span style={styles.badge(c.estado === "Completado" ? "green" : c.estado === "En progreso" ? "purple" : "yellow")}>{c.estado}</span></td>
                <td style={styles.td}>{c.nota ? <span style={{ color: c.nota >= 60 ? COLORS.success : COLORS.danger, fontWeight: 600 }}>{c.nota}%</span> : <span style={{ color: COLORS.textDim }}>—</span>}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    );
  } else {
    if (activeNav === "portal") content = <PortalHome onVerCapacitacion={handleVerCapacitacion} />;
    else content = (
      <div style={styles.main}>
        <div style={styles.pageTitle}>Mi historial</div>
        <div style={styles.pageSub}>Capacitaciones completadas</div>
        <div style={styles.card}>
          <table style={styles.table}>
            <thead><tr>{["Capacitación", "Fecha", "Nota", "Certificado"].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr></thead>
            <tbody>
              <tr>
                <td style={styles.td}>Inducción general — Bienvenida ONG</td>
                <td style={styles.td}><span style={{ color: COLORS.textMuted }}>Ene 2026</span></td>
                <td style={styles.td}><span style={{ color: COLORS.success, fontWeight: 600 }}>85%</span></td>
                <td style={styles.td}><button style={styles.btnSmall}>📄 Descargar</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.app}>
      <div style={styles.layout}>
        <Sidebar rol={rol} active={activeNav} onNav={handleNav} onLogout={handleLogout} />
        {content}
      </div>
    </div>
  );
}
