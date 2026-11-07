import { CheckCircle2, Award, Heart } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const values = [
  {
    icon: Heart,
    title: "Respeto",
    description:
      "Cada perro es un ser con su propia historia. El respeto por su individualidad es el punto de partida de todo trabajo.",
  },
  {
    icon: CheckCircle2,
    title: "Paciencia",
    description:
      "El aprendizaje lleva tiempo. Acompañamos el proceso sin apuros, celebrando cada pequeño avance.",
  },
  {
    icon: Award,
    title: "Conocimiento",
    description:
      "Formación continua en etología, bienestar animal y modificación de conductas para ofrecerte lo mejor.",
  },
];

export function AboutSection() {
  return (
    <section id="sobre-mi" className="py-20 bg-primary-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Columna izquierda — imagen placeholder */}
          <div className="flex flex-col items-center lg:items-start">
            <div className="relative mb-6">
              {/* Avatar grande con iniciales */}
              <div className="w-48 h-48 rounded-full bg-primary-200 flex items-center justify-center ring-4 ring-primary-300 shadow-lg">
                <span className="text-4xl font-bold text-primary-700">PS</span>
              </div>
              {/* Decoración */}
              <div className="absolute -bottom-3 -right-3 w-16 h-16 rounded-full bg-accent-400 opacity-20" />
            </div>

            {/* Nombre y título */}
            <h3 className="text-2xl font-bold text-primary-800 mb-1">Paula Soledad</h3>
            <p className="text-primary-600 font-medium mb-4">Educadora canina</p>

            {/* Avatar alternativo para pantallas más pequeñas */}
            <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm border border-primary-100">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-primary-200 text-primary-700 font-semibold text-sm">
                  PS
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold text-primary-800">Paula Soledad</p>
                <p className="text-xs text-gray-500">Huella & Vínculo</p>
              </div>
            </div>
          </div>

          {/* Columna derecha — texto */}
          <div>
            <p className="text-sm font-semibold text-accent-500 uppercase tracking-wider mb-2">
              Quién soy
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-primary-800 mb-6">
              Educación canina desde el vínculo
            </h2>

            <div className="space-y-4 text-gray-600 leading-relaxed mb-8">
              <p>
                Soy Paula Soledad, educadora canina especializada en reactividad. Mi camino
                comenzó con la necesidad de entender a mi propio perro, y hoy acompaño a
                familias a construir una relación más sana y comunicativa con los suyos.
              </p>
              <p>
                Me formo de manera continua en etología aplicada, bienestar animal y
                modificación de conductas. Actualmente profundizando en adiestramiento
                avanzado, siempre con un enfoque empático y libre de castigos.
              </p>
              <p>
                Creo que entender al perro —su lenguaje, sus necesidades, sus miedos— es lo
                que realmente transforma la convivencia. Por eso trabajo con vos y con él,
                juntos.
              </p>
            </div>

            {/* Valores */}
            <div className="space-y-4">
              {values.map((value) => {
                const Icon = value.icon;
                return (
                  <div key={value.title} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-primary-800 mb-0.5">{value.title}</p>
                      <p className="text-sm text-gray-600">{value.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
