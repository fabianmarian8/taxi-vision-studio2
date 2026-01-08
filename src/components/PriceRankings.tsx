import { TrendingDown, TrendingUp, DollarSign, type LucideIcon } from "lucide-react";

interface Ranking {
  mesto: string;
  cena: number;
}

interface Rankings {
  najlacnejsieNastupne: Ranking[];
  najdrahsieNastupne: Ranking[];
  najlacnejsieZaKm: Ranking[];
  najdrahsieZaKm: Ranking[];
  najlacnejsie5km: Ranking[];
  najdrahsie5km: Ranking[];
}

interface PriceRankingsProps {
  rankings: Rankings;
}

export const PriceRankings = ({ rankings }: PriceRankingsProps) => {
  const RankingCard = ({
    title,
    data,
    icon: Icon,
    type
  }: {
    title: string;
    data: Ranking[];
    icon: LucideIcon;
    type: 'cheap' | 'expensive'
  }) => {
    const bgColor = type === 'cheap' ? 'bg-green-500/10' : 'bg-red-500/10';
    const borderColor = type === 'cheap' ? 'border-green-500/20' : 'border-red-500/20';
    const iconColor = type === 'cheap' ? 'text-green-600' : 'text-red-600';

    return (
      <div className={`${bgColor} border-2 ${borderColor} rounded-xl p-6`}>
        <div className="flex items-center gap-3 mb-6">
          <div className={`${iconColor} p-2 bg-background rounded-lg`}>
            <Icon className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-foreground">{title}</h3>
        </div>

        <div className="space-y-3">
          {data.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-background rounded-lg p-3"
            >
              <div className="flex items-center gap-3">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                  ${index === 0 ? 'bg-primary text-primary-foreground' : 'bg-foreground/10 text-foreground/70'}
                `}>
                  {index + 1}
                </div>
                <span className="font-semibold text-foreground">{item.mesto}</span>
              </div>
              <span className="font-bold text-lg text-foreground">
                {item.cena.toFixed(2)} €
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Najlacnejšie nástupné */}
      <RankingCard
        title="Najlacnejšie nástupné"
        data={rankings.najlacnejsieNastupne}
        icon={TrendingDown}
        type="cheap"
      />

      {/* Najdrahšie nástupné */}
      <RankingCard
        title="Najdrahšie nástupné"
        data={rankings.najdrahsieNastupne}
        icon={TrendingUp}
        type="expensive"
      />

      {/* Najlacnejšie za km */}
      <RankingCard
        title="Najlacnejšie za km"
        data={rankings.najlacnejsieZaKm}
        icon={TrendingDown}
        type="cheap"
      />

      {/* Najdrahšie za km */}
      <RankingCard
        title="Najdrahšie za km"
        data={rankings.najdrahsieZaKm}
        icon={TrendingUp}
        type="expensive"
      />

      {/* Najlacnejšie 5km jazda */}
      <RankingCard
        title="Najlacnejšie (5km jazda)"
        data={rankings.najlacnejsie5km}
        icon={DollarSign}
        type="cheap"
      />

      {/* Najdrahšie 5km jazda */}
      <RankingCard
        title="Najdrahšie (5km jazda)"
        data={rankings.najdrahsie5km}
        icon={DollarSign}
        type="expensive"
      />
    </div>
  );
};
