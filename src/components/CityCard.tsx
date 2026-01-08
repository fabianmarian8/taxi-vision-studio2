import { MapPin } from "lucide-react";

interface CityCardProps {
  name: string;
  country?: string;
}

export const CityCard = ({ name, country }: CityCardProps) => {
  return (
    <div className="perspective-1000">
      <div className="group relative bg-card rounded-xl md:rounded-2xl p-4 md:p-6 card-3d cursor-pointer overflow-hidden">
        {/* 3D Decorative Element */}
        <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-foreground/5 to-transparent rounded-full -mr-12 -mt-12 md:-mr-16 md:-mt-16"></div>

        <div className="relative z-10 flex items-start gap-3 md:gap-4">
          <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-foreground rounded-lg md:rounded-xl flex items-center justify-center">
            <MapPin className="h-5 w-5 md:h-6 md:w-6 text-background" strokeWidth={2.5} />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base md:text-lg lg:text-xl font-black text-foreground mb-1">
              {name}
            </h3>
            {country && (
              <p className="text-xs md:text-sm text-foreground/70 font-bold">
                {country}
              </p>
            )}
          </div>
        </div>

        {/* 3D Hover Effect Indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-foreground/0 via-foreground/20 to-foreground/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
    </div>
  );
};
