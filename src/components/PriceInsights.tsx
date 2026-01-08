import { TrendingUp, TrendingDown, DollarSign, BarChart3, type LucideIcon } from "lucide-react";

interface Insight {
  title: string;
  description: string;
  icon: string;
}

interface PriceInsightsProps {
  insights: Insight[];
}

const iconMap: Record<string, LucideIcon> = {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
};

export const PriceInsights = ({ insights }: PriceInsightsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {insights.map((insight, index) => {
        const Icon = iconMap[insight.icon] || BarChart3;
        
        return (
          <div
            key={index}
            className="bg-card rounded-xl p-6 card-3d"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-lg flex-shrink-0">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-foreground mb-2 text-lg">
                  {insight.title}
                </h3>
                <p className="text-sm text-foreground/70 leading-relaxed">
                  {insight.description}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
