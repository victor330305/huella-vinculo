import { AlertTriangle, GraduationCap, Star, Home, Brain, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const specialties = [
  {
    icon: AlertTriangle,
    title: "Reactividad canina",
    description:
      "Para perros que ladran, gruñen o se abalanzan sobre otros perros, personas o estímulos del entorno. Trabajamos la causa, no el síntoma.",
    badge: "Alta demanda",
  },
  {
    icon: GraduationCap,
    title: "Educación básica",
    description:
      "Sentado, quieto, llamada y correa. Las habilidades fundamentales para una convivencia cómoda y segura con tu perro.",
    badge: "Recomendado",
  },
  {
    icon: Star,
    title: "Educación de cachorros",
    description:
      "La etapa más importante: socialización, hábitos de higiene, mordida inhibida y bases sólidas para el futuro.",
    badge: "0 a 6 meses",
  },
  {
    icon: Home,
    title: "Convivencia familiar",
    description:
      "Conductas no deseadas en el hogar, convivencia con niños y otros animales. Un ambiente tranquilo para toda la familia.",
    badge: "Familiar",
  },
  {
    icon: Brain,
    title: "Modificación de conductas",
    description:
      "Evaluación profunda y acompañamiento sostenido para cambios de conducta complejos. Cada caso es único.",
    badge: "Especializado",
  },
  {
    icon: Target,
    title: "Adiestramiento personalizado",
    description:
      "Objetivos específicos según las necesidades de tu perro y tu familia. Un programa 100% a medida.",
    badge: "A medida",
  },
];

export function SpecialtiesSection() {
  return (
    <section id="especialidades" className="py-20 bg-primary-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-accent-500 uppercase tracking-wider mb-2">
            Áreas de trabajo
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-primary-800 mb-4">
            ¿En qué te puedo ayudar?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Cada especialidad tiene un enfoque específico, siempre basado en el respeto
            y en el vínculo entre vos y tu perro.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {specialties.map((specialty) => {
            const Icon = specialty.icon;
            return (
              <div
                key={specialty.title}
                className="bg-white rounded-xl p-6 shadow-sm border border-primary-100 hover:shadow-md hover:border-primary-200 transition-all duration-200 group"
              >
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-600 mb-4 group-hover:bg-primary-200 transition-colors">
                  <Icon className="w-6 h-6" />
                </div>

                {/* Badge */}
                <div className="mb-3">
                  <Badge variant="default">{specialty.badge}</Badge>
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-primary-800 mb-2">
                  {specialty.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {specialty.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
