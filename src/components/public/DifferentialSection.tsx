import { Heart, ClipboardList, TrendingUp } from "lucide-react";

const pillars = [
  {
    icon: Heart,
    title: "Vínculo como base",
    description:
      "Trabajamos desde la comprensión y el respeto mutuo. Nada de métodos que generen miedo o estrés.",
    color: "bg-rose-50 text-rose-600",
  },
  {
    icon: ClipboardList,
    title: "Expediente individual",
    description:
      "Cada perro tiene su historia y su plan. Documentamos todo: evaluación, objetivos, sesiones y evolución.",
    color: "bg-primary-50 text-primary-600",
  },
  {
    icon: TrendingUp,
    title: "Seguimiento real",
    description:
      "El trabajo no termina en la sesión. Acompañamos el proceso en casa con ejercicios y registro de avances.",
    color: "bg-accent-50 text-accent-600",
  },
];

export function DifferentialSection() {
  return (
    <section className="py-16 sm:py-20 bg-white" id="servicios">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Encabezado */}
        <div className="text-center mb-12">
          <span className="text-sm font-semibold text-primary-600 uppercase tracking-wider">
            ¿Por qué somos diferentes?
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-gray-900">
            Más que clases de adiestramiento
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Ofrecemos una experiencia integral donde cada propietario recibe
            orientación, acompañamiento y herramientas reales para entender a su perro.
          </p>
        </div>

        {/* Pilares */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="p-6 rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all duration-300 group"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${pillar.color}`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-700 transition-colors">
                  {pillar.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
