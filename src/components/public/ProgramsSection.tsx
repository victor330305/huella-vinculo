import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5491100000000";

const programs = [
  {
    title: "Primeros pasos con tu cachorro",
    badge: "0 a 6 meses",
    description:
      "El momento ideal para sentar las bases. Socialización, mordida inhibida, higiene y hábitos saludables desde el principio.",
    includes: [
      "Evaluación inicial gratuita",
      "Socialización guiada",
      "Bases de educación",
      "Guía de rutinas para el hogar",
    ],
    featured: false,
  },
  {
    title: "Aprendiendo a pasear juntos",
    badge: "Reactividad en paseo",
    description:
      "Para los que el paseo se convirtió en una lucha. Trabajamos la reactividad y la correa para que salir sea un placer.",
    includes: [
      "Evaluación de reactividad",
      "Técnicas de desensibilización",
      "Manejo de correa",
      "Ejercicios para practicar en casa",
    ],
    featured: true,
  },
  {
    title: "Mejor convivencia en casa",
    badge: "Conductas no deseadas",
    description:
      "Saltos, ladridos en casa, destrozos, ansiedad de separación. Un programa para que la convivencia sea más tranquila.",
    includes: [
      "Análisis de conductas",
      "Plan de manejo ambiental",
      "Rutinas y enriquecimiento",
      "Seguimiento por WhatsApp",
    ],
    featured: false,
  },
  {
    title: "Comprendiendo la reactividad",
    badge: "Perros reactivos",
    description:
      "Un programa específico para perros con reactividad hacia otros perros o personas, con enfoque empático y progresivo.",
    includes: [
      "Evaluación conductual profunda",
      "Plan de modificación gradual",
      "Acompañamiento presencial",
      "Soporte entre sesiones",
    ],
    featured: false,
  },
  {
    title: "Educación canina personalizada",
    badge: "A medida",
    description:
      "¿Tenés objetivos específicos? Diseñamos un programa completamente adaptado a las necesidades únicas de tu perro y familia.",
    includes: [
      "Diagnóstico individualizado",
      "Objetivos acordados juntos",
      "Sesiones a tu ritmo",
      "Plan flexible y ajustable",
    ],
    featured: false,
  },
];

export function ProgramsSection() {
  return (
    <section id="programas" className="py-20 bg-cream">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-accent-500 uppercase tracking-wider mb-2">
            Programas
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-primary-800 mb-4">
            Encontrá el programa ideal
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Cada programa está pensado para una situación específica, siempre con
            seguimiento personalizado incluido.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program) => (
            <Card
              key={program.title}
              className={
                program.featured
                  ? "border-primary-300 shadow-md ring-1 ring-primary-200"
                  : "border-primary-200 hover:shadow-md transition-shadow"
              }
            >
              <CardHeader className="pb-3">
                {program.featured && (
                  <div className="mb-2">
                    <Badge variant="accent">Más solicitado</Badge>
                  </div>
                )}
                <div className="mb-2">
                  <Badge variant="outline">{program.badge}</Badge>
                </div>
                <CardTitle className="text-primary-800 text-lg leading-snug">
                  {program.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="pb-4">
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  {program.description}
                </p>
                <ul className="space-y-1.5">
                  {program.includes.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hola Paula, me interesa el programa "${program.title}"`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button
                    variant={program.featured ? "default" : "outline"}
                    className={
                      program.featured
                        ? "w-full bg-primary-500 hover:bg-primary-600 text-white"
                        : "w-full border-primary-300 text-primary-700 hover:bg-primary-50"
                    }
                  >
                    Consultar
                  </Button>
                </a>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
