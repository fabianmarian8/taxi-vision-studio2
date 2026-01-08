import { Search, MapPin, Car } from "lucide-react";
import { GeometricLines } from "./GeometricLines";

export const HowItWorks = () => {
  const steps = [
    {
      icon: Search,
      title: "Vyhledejte vaše město",
      description: "Zadejte vaše město nebo použijte aktuální polohu",
    },
    {
      icon: MapPin,
      title: "Najděte v okolí",
      description: "Okamžitě zobrazíte dostupné taxíky ve vaší oblasti",
    },
    {
      icon: Car,
      title: "Získejte svoz",
      description: "Spojte se s místními taxislužbami rychle",
    },
  ];

  return (
    <section id="how-it-works" className="py-7 md:py-12 lg:py-14 relative">
      <GeometricLines variant="subtle" count={6} />
      <div className="container mx-auto px-2 md:px-5 relative z-10">
        <div className="text-center mb-5 md:mb-7 lg:mb-10">
          <h2 className="text-xl md:text-3xl lg:text-4xl font-black mb-2 md:mb-4 text-foreground">
            Jak to funguje
          </h2>
          <p className="text-xs md:text-sm text-foreground font-bold max-w-2xl mx-auto px-2">
            Najít taxi nikdy nebylo tak jednoduché
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 md:gap-5 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={index}
              className="text-center group"
            >
              <div className="perspective-1000 mb-2 md:mb-4">
                <div className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-full bg-card card-3d">
                  <step.icon className="h-5 w-5 md:h-6 md:w-6 lg:h-7 lg:w-7 text-foreground" strokeWidth={2.5} />
                </div>
              </div>

              <div className="space-y-1 md:space-y-1.5">
                <div className="text-[11px] md:text-xs font-black text-foreground mb-1 md:mb-1.5">
                  Krok {index + 1}
                </div>
                <h3 className="text-sm md:text-base lg:text-lg font-black mb-1.5 md:mb-2 text-foreground">
                  {step.title}
                </h3>
                <p className="text-xs md:text-sm text-foreground/70 font-medium px-2 md:px-0">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
