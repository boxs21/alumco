// seed.mjs — Run: node --env-file=.env.local scripts/seed.mjs
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// ─── Config — edit this freely ───────────────────────────────────────────────

const PROFESORES = [
  { name: "Carlos Muñoz",      email: "carlos.munoz@alumco.cl",      sede: "CONCEPCION" },
  { name: "Patricia Vidal",    email: "patricia.vidal@alumco.cl",    sede: "COYHAIQUE"  },
  { name: "Roberto Álvarez",   email: "roberto.alvarez@alumco.cl",   sede: "CONCEPCION" },
  { name: "Claudia Herrera",   email: "claudia.herrera@alumco.cl",   sede: "COYHAIQUE"  },
  { name: "Andrés Cisternas",  email: "andres.cisternas@alumco.cl",  sede: "CONCEPCION" },
];

const COLABORADORES = [
  { name: "Ana Torres",        email: "ana.torres@alumco.cl",        sede: "CONCEPCION", area: "Cuidado"        },
  { name: "Luis Pérez",        email: "luis.perez@alumco.cl",        sede: "CONCEPCION", area: "Enfermería"     },
  { name: "Sofía Rojas",       email: "sofia.rojas@alumco.cl",       sede: "CONCEPCION", area: "Administración" },
  { name: "Miguel Fuentes",    email: "miguel.fuentes@alumco.cl",    sede: "COYHAIQUE",  area: "Cuidado"        },
  { name: "Daniela Soto",      email: "daniela.soto@alumco.cl",      sede: "COYHAIQUE",  area: "Enfermería"     },
  { name: "Valentina Castro",  email: "valentina.castro@alumco.cl",  sede: "CONCEPCION", area: "Cuidado"        },
  { name: "Jorge Espinoza",    email: "jorge.espinoza@alumco.cl",    sede: "CONCEPCION", area: "Cuidado"        },
  { name: "Camila Navarro",    email: "camila.navarro@alumco.cl",    sede: "CONCEPCION", area: "Enfermería"     },
  { name: "Felipe Morales",    email: "felipe.morales@alumco.cl",    sede: "CONCEPCION", area: "Administración" },
  { name: "Isabel Contreras",  email: "isabel.contreras@alumco.cl",  sede: "CONCEPCION", area: "Cuidado"        },
  { name: "Rodrigo Salinas",   email: "rodrigo.salinas@alumco.cl",   sede: "CONCEPCION", area: "Enfermería"     },
  { name: "Marcela Ortega",    email: "marcela.ortega@alumco.cl",    sede: "COYHAIQUE",  area: "Cuidado"        },
  { name: "Pablo Riquelme",    email: "pablo.riquelme@alumco.cl",    sede: "COYHAIQUE",  area: "Cuidado"        },
  { name: "Francisca Leiva",   email: "francisca.leiva@alumco.cl",   sede: "COYHAIQUE",  area: "Enfermería"     },
  { name: "Tomás Vergara",     email: "tomas.vergara@alumco.cl",     sede: "COYHAIQUE",  area: "Administración" },
  { name: "Javiera Medina",    email: "javiera.medina@alumco.cl",    sede: "COYHAIQUE",  area: "Cuidado"        },
  { name: "Cristóbal Reyes",   email: "cristobal.reyes@alumco.cl",   sede: "COYHAIQUE",  area: "Enfermería"     },
  { name: "Natalia Campos",    email: "natalia.campos@alumco.cl",    sede: "CONCEPCION", area: "Cuidado"        },
  { name: "Héctor Gutiérrez",  email: "hector.gutierrez@alumco.cl",  sede: "COYHAIQUE",  area: "Cuidado"        },
  { name: "Paola Sepúlveda",   email: "paola.sepulveda@alumco.cl",   sede: "CONCEPCION", area: "Administración" },
  { name: "Ignacio Flores",    email: "ignacio.flores@alumco.cl",    sede: "COYHAIQUE",  area: "Enfermería"     },
  { name: "Andrea Bravo",      email: "andrea.bravo@alumco.cl",      sede: "CONCEPCION", area: "Enfermería"     },
];

const DEFAULT_PASSWORD = "Alumco2024!";

const TRAININGS = [
  {
    title: "Primeros Auxilios Básicos",
    description: "Conceptos fundamentales de primeros auxilios en residencias de adultos mayores.",
    target_area: "Cuidado",
    sede: null, // null = ambas sedes
    status: "PUBLISHED",
    quiz: {
      passing_score: 70,
      max_attempts: 3,
      questions: [
        {
          text: "¿Cuál es el primer paso al encontrar a una persona inconsciente?",
          options: [
            { text: "Verificar seguridad del entorno", correct: true },
            { text: "Llamar a familiares",             correct: false },
            { text: "Mover a la persona",              correct: false },
            { text: "Dar agua",                        correct: false },
          ],
        },
        {
          text: "¿Cuántas compresiones torácicas se realizan por ciclo de RCP?",
          options: [
            { text: "15", correct: false },
            { text: "30", correct: true  },
            { text: "20", correct: false },
            { text: "10", correct: false },
          ],
        },
        {
          text: "¿Qué posición se usa para paciente inconsciente que respira?",
          options: [
            { text: "Posición lateral de seguridad", correct: true  },
            { text: "Decúbito prono",                correct: false },
            { text: "Sentado",                       correct: false },
            { text: "De pie",                        correct: false },
          ],
        },
      ],
    },
  },
  {
    title: "Técnicas de Comunicación con Adultos Mayores",
    description: "Estrategias de comunicación efectiva y empática con personas mayores.",
    target_area: "Cuidado",
    sede: "CONCEPCION",
    status: "PUBLISHED",
    quiz: {
      passing_score: 60,
      max_attempts: 2,
      questions: [
        {
          text: "¿Qué elemento es clave en la comunicación con adultos mayores?",
          options: [
            { text: "Hablar rápido para no cansarlos", correct: false },
            { text: "Mantener contacto visual y hablar despacio", correct: true },
            { text: "Evitar el contacto físico siempre",          correct: false },
            { text: "Usar términos médicos complejos",            correct: false },
          ],
        },
        {
          text: "¿Cómo se debe responder ante una persona con demencia que está agitada?",
          options: [
            { text: "Ignorarla hasta que se calme",        correct: false },
            { text: "Hablar en voz alta y firme",          correct: false },
            { text: "Mantener calma y redirigir la atención", correct: true },
            { text: "Dejarla sola",                        correct: false },
          ],
        },
      ],
    },
  },
  {
    title: "Manejo Seguro de Medicamentos",
    description: "Protocolos de administración y registro de medicamentos en la residencia.",
    target_area: "Enfermería",
    sede: "COYHAIQUE",
    status: "PUBLISHED",
    quiz: {
      passing_score: 80,
      max_attempts: 3,
      questions: [
        {
          text: "¿Cuántos correctos se verifican al administrar un medicamento?",
          options: [
            { text: "3", correct: false },
            { text: "5", correct: false },
            { text: "10", correct: true },
            { text: "7", correct: false },
          ],
        },
        {
          text: "¿Qué se hace si el residente rechaza el medicamento?",
          options: [
            { text: "Forzar la administración",      correct: false },
            { text: "Registrar y notificar al médico", correct: true },
            { text: "Saltarse la dosis sin registrar", correct: false },
            { text: "Darlo en la siguiente comida",   correct: false },
          ],
        },
      ],
    },
  },
  {
    title: "Prevención de Caídas en Residencias",
    description: "Identificación de riesgos y protocolos de prevención de caídas.",
    target_area: "Cuidado",
    sede: null,
    status: "PUBLISHED",
    quiz: {
      passing_score: 70,
      max_attempts: 3,
      questions: [
        {
          text: "¿Cuál es el factor ambiental más común en caídas de adultos mayores?",
          options: [
            { text: "Mala iluminación y pisos mojados", correct: true  },
            { text: "Ruido excesivo",                   correct: false },
            { text: "Temperatura del ambiente",         correct: false },
            { text: "Colores de las paredes",           correct: false },
          ],
        },
        {
          text: "Tras una caída, ¿cuál es la acción inmediata correcta?",
          options: [
            { text: "Levantar al residente rápidamente",       correct: false },
            { text: "Evaluar consciencia y llamar ayuda",      correct: true  },
            { text: "Esperar a que se levante solo",           correct: false },
            { text: "Aplicar frío inmediatamente en la zona",  correct: false },
          ],
        },
        {
          text: "¿Qué dispositivo reduce el riesgo de fractura de cadera?",
          options: [
            { text: "Bastón",             correct: false },
            { text: "Protector de cadera", correct: true  },
            { text: "Silla de ruedas",    correct: false },
            { text: "Andador",            correct: false },
          ],
        },
      ],
    },
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function log(msg) { console.log(`  ${msg}`); }
function ok(msg)  { console.log(`  ✓ ${msg}`); }
function err(msg) { console.error(`  ✗ ${msg}`); }

async function getSedes() {
  const { data, error } = await supabase.from("sedes").select("id, slug");
  if (error) throw new Error("No se pudieron obtener sedes: " + error.message);
  const map = {};
  for (const s of data) map[s.slug] = s.id;
  return map;
}

async function createUser(email, name, role, sedeId) {
  // Try to create; if exists, fetch existing
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: DEFAULT_PASSWORD,
    email_confirm: true,
    user_metadata: { name },
  });

  if (error) {
    if (error.message.includes("already been registered") || error.code === "email_exists") {
      const { data: list } = await supabase.auth.admin.listUsers();
      const existing = list?.users?.find((u) => u.email === email);
      if (existing) return existing.id;
    }
    throw new Error(`createUser(${email}): ${error.message}`);
  }

  const uid = data.user.id;

  // Update profile
  const { error: pe } = await supabase
    .from("profiles")
    .update({ name, role, sede_id: sedeId })
    .eq("id", uid);

  if (pe) err(`profile update(${email}): ${pe.message}`);

  return uid;
}

async function createTraining(t, sedeMap, adminId) {
  const sedeId = t.sede ? sedeMap[t.sede] : null;

  const { data: tr, error } = await supabase
    .from("trainings")
    .insert({
      title: t.title,
      description: t.description,
      target_area: t.target_area,
      status: t.status,
      sede_id: sedeId,
      created_by: adminId,
    })
    .select("id")
    .single();

  if (error) throw new Error(`training(${t.title}): ${error.message}`);

  const trainingId = tr.id;

  // Quiz
  if (t.quiz) {
    const { data: qz, error: qe } = await supabase
      .from("quizzes")
      .insert({
        training_id: trainingId,
        passing_score: t.quiz.passing_score,
        max_attempts: t.quiz.max_attempts,
      })
      .select("id")
      .single();

    if (qe) throw new Error(`quiz(${t.title}): ${qe.message}`);

    const quizId = qz.id;

    for (let i = 0; i < t.quiz.questions.length; i++) {
      const q = t.quiz.questions[i];
      const { data: qrow, error: qre } = await supabase
        .from("questions")
        .insert({ quiz_id: quizId, text: q.text, order: i })
        .select("id")
        .single();

      if (qre) throw new Error(`question(${q.text}): ${qre.message}`);

      const opts = q.options.map((o) => ({
        question_id: qrow.id,
        text: o.text,
        is_correct: o.correct,
      }));

      const { error: oe } = await supabase.from("options").insert(opts);
      if (oe) throw new Error(`options(${q.text}): ${oe.message}`);
    }
  }

  return trainingId;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n🌱 ALUMCO Seed Script\n");

  // Get sedes
  const sedeMap = await getSedes();
  ok(`Sedes: ${Object.keys(sedeMap).join(", ")}`);

  // Get or find an admin to use as created_by
  const { data: adminProfiles } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "ADMIN")
    .limit(1);
  const adminId = adminProfiles?.[0]?.id ?? null;
  if (!adminId) console.warn("  ⚠ No hay admin — created_by será null");

  // Create profesores
  console.log("\n👨‍🏫 Creando profesores...");
  const profIds = [];
  for (const p of PROFESORES) {
    try {
      const id = await createUser(p.email, p.name, "PROFESOR", sedeMap[p.sede]);
      ok(`${p.name} (${p.email})`);
      profIds.push(id);
    } catch (e) {
      err(e.message);
    }
  }

  // Create colaboradores
  console.log("\n👥 Creando colaboradores...");
  const colabIds = [];
  for (const c of COLABORADORES) {
    try {
      const id = await createUser(c.email, c.name, "COLLABORATOR", sedeMap[c.sede]);
      // Update area
      await supabase.from("profiles").update({ area: c.area }).eq("id", id);
      ok(`${c.name} (${c.email}) — ${c.sede} / ${c.area}`);
      colabIds.push({ id, ...c });
    } catch (e) {
      err(e.message);
    }
  }

  // Create trainings
  console.log("\n📚 Creando capacitaciones...");
  const trainingIds = [];
  for (const t of TRAININGS) {
    try {
      const id = await createTraining(t, sedeMap, adminId);
      ok(`${t.title} (sede: ${t.sede ?? "AMBAS"})`);
      trainingIds.push({ id, ...t });
    } catch (e) {
      err(e.message);
    }
  }

  // Assign all trainings to all colaboradores (INDIVIDUAL)
  console.log("\n📋 Creando asignaciones...");
  let assignCount = 0;
  for (const training of trainingIds) {
    const targetSede = training.sede;
    const eligible = colabIds.filter((c) => !targetSede || c.sede === targetSede);

    for (const colab of eligible) {
      const { error } = await supabase.from("assignments").insert({
        training_id: training.id,
        user_id: colab.id,
        target_type: "INDIVIDUAL",
        status: "PENDING",
      });
      if (!error) assignCount++;
    }
  }
  ok(`${assignCount} asignaciones creadas`);

  console.log(`\n✅ Seed completo!`);
  console.log(`   Password por defecto: ${DEFAULT_PASSWORD}`);
  console.log(`   Cambia los datos en scripts/seed.mjs según necesites\n`);
}

main().catch((e) => { console.error("\n❌", e.message); process.exit(1); });
