const steps = [
  {
    number: 1,
    title: "Evaluación inicial gratuita",
    description:
      "La primera sesión no tiene costo. Nos juntamos para conocer a tu perro, entender su historia y escuchar tus inquietudes. Sin compromiso.",
  },
  {
    number: 2,
    title: "Plan personalizado",
    description:
      "Diseñamos un programa adaptado a las necesidades reales de tu perro y de tu familia. No existe un método único para todos.",
  },
  {
    number: 3,
    title: "Sesiones de trabajo",
    description:
      "Acompañamiento presencial con Paula. Trabajamos juntos para que vos también aprendas a comunicarte con tu perro.",
  },
  {
    number: 4,
    title: "Seguimiento entre sesiones",
    description:
      "Te enviamos ejercicios para practicar en casa y estamos disponibles por WhatsApp para consultas entre encuentros.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="como-funciona" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-accent-500 uppercase tracking-wider mb-2">
            El proceso
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-primary-800 mb-4">
            ¿Cómo trabajamos?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Un proceso claro, transparente y adaptado a vos desde el primer día.
          </p>
        </div>

        {/* Steps — horizontal en desktop, vertical en mobile */}
        <div className="relative">
          {/* Línea conectora — solo visible en desktop */}
          <div className="hidden lg:block absolute top-8 left-0 right-0 h-0.5 bg-primary-100" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((step) => (
              <div key={step.number} className="relative flex flex-col items-center text-center lg:items-center">
                {/* Número */}
                <div className="relative z-10 w-16 h-16 rounded-full bg-primary-500 text-white flex items-center justify-center text-xl font-bold shadow-md mb-5 shrink-0">
                  {step.number}
                </div>

                {/* Contenido */}
                <h3 className="text-lg font-semibold text-primary-800 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
