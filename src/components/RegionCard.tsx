import { MapPin } from "lucide-react";
import Link from "next/link";

interface RegionCardProps {
  name: string;
  slug: string;
  citiesCount: number;
}

// Geographic color mapping for Czech regions
const getRegionColor = (regionName: string): string => {
  // Central (Středočeský, Praha)
  if (regionName.includes('Středočeský') || regionName.includes('Praha')) {
    return 'border-region-west';
  }
  // East (Moravskoslezský, Zlínský, Olomoucký)
  if (regionName.includes('Moravskoslezský') || regionName.includes('Zlínský') || regionName.includes('Olomoucký')) {
    return 'border-region-east';
  }
  // South (Jihomoravský, Jihočeský, Vysočina)
  if (regionName.includes('Jihomoravský') || regionName.includes('Jihočeský') || regionName.includes('Vysočina')) {
    return 'border-region-central';
  }
  // North/West (Ústecký, Liberecký, Karlovarský, Plzeňský, Královéhradecký, Pardubický)
  if (regionName.includes('Ústecký') || regionName.includes('Liberecký') ||
      regionName.includes('Karlovarský') || regionName.includes('Plzeňský') ||
      regionName.includes('Královéhradecký') || regionName.includes('Pardubický')) {
    return 'border-region-north';
  }
  return 'border-primary-yellow';
};

const getRegionAccentColor = (regionName: string): string => {
  if (regionName.includes('Středočeský') || regionName.includes('Praha')) {
    return 'bg-region-west';
  }
  if (regionName.includes('Moravskoslezský') || regionName.includes('Zlínský') || regionName.includes('Olomoucký')) {
    return 'bg-region-east';
  }
  if (regionName.includes('Jihomoravský') || regionName.includes('Jihočeský') || regionName.includes('Vysočina')) {
    return 'bg-region-central';
  }
  if (regionName.includes('Ústecký') || regionName.includes('Liberecký') ||
      regionName.includes('Karlovarský') || regionName.includes('Plzeňský') ||
      regionName.includes('Královéhradecký') || regionName.includes('Pardubický')) {
    return 'bg-region-north';
  }
  return 'bg-primary-yellow';
};

export const RegionCard = ({ name, slug, citiesCount }: RegionCardProps) => {
  const borderColor = getRegionColor(name);
  const accentColor = getRegionAccentColor(name);

  return (
    <div className="perspective-1000">
      <Link href={`/kraj/${slug}`} className="block" title={`Taxislužby v kraji ${name}`}>
        <div className={`group relative bg-card rounded-lg md:rounded-xl p-2 md:p-4 card-3d cursor-pointer overflow-hidden transition-all duration-300 border-l-4 ${borderColor}`}>
          {/* 3D Decorative Element */}
          <div className="absolute top-0 right-0 w-14 h-14 md:w-20 md:h-20 bg-gradient-to-br from-foreground/5 to-transparent rounded-full -mr-7 -mt-7 md:-mr-10 md:-mt-10"></div>

          <div className="relative z-10 flex items-start gap-2 md:gap-2">
            <div className={`flex-shrink-0 w-6 h-6 md:w-7 md:h-7 ${accentColor} rounded-md md:rounded-lg flex items-center justify-center`}>
              <MapPin className="h-3 w-3 md:h-4 md:w-4 text-white" strokeWidth={2.5} />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-xs md:text-sm lg:text-base font-semibold text-foreground mb-1">
                {name}
              </h3>
              <p className="text-[11px] md:text-xs text-neutral-text font-medium">
                {citiesCount} {citiesCount === 1 ? 'město' : citiesCount < 5 ? 'města' : 'měst'}
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
