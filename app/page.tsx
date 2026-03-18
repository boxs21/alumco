"use client";
import { useState } from "react";

const C = {
  forest: "#1a5c4a", forestMid: "#2d7a62", forestLight: "#4aa87f",
  sage: "#a8c5b5", sagePale: "#e4ede9", teal: "#0f7ea3", tealLight: "#e0f2f9",
  ink: "#121d1a", inkSoft: "#5a6e68", muted: "#8fa49e",
  border: "#d4e2dc", surface: "#f5f9f7", white: "#ffffff",
  gold: "#c8943a", goldLight: "#fdf3e3", red: "#c0392b", redLight: "#fdecea",
};

const S = {
  app: { fontFamily: "'DM Sans','Segoe UI',sans-serif", background: C.surface, minHeight: "100vh", color: C.ink, fontSize: 14, lineHeight: 1.6 },
  layout: { display: "flex", minHeight: "100vh" },
  sidebar: { width: 240, minHeight: "100vh", background: C.ink, display: "flex", flexDirection: "column" as const, flexShrink: 0 },
  sidebarBrand: { padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 12 },
  brandIcon: { width: 38, height: 38, background: `linear-gradient(135deg,${C.forestLight},${C.teal})`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 },
  sidebarUser: { padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 10 },
  avatar: (admin: boolean) => ({ width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, color: C.white, flexShrink: 0, background: admin ? `linear-gradient(135deg,${C.forestLight},${C.teal})` : `linear-gradient(135deg,${C.gold},#e2aa56)` }),
  navItem: (active: boolean) => ({ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, color: active ? C.forestLight : "rgba(255,255,255,0.55)", background: active ? "rgba(74,168,127,0.15)" : "transparent", cursor: "pointer", fontSize: 13.5, fontWeight: active ? 500 : 400, marginBottom: 1 }),
  main: { flex: 1, display: "flex", flexDirection: "column" as const, minWidth: 0 },
  topbar: { background: C.white, borderBottom: `1px solid ${C.border}`, padding: "0 28px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky" as const, top: 0, zIndex: 50 },
  pageContent: { padding: 28, flex: 1 },
  card: { background: C.white, borderRadius: 12, border: `1.5px solid ${C.border}`, boxShadow: "0 2px 12px rgba(26,92,74,0.09)", marginBottom: 20 },
  cardHeader: { padding: "18px 22px 14px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" },
  cardBody: { padding: 22 },
  btnPrimary: { background: C.forest, color: C.white, border: "none", borderRadius: 7, padding: "11px 20px", fontWeight: 500, fontSize: 14, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 },
  btnSecondary: { background: C.sagePale, color: C.forest, border: `1.5px solid ${C.border}`, borderRadius: 7, padding: "10px 18px", fontWeight: 500, fontSize: 14, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 },
  btnGhost: { background: "transparent", color: C.inkSoft, border: "none", borderRadius: 7, padding: "7px 14px", fontSize: 13, cursor: "pointer", fontFamily: "inherit" },
  table: { width: "100%", borderCollapse: "collapse" as const },
  th: { padding: "10px 14px", textAlign: "left" as const, fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" as const, color: C.muted, borderBottom: `1.5px solid ${C.border}`, background: C.surface },
  td: { padding: "13px 14px", borderBottom: `1px solid ${C.sagePale}`, fontSize: 13, verticalAlign: "middle" as const },
  badge: (type: string) => {
    const m: Record<string, [string, string]> = { green: ["rgba(74,168,127,0.12)", C.forestMid], teal: [C.tealLight, C.teal], gold: [C.goldLight, C.gold], gray: [C.sagePale, C.muted], red: [C.redLight, C.red] };
    const [bg, color] = m[type] || m.gray;
    return { display: "inline-flex", alignItems: "center", padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 500, background: bg, color };
  },
  progressWrap: { height: 6, background: C.sagePale, borderRadius: 10, overflow: "hidden" },
  progressFill: (pct: number, color?: string) => ({ height: "100%", borderRadius: 10, width: `${pct}%`, background: color || `linear-gradient(90deg,${C.forestMid},${C.forestLight})` }),
  loginWrap: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: `linear-gradient(140deg,#0d3a2e 0%,${C.forest} 50%,${C.teal} 100%)`, padding: 16 },
  input: { width: "100%", padding: "12px 16px", border: `1.5px solid ${C.border}`, borderRadius: 7, fontFamily: "inherit", fontSize: 14, color: C.ink, background: C.surface, outline: "none", boxSizing: "border-box" as const, marginBottom: 16 },
  label: { display: "block", fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" as const, color: C.inkSoft, marginBottom: 7 },
  optionItem: (sel: boolean) => ({ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 8, marginBottom: 8, cursor: "pointer", border: `1.5px solid ${sel ? C.forestMid : C.border}`, background: sel ? "rgba(45,122,98,0.06)" : C.white, fontSize: 13.5, color: sel ? C.forest : C.ink }),
  resultBanner: (passed: boolean) => ({ textAlign: "center" as const, padding: 36, borderRadius: 12, marginBottom: 20, background: passed ? "rgba(74,168,127,0.1)" : C.redLight, border: `1.5px solid ${passed ? "rgba(74,168,127,0.25)" : "rgba(192,57,43,0.15)"}` }),
};

interface Cap { id: number; titulo: string; area: string; estado: string; colaboradores: number; completados: number; }

const capacitaciones: Cap[] = [
  { id: 1, titulo: "Protocolo de Higiene Personal", area: "Cuidado", estado: "Publicado", colaboradores: 12, completados: 8 },
  { id: 2, titulo: "Manejo de Emergencias Médicas", area: "Enfermería", estado: "Publicado", colaboradores: 6, completados: 2 },
  { id: 3, titulo: "Normativa SENAMA 2025", area: "Todos", estado: "Borrador", colaboradores: 0, completados: 0 },
];
const colaboradores = [
  { nombre: "María González", area: "Cuidado", estado: "Completado", nota: 85 as number | null },
  { nombre: "Juan Pérez", area: "Enfermería", estado: "Pendiente", nota: null as number | null },
  { nombre: "Ana Torres", area: "Cuidado", estado: "Completado", nota: 72 as number | null },
  { nombre: "Carlos Ruiz", area: "Enfermería", estado: "En progreso", nota: null as number | null },
];
const archivos = [
  { nombre: "Manual de higiene personal.pdf", tipo: "pdf", duracion: "15 min lectura" },
  { nombre: "Video explicativo — técnicas básicas", tipo: "video", duracion: "8 min" },
  { nombre: "Presentación: normativa vigente", tipo: "ppt", duracion: "5 min lectura" },
];
const preguntas = [
  { texto: "¿Con qué frecuencia se debe realizar el lavado de manos durante el turno?", opciones: ["Una vez al iniciar el turno", "Antes y después de cada atención directa al residente", "Solo cuando las manos están visiblemente sucias", "Cada 2 horas independientemente"], correcta: 1 },
  { texto: "¿Cuál es el tiempo mínimo recomendado para el lavado de manos?", opciones: ["10 segundos", "20 segundos", "40 segundos", "60 segundos"], correcta: 1 },
  { texto: "En caso de contacto con fluidos corporales, ¿qué debe hacer primero?", opciones: ["Continuar y lavarse al terminar", "Lavarse las manos inmediatamente y notificar", "Usar gel antibacterial y continuar", "Esperar al término del turno"], correcta: 1 },
];

// ─── NAV CONFIG ───
const ADMIN_NAV = [{ id: "dashboard", icon: "🏠", label: "Inicio" }, { id: "capacitaciones", icon: "📚", label: "Capacitaciones" }, { id: "colaboradores", icon: "👥", label: "Colaboradores" }];
const PORTAL_NAV = [{ id: "portal", icon: "🏠", label: "Inicio" }, { id: "miscursos", icon: "📖", label: "Mis cursos" }, { id: "historial", icon: "📜", label: "Historial" }];

// ─── SIDEBAR ───
function Sidebar({ rol, active, onNav, onLogout }: { rol: string | null; active: string; onNav: (id: string) => void; onLogout: () => void }) {
  const isAdmin = rol === "admin";
  const nav = isAdmin ? ADMIN_NAV : PORTAL_NAV;
  return (
    <div style={S.sidebar} className="sidebar-desktop">
      <div style={S.sidebarBrand}>
        <div style={S.brandIcon}>🌱</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <strong style={{ fontFamily: "Georgia,serif", fontSize: 16, color: C.white, lineHeight: 1.1 }}>ALUMCO</strong>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Capacitación</span>
        </div>
      </div>
      <div style={S.sidebarUser}>
        <div style={S.avatar(isAdmin)}>{isAdmin ? "AB" : "MG"}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <strong style={{ display: "block", fontSize: 13, color: C.white, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{isAdmin ? "Ana Beltrán" : "María González"}</strong>
          <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 20, fontWeight: 600, background: isAdmin ? "rgba(74,168,127,0.2)" : "rgba(200,148,58,0.2)", color: isAdmin ? C.forestLight : "#e2aa56" }}>{isAdmin ? "Admin" : "Colaboradora"}</span>
        </div>
      </div>
      <nav style={{ flex: 1, padding: "12px 0" }}>
        <div style={{ padding: "0 12px" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", padding: "8px 10px 4px" }}>Principal</div>
          {nav.map(item => (
            <div key={item.id} style={S.navItem(active === item.id)} onClick={() => onNav(item.id)}>
              <span style={{ fontSize: 16, width: 20, textAlign: "center", flexShrink: 0 }}>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>
      </nav>
      <div style={{ padding: 12, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={S.navItem(false)} onClick={onLogout}>
          <span style={{ fontSize: 16 }}>🚪</span> Cerrar sesión
        </div>
      </div>
    </div>
  );
}

// ─── MOBILE NAV (bottom bar) ───
function MobileNav({ rol, active, onNav, onLogout }: { rol: string | null; active: string; onNav: (id: string) => void; onLogout: () => void }) {
  const isAdmin = rol === "admin";
  const nav = isAdmin ? ADMIN_NAV : PORTAL_NAV;
  const items = [...nav, { id: "logout", icon: "🚪", label: "Salir" }];
  return (
    <div className="mobile-nav">
      {items.map(item => (
        <button key={item.id} className={`mobile-nav-item${active === item.id ? " active" : ""}`}
          onClick={() => item.id === "logout" ? onLogout() : onNav(item.id)}
          style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, cursor: "pointer", color: active === item.id ? C.forestLight : "rgba(255,255,255,0.45)", fontSize: 10, fontFamily: "inherit", border: "none", background: "transparent" }}>
          <span style={{ fontSize: 20, lineHeight: 1 }}>{item.icon}</span>
          {item.label}
        </button>
      ))}
    </div>
  );
}

// ─── LOGIN ───
function LoginPage({ onLogin }: { onLogin: (rol: string) => void }) {
  const [role, setRole] = useState("admin");
  return (
    <div style={S.loginWrap}>
      <div style={{ background: C.white, borderRadius: 20, padding: "52px 48px", width: "100%", maxWidth: 420, boxShadow: "0 32px 80px rgba(0,0,0,0.25)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 36 }}>
          <div style={{ width: 48, height: 48, background: `linear-gradient(135deg,${C.forest},${C.forestLight})`, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🌱</div>
          <div>
            <strong style={{ fontFamily: "Georgia,serif", fontSize: 22, color: C.ink, display: "block", lineHeight: 1 }}>ALUMCO</strong>
            <span style={{ fontSize: 11, color: C.muted, letterSpacing: "0.04em", textTransform: "uppercase" }}>Plataforma de Capacitación</span>
          </div>
        </div>
        <h2 style={{ fontFamily: "Georgia,serif", fontSize: 26, marginBottom: 6 }}>Bienvenido</h2>
        <p style={{ color: C.inkSoft, fontSize: 13, marginBottom: 24 }}>Ingresa a tu cuenta para continuar</p>
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {[["admin", "👤 Administrador"], ["colaborador", "📚 Colaborador"]].map(([r, label]) => (
            <button key={r} onClick={() => setRole(r)} style={{ flex: 1, padding: 10, borderRadius: 8, border: `1.5px solid ${role === r ? C.forestMid : C.border}`, background: role === r ? "rgba(45,122,98,0.07)" : C.surface, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 500, color: role === r ? C.forest : C.inkSoft }}>
              {label}
            </button>
          ))}
        </div>
        <label style={S.label}>Correo electrónico</label>
        <input style={S.input} defaultValue={role === "admin" ? "admin@alumco.cl" : "colaborador@alumco.cl"} />
        <label style={S.label}>Contraseña</label>
        <input style={S.input} type="password" defaultValue="••••••••" />
        <button style={{ ...S.btnPrimary, width: "100%", padding: "13px 0", fontSize: 15, marginTop: 6 }} onClick={() => onLogin(role)}>
          Iniciar sesión
        </button>
        <div style={{ marginTop: 20, paddingTop: 20, borderTop: `1px solid ${C.border}` }}>
          <p style={{ fontSize: 11, color: C.muted, textAlign: "center", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.04em" }}>Acceso rápido demo</p>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ ...S.btnSecondary, flex: 1, fontSize: 12 }} onClick={() => onLogin("admin")}>🔧 Admin</button>
            <button style={{ ...S.btnSecondary, flex: 1, fontSize: 12 }} onClick={() => onLogin("colaborador")}>📖 Colaborador</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD ───
function Dashboard({ onNav }: { onNav: (id: string) => void }) {
  return (
    <div style={S.pageContent} className="page-content">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }} className="stats-grid">
        {[
          { label: "Colaboradores", value: "18", icon: "👥", bg: "rgba(74,168,127,0.12)" },
          { label: "Capacitaciones activas", value: "3", icon: "📚", bg: "rgba(15,126,163,0.12)" },
          { label: "Completadas (mes)", value: "10", icon: "✅", bg: "rgba(200,148,58,0.12)" },
          { label: "Certificados emitidos", value: "10", icon: "🎓", bg: "rgba(168,197,181,0.25)" },
        ].map(s => (
          <div key={s.label} style={{ background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "20px 22px", boxShadow: "0 2px 12px rgba(26,92,74,0.09)" }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, background: s.bg, marginBottom: 10 }}>{s.icon}</div>
            <div style={{ fontFamily: "Georgia,serif", fontSize: 30, fontWeight: 700, color: C.ink, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="grid-2">
        <div style={S.card}>
          <div style={S.cardHeader}>
            <span style={{ fontFamily: "Georgia,serif", fontSize: 15 }}>Progreso por área</span>
            <span style={S.badge("green")}>Este mes</span>
          </div>
          <div style={S.cardBody}>
            {[["Cuidado", 80], ["Enfermería", 55], ["Administración", 90], ["General", 70]].map(([area, pct]) => (
              <div key={area as string} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13 }}>
                  <span>{area}</span><span style={{ fontWeight: 600, color: C.inkSoft }}>{pct}%</span>
                </div>
                <div style={S.progressWrap}><div style={S.progressFill(pct as number)} /></div>
              </div>
            ))}
          </div>
        </div>
        <div style={S.card}>
          <div style={S.cardHeader}>
            <span style={{ fontFamily: "Georgia,serif", fontSize: 15 }}>Actividad reciente</span>
            <button style={S.btnGhost} onClick={() => onNav("colaboradores")}>Ver todo →</button>
          </div>
          <div style={S.cardBody}>
            {[
              { dot: C.forestLight, action: "María González completó", curso: "Protocolo de Higiene Personal", time: "hace 10 min" },
              { dot: C.teal, action: "Ana Torres obtuvo certificado", curso: "Protocolo de Higiene Personal", time: "hace 1 hr" },
              { dot: C.gold, action: "Juan Pérez inició", curso: "Manejo de Emergencias Médicas", time: "hace 2 hr" },
            ].map((a, i, arr) => (
              <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: i < arr.length - 1 ? `1px solid ${C.sagePale}` : "none" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: a.dot, marginTop: 5, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: 13 }}>{a.action}</strong>
                  <p style={{ fontSize: 12, color: C.muted }}>{a.curso}</p>
                </div>
                <span style={{ fontSize: 11, color: C.muted, whiteSpace: "nowrap" }}>{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CAPACITACIONES (ADMIN) ───
function CapacitacionesPage({ onVerCap }: { onVerCap: (c: Cap) => void }) {
  const meta = [{ color: C.sagePale, emoji: "🧼" }, { color: C.tealLight, emoji: "🚑" }, { color: C.goldLight, emoji: "📋" }];
  return (
    <div style={S.pageContent} className="page-content">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }} className="course-grid">
        {capacitaciones.map((c, i) => (
          <div key={c.id} style={{ background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 12, overflow: "hidden", cursor: "pointer" }} onClick={() => onVerCap(c)}>
            <div style={{ height: 100, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, background: meta[i].color }}>{meta[i].emoji}</div>
            <div style={{ padding: 16 }}>
              <h4 style={{ fontFamily: "Georgia,serif", fontSize: 14, color: C.ink, marginBottom: 6, lineHeight: 1.3 }}>{c.titulo}</h4>
              <p style={{ fontSize: 12, color: C.muted }}>Área: {c.area}</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "10px 0" }}>
                <span style={S.badge("teal")}>PDF + Evaluación</span>
                <span style={S.badge(c.estado === "Publicado" ? "green" : "gold")}>{c.estado}</span>
              </div>
              {c.colaboradores > 0 && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.muted, marginBottom: 4 }}>
                    <span>Cumplimiento</span><span>{Math.round((c.completados / c.colaboradores) * 100)}%</span>
                  </div>
                  <div style={S.progressWrap}><div style={S.progressFill(Math.round((c.completados / c.colaboradores) * 100))} /></div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── COLABORADORES ───
function ColaboradoresPage() {
  return (
    <div style={S.pageContent} className="page-content">
      <div style={S.card}>
        <div style={S.cardHeader}>
          <span style={{ fontFamily: "Georgia,serif", fontSize: 15 }}>Colaboradores</span>
          <span style={S.badge("green")}>{colaboradores.length} registrados</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={S.table}>
            <thead><tr>{["Nombre", "Área", "Estado", "Nota"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {colaboradores.map(c => (
                <tr key={c.nombre}>
                  <td style={{ ...S.td, fontWeight: 500 }}>{c.nombre}</td>
                  <td style={S.td}><span style={{ color: C.muted }}>{c.area}</span></td>
                  <td style={S.td}><span style={S.badge(c.estado === "Completado" ? "green" : c.estado === "En progreso" ? "teal" : "gold")}>{c.estado}</span></td>
                  <td style={S.td}>{c.nota ? <span style={{ color: c.nota >= 60 ? C.forestMid : C.red, fontWeight: 600 }}>{c.nota}%</span> : <span style={{ color: C.muted }}>—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── TRAINING VIEW ───
function TrainingView({ cap, onStartQuiz, onBack }: { cap: Cap; onStartQuiz: () => void; onBack: () => void }) {
  const [activeFile, setActiveFile] = useState(0);
  return (
    <div style={S.pageContent} className="page-content">
      <button style={{ ...S.btnGhost, paddingLeft: 0, marginBottom: 20 }} onClick={onBack}>← Volver</button>
      <div style={{ ...S.card, background: `linear-gradient(135deg,${C.surface},#ddf0e8)`, padding: 24, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, gap: 12 }}>
          <div style={{ flex: 1 }}>
            <span style={S.badge("green")}>{cap.area}</span>
            <h2 style={{ fontFamily: "Georgia,serif", fontSize: 20, marginTop: 8, marginBottom: 6 }}>{cap.titulo}</h2>
            <p style={{ color: C.inkSoft, fontSize: 13 }}>3 archivos · Evaluación al finalizar</p>
          </div>
          <span style={S.badge(cap.estado === "Publicado" ? "green" : "gold")}>{cap.estado}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ ...S.progressWrap, flex: 1 }}><div style={S.progressFill(66)} /></div>
          <span style={{ fontSize: 12, color: C.inkSoft, whiteSpace: "nowrap" }}>2 / 3</span>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }} className="training-grid">
        <div>
          <h3 style={{ fontFamily: "Georgia,serif", fontSize: 15, marginBottom: 14 }}>Material de estudio</h3>
          {archivos.map((f, i) => (
            <div key={i} onClick={() => setActiveFile(i)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: activeFile === i ? "rgba(45,122,98,0.06)" : C.white, border: `1.5px solid ${activeFile === i ? C.forestMid : C.border}`, borderRadius: 10, cursor: "pointer", marginBottom: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, background: f.tipo === "pdf" ? C.redLight : f.tipo === "video" ? C.goldLight : C.tealLight, flexShrink: 0 }}>
                {f.tipo === "pdf" ? "📄" : f.tipo === "video" ? "▶" : "📊"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.nombre}</div>
                <div style={{ fontSize: 12, color: C.muted }}>{f.duracion}</div>
              </div>
              {i < 2 && <span style={{ color: C.forestLight, fontSize: 16, flexShrink: 0 }}>✓</span>}
            </div>
          ))}
        </div>
        <div style={{ ...S.card, padding: 20 }}>
          <h3 style={{ fontFamily: "Georgia,serif", fontSize: 15, marginBottom: 8 }}>Evaluación</h3>
          <p style={{ fontSize: 13, color: C.muted, marginBottom: 16, lineHeight: 1.6 }}>3 preguntas · Mínimo 60% · 3 intentos</p>
          <div style={{ marginBottom: 16 }}>
            {["Completar el material", "Responder la evaluación", "Obtener certificado"].map((step, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, fontSize: 13 }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: i < 1 ? C.forestLight : "transparent", border: `2px solid ${i < 1 ? C.forestLight : i === 1 ? C.forestMid : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: i < 1 ? C.white : i === 1 ? C.forestMid : C.muted, fontWeight: 700, flexShrink: 0 }}>
                  {i < 1 ? "✓" : i + 1}
                </div>
                <span style={{ color: i === 0 ? C.forestMid : i === 1 ? C.ink : C.muted }}>{step}</span>
              </div>
            ))}
          </div>
          <button style={{ ...S.btnPrimary, width: "100%" }} onClick={onStartQuiz}>Comenzar evaluación</button>
        </div>
      </div>
    </div>
  );
}

// ─── QUIZ ───
function QuizPage({ onFinish }: { onFinish: (score: number) => void }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const q = preguntas[current];
  const handleSubmit = () => {
    const correct = preguntas.filter((q, i) => answers[i] === q.correcta).length;
    onFinish(Math.round((correct / preguntas.length) * 100));
  };
  return (
    <div style={{ ...S.pageContent, maxWidth: 620 }} className="page-content quiz-wrap">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <span style={{ fontSize: 14, color: C.muted }}>Pregunta {current + 1} de {preguntas.length}</span>
        <div style={{ display: "flex", gap: 6 }}>
          {preguntas.map((_, i) => <div key={i} onClick={() => setCurrent(i)} style={{ width: 28, height: 6, borderRadius: 99, background: i === current ? C.forest : i < current ? C.forestLight : C.border, cursor: "pointer" }} />)}
        </div>
      </div>
      <div style={{ ...S.card, padding: 24, marginBottom: 16 }}>
        <p style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.6, marginBottom: 20 }}>{q.texto}</p>
        {q.opciones.map((op, i) => (
          <div key={i} style={S.optionItem(answers[current] === i)} onClick={() => setAnswers({ ...answers, [current]: i })}>
            <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${answers[current] === i ? C.forestMid : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {answers[current] === i && <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.forestMid }} />}
            </div>
            {op}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10 }} className="btn-row">
        <button style={{ ...S.btnSecondary, flex: 1 }} onClick={() => setCurrent(Math.max(0, current - 1))} disabled={current === 0}>← Anterior</button>
        {current < preguntas.length - 1
          ? <button style={{ ...S.btnPrimary, flex: 1 }} onClick={() => setCurrent(current + 1)} disabled={answers[current] === undefined}>Siguiente →</button>
          : <button style={{ ...S.btnPrimary, flex: 1 }} onClick={handleSubmit} disabled={Object.keys(answers).length < preguntas.length}>Enviar ✓</button>}
      </div>
    </div>
  );
}

// ─── RESULT ───
function ResultPage({ score, onBack }: { score: number; onBack: () => void }) {
  const passed = score >= 60;
  return (
    <div style={{ ...S.pageContent, maxWidth: 500 }} className="page-content result-wrap">
      <div style={S.resultBanner(passed)}>
        <div style={{ fontSize: 52, marginBottom: 14 }}>{passed ? "🎉" : "😔"}</div>
        <div style={{ fontFamily: "Georgia,serif", fontSize: 52, fontWeight: 700, color: passed ? C.forest : C.red, lineHeight: 1 }}>{score}%</div>
        <p style={{ marginTop: 10, fontSize: 14, color: C.inkSoft }}>{passed ? "¡Aprobaste! Tu certificado está disponible." : "No alcanzaste el mínimo de 60%. Puedes reintentar."}</p>
      </div>
      <div style={{ display: "flex", gap: 10 }} className="btn-row">
        {passed && <button style={{ ...S.btnPrimary, flex: 1 }}>📄 Descargar certificado</button>}
        <button style={{ ...S.btnSecondary, flex: 1 }} onClick={onBack}>{passed ? "Volver" : "Reintentar"}</button>
      </div>
    </div>
  );
}

// ─── PORTAL HOME ───
function PortalHome({ onVerCap }: { onVerCap: (c: Cap) => void }) {
  const misc = [
    { id: 1, titulo: "Protocolo de Higiene Personal", area: "Cuidado", estado: "En progreso", progreso: 66, fechaLimite: "31 mar", colaboradores: 0, completados: 0, emoji: "🧼", color: C.sagePale },
    { id: 2, titulo: "Manejo de Emergencias Médicas", area: "Enfermería", estado: "Pendiente", progreso: 0, fechaLimite: "15 abr", colaboradores: 0, completados: 0, emoji: "🚑", color: C.tealLight },
  ];
  return (
    <div style={S.pageContent} className="page-content">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
        {misc.map(c => (
          <div key={c.id} style={{ background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 12, overflow: "hidden", cursor: "pointer" }} onClick={() => onVerCap(c)}>
            <div style={{ height: 90, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, background: c.color }}>{c.emoji}</div>
            <div style={{ padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={S.badge(c.estado === "En progreso" ? "teal" : "gold")}>{c.estado}</span>
                <span style={{ fontSize: 12, color: C.muted }}>Límite: {c.fechaLimite}</span>
              </div>
              <h4 style={{ fontFamily: "Georgia,serif", fontSize: 14, marginBottom: 4 }}>{c.titulo}</h4>
              <p style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>{c.area}</p>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.muted, marginBottom: 4 }}>
                <span>Progreso</span><span>{c.progreso}%</span>
              </div>
              <div style={S.progressWrap}><div style={S.progressFill(c.progreso, `linear-gradient(90deg,${C.teal},#55b5d4)`)} /></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── HISTORIAL ───
function HistorialPage() {
  return (
    <div style={S.pageContent} className="page-content">
      <div style={S.card}>
        <div style={S.cardHeader}><span style={{ fontFamily: "Georgia,serif", fontSize: 15 }}>Capacitaciones completadas</span></div>
        <div style={{ overflowX: "auto" }}>
          <table style={S.table}>
            <thead><tr>{["Capacitación", "Fecha", "Nota", "Certificado"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              <tr>
                <td style={{ ...S.td, fontWeight: 500 }}>Inducción general — Bienvenida ONG</td>
                <td style={S.td}><span style={{ color: C.muted }}>Ene 2026</span></td>
                <td style={S.td}><span style={{ color: C.forestMid, fontWeight: 600 }}>85%</span></td>
                <td style={S.td}><button style={{ ...S.btnSecondary, padding: "6px 14px", fontSize: 12 }}>📄 Descargar</button></td>
              </tr>
            </tbody>
          </table>
        </div>
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

  const handleLogin = (r: string) => { setRol(r); setActiveNav(r === "admin" ? "dashboard" : "portal"); setScreen("app"); };
  const handleLogout = () => { setRol(null); setScreen("login"); setSelectedCap(null); setQuizScore(null); };
  const handleNav = (id: string) => { setActiveNav(id); setSelectedCap(null); setQuizScore(null); };
  const handleVerCap = (cap: Cap) => { setSelectedCap(cap); setActiveNav("training"); setQuizScore(null); };

  if (screen === "login") return <div style={S.app}><LoginPage onLogin={handleLogin} /></div>;

  const isAdmin = rol === "admin";
  const tbMap: Record<string, { title: string; sub: string; action?: string }> = {
    dashboard: { title: "Dashboard", sub: "Vista general" },
    capacitaciones: { title: "Capacitaciones", sub: "Catálogo de módulos", action: "+ Nueva" },
    colaboradores: { title: "Colaboradores", sub: "Gestión del personal" },
    portal: { title: "Mis capacitaciones", sub: "Bienvenida, María González" },
    miscursos: { title: "Mis cursos", sub: "Módulos asignados" },
    historial: { title: "Mi historial", sub: "Completadas" },
    training: { title: selectedCap?.titulo ?? "Capacitación", sub: selectedCap?.area ?? "" },
    quiz: { title: "Evaluación", sub: "" },
    result: { title: "Resultado", sub: "Evaluación finalizada" },
  };
  const tb = tbMap[activeNav] || { title: activeNav, sub: "" };

  let content;
  if (activeNav === "training" && selectedCap) content = <TrainingView cap={selectedCap} onStartQuiz={() => setActiveNav("quiz")} onBack={() => handleNav(isAdmin ? "capacitaciones" : "portal")} />;
  else if (activeNav === "quiz") content = <QuizPage onFinish={(s) => { setQuizScore(s); setActiveNav("result"); }} />;
  else if (activeNav === "result" && quizScore !== null) content = <ResultPage score={quizScore} onBack={() => handleNav(isAdmin ? "capacitaciones" : "portal")} />;
  else if (isAdmin) {
    if (activeNav === "dashboard") content = <Dashboard onNav={handleNav} />;
    else if (activeNav === "capacitaciones") content = <CapacitacionesPage onVerCap={handleVerCap} />;
    else content = <ColaboradoresPage />;
  } else {
    if (activeNav === "portal" || activeNav === "miscursos") content = <PortalHome onVerCap={handleVerCap} />;
    else content = <HistorialPage />;
  }

  return (
    <div style={S.app}>
      <div style={S.layout}>
        <Sidebar rol={rol} active={activeNav} onNav={handleNav} onLogout={handleLogout} />
        <div style={S.main} className="main-content">
          <div style={S.topbar} className="topbar">
            <div>
              <h3 style={{ fontFamily: "Georgia,serif", fontSize: 17, color: C.ink }}>{tb.title}</h3>
              <p style={{ fontSize: 12, color: C.muted }}>{tb.sub}</p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {tb.action && <button style={S.btnPrimary} className="topbar-action">{tb.action}</button>}
            </div>
          </div>
          {content}
        </div>
      </div>
      <MobileNav rol={rol} active={activeNav} onNav={handleNav} onLogout={handleLogout} />
    </div>
  );
}
