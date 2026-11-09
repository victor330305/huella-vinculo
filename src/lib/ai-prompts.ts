// ─── Types ────────────────────────────────────────────────────────────────────

interface SessionForAI {
  date: Date
  type: string
  status: string
  durationMinutes: number
  observations: string | null
  notes: string | null
}

interface ExerciseLogForAI {
  practicedAt: Date
  note: string | null
}

interface ExerciseForAI {
  name: string
  objective: string
  instructions: string
  status: string
  frequency: string | null
  professionalNotes: string | null
  logs: ExerciseLogForAI[]
}

interface BehaviorLogForAI {
  date: Date
  location: string | null
  situation: string
  stimulus: string | null
  distance: string | null
  behavior: string
  ownerResponse: string | null
  recoveryTime: string | null
  comments: string | null
}

interface ReportForAI {
  generatedAt: Date
  initialState: string | null
  objectives: string | null
  activitiesPerformed: string | null
  changesObserved: string | null
  pendingDifficulties: string | null
  nextObjectives: string | null
}

interface DogProfileForAI {
  initialEvaluation: string | null
  background: string | null
  identifiedNeeds: string | null
  agreedObjectives: string | null
  workPlan: string | null
  homeRecommendations: string | null
}

export interface DogForAI {
  name: string
  breed: string
  sex: 'MALE' | 'FEMALE'
  birthDate: Date | null
  approximateAge: string | null
  weight: number | null
  notes: string | null
  profile: DogProfileForAI | null
  sessions: SessionForAI[]
  exercises: ExerciseForAI[]
  behaviorLogs: BehaviorLogForAI[]
  reports: ReportForAI[]
}

// ─── System restrictions block ────────────────────────────────────────────────

const SYSTEM_RESTRICTIONS = `IMPORTANTE - Restricciones del asistente:
- No diagnosticar trastornos de conducta
- No clasificar niveles de agresividad
- No recomendar tratamientos médicos ni farmacológicos
- No reemplazar el criterio del profesional
- Toda respuesta es un borrador para revisión profesional
- Responder siempre en español`

// ─── Prompt builders ──────────────────────────────────────────────────────────

export function buildSummaryPrompt(dog: DogForAI): string {
  const recentSessions = dog.sessions.slice(0, 10)
  const recentLogs = dog.behaviorLogs.slice(0, 10)

  const data = {
    perro: {
      nombre: dog.name,
      raza: dog.breed,
      sexo: dog.sex === 'MALE' ? 'Macho' : 'Hembra',
      fechaNacimiento: dog.birthDate,
      edadAproximada: dog.approximateAge,
      peso: dog.weight,
      notas: dog.notes,
    },
    expediente: dog.profile,
    ultimasSesiones: recentSessions,
    ejercicios: dog.exercises.map((ex) => ({
      nombre: ex.name,
      objetivo: ex.objective,
      estado: ex.status,
      frecuencia: ex.frequency,
      prácticasRecientes: ex.logs.slice(0, 5),
    })),
    registrosDiario: recentLogs,
  }

  return `${SYSTEM_RESTRICTIONS}

Datos del perro:
${JSON.stringify(data, null, 2)}

Tarea: Resumí en español el historial de este perro en 3-4 párrafos concisos. Destacá el progreso observado, las dificultades actuales y los objetivos pendientes. No emitas diagnósticos ni clasificaciones de agresividad.`
}

export function buildNextSessionPrompt(dog: DogForAI): string {
  const recentSessions = dog.sessions.slice(0, 10)
  const recentLogs = dog.behaviorLogs.slice(0, 10)

  const data = {
    perro: {
      nombre: dog.name,
      raza: dog.breed,
      sexo: dog.sex === 'MALE' ? 'Macho' : 'Hembra',
      notas: dog.notes,
    },
    expediente: dog.profile,
    ultimasSesiones: recentSessions,
    ejercicios: dog.exercises.map((ex) => ({
      nombre: ex.name,
      objetivo: ex.objective,
      estado: ex.status,
      frecuencia: ex.frequency,
    })),
    registrosDiario: recentLogs,
  }

  return `${SYSTEM_RESTRICTIONS}

Datos del perro:
${JSON.stringify(data, null, 2)}

Tarea: En base al historial de este perro, sugerí en español 3-5 puntos concretos para trabajar en la próxima sesión. Basate solo en lo registrado. No diagnostiques.`
}

export function buildReportDraftPrompt(dog: DogForAI): string {
  const data = {
    perro: {
      nombre: dog.name,
      raza: dog.breed,
      sexo: dog.sex === 'MALE' ? 'Macho' : 'Hembra',
      fechaNacimiento: dog.birthDate,
      edadAproximada: dog.approximateAge,
      peso: dog.weight,
      notas: dog.notes,
    },
    expediente: dog.profile,
    todasLasSesiones: dog.sessions,
    ejercicios: dog.exercises.map((ex) => ({
      nombre: ex.name,
      objetivo: ex.objective,
      instrucciones: ex.instructions,
      estado: ex.status,
      frecuencia: ex.frequency,
      notasDelProfesional: ex.professionalNotes,
      prácticas: ex.logs,
    })),
    registrosDiario: dog.behaviorLogs,
    informesAnteriores: dog.reports,
  }

  return `${SYSTEM_RESTRICTIONS}

Datos del perro:
${JSON.stringify(data, null, 2)}

Tarea: Redactá en español un borrador de informe de evolución para el propietario. Estructurá la respuesta con exactamente estos encabezados:

## Estado inicial
[descripción]

## Objetivos acordados
[descripción]

## Actividades realizadas
[descripción]

## Cambios observados
[descripción]

## Dificultades pendientes
[descripción]

## Próximos objetivos
[descripción]

Usá un tono profesional y empático. Este es un borrador para que la educadora revise y edite antes de enviar al propietario.`
}

export function buildExerciseSuggestionsPrompt(dog: DogForAI, specialty: string): string {
  const data = {
    perro: {
      nombre: dog.name,
      raza: dog.breed,
      sexo: dog.sex === 'MALE' ? 'Macho' : 'Hembra',
      notas: dog.notes,
    },
    objetivosDelExpediente: dog.profile
      ? {
          objetivosAcordados: dog.profile.agreedObjectives,
          necesidadesIdentificadas: dog.profile.identifiedNeeds,
          planDeTrabajo: dog.profile.workPlan,
        }
      : null,
    ejerciciosActuales: dog.exercises.map((ex) => ({
      nombre: ex.name,
      objetivo: ex.objective,
      estado: ex.status,
    })),
  }

  return `${SYSTEM_RESTRICTIONS}

Datos del perro:
${JSON.stringify(data, null, 2)}

Tarea: Sugerí en español 3 ejercicios concretos para trabajar ${specialty} con este perro. Para cada ejercicio indicá: nombre, objetivo, instrucciones paso a paso y frecuencia recomendada. Basate en métodos de refuerzo positivo.`
}
