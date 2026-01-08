import { MapPin } from "lucide-react";
import Link from "next/link";

interface CzechCityCardProps {
  name: string;
  region: string;
  slug: string;
}

// Geographic color mapping for Czech regions
const getRegionColor = (regionName: string): string => {
  // Praha a Středočeský (střed)
  if (regionName.includes('Praha') || regionName.includes('Středočeský')) {
    return 'border-region-west';
  }
  // Moravskoslezský, Olomoucký, Zlínský (východ/Morava)
  if (regionName.includes('Moravskoslezský') || regionName.includes('Olomoucký') || regionName.includes('Zlínský')) {
    return 'border-region-east';
  }
  // Jihočeský, Vysočina, Jihomoravský (jih)
  if (regionName.includes('Jihočeský') || regionName.includes('Vysočina') || regionName.includes('Jihomoravský')) {
    return 'border-region-central';
  }
  // Plzeňský, Karlovarský, Ústecký, Liberecký, Královéhradecký, Pardubický (sever a západ)
  if (regionName.includes('Plzeňský') || regionName.includes('Karlovarský') ||
      regionName.includes('Ústecký') || regionName.includes('Liberecký') ||
      regionName.includes('Královéhradecký') || regionName.includes('Pardubický')) {
    return 'border-region-north';
  }
  return 'border-primary-yellow';
};

const getRegionAccentColor = (regionName: string): string => {
  // Praha a Středočeský (střed)
  if (regionName.includes('Praha') || regionName.includes('Středočeský')) {
    return 'bg-region-west';
  }
  // Moravskoslezský, Olomoucký, Zlínský (východ/Morava)
  if (regionName.includes('Moravskoslezský') || regionName.includes('Olomoucký') || regionName.includes('Zlínský')) {
    return 'bg-region-east';
  }
  // Jihočeský, Vysočina, Jihomoravský (jih)
  if (regionName.includes('Jihočeský') || regionName.includes('Vysočina') || regionName.includes('Jihomoravský')) {
    return 'bg-region-central';
  }
  // Plzeňský, Karlovarský, Ústecký, Liberecký, Královéhradecký, Pardubický (sever a západ)
  if (regionName.includes('Plzeňský') || regionName.includes('Karlovarský') ||
      regionName.includes('Ústecký') || regionName.includes('Liberecký') ||
      regionName.includes('Královéhradecký') || regionName.includes('Pardubický')) {
    return 'bg-region-north';
  }
  return 'bg-primary-yellow';
};

export const CzechCityCard = ({ name, region, slug }: CzechCityCardProps) => {
  const borderColor = getRegionColor(region);
  const accentColor = getRegionAccentColor(region);

  return (
    <div className="perspective-1000">
      <Link href={`/taxi/${slug}`} className="block" title={`Taxi ${name} - telefonní čísla a informace`}>
        <div className={`group relative bg-card rounded-xl md:rounded-2xl p-4 md:p-6 card-3d cursor-pointer overflow-hidden transition-all duration-300 border-l-4 ${borderColor}`}>
          {/* 3D Decorative Element */}
          <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-foreground/5 to-transparent rounded-full -mr-12 -mt-12 md:-mr-16 md:-mt-16"></div>

          <div className="relative z-10 flex items-start gap-3 md:gap-4">
            <div className={`flex-shrink-0 w-10 h-10 md:w-12 md:h-12 ${accentColor} rounded-lg md:rounded-xl flex items-center justify-center`}>
              <MapPin className="h-5 w-5 md:h-6 md:w-6 text-white" strokeWidth={2.5} />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-base md:text-lg lg:text-xl font-semibold text-foreground mb-1">
                {name}
              </h3>
              <p className="text-xs md:text-sm text-neutral-text font-medium">
                {region}
              </p>
            </div>
          </div>

          {/* 3D Hover Effect Indicator with region color */}
          <div className={`absolute bottom-0 left-0 right-0 h-1 ${accentColor} opacity-0 group-hover:opacity-50 transition-opacity duration-300`}></div>
        </div>
      </Link>
    </div>
  );
};
