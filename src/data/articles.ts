import { BarChart3, TrendingUp, DollarSign, MapPin, Clock, Users, FileText, Star, AlertCircle, BookOpen, MessageCircle, Zap, Brain, Navigation, AlertTriangle, Scale, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  icon: LucideIcon;
  date: string;
  category: string;
  featured?: boolean;
  image?: string;
}

export const articles: Article[] = [
  {
    id: 'kontrola-financna-sprava-taxi',
    title: 'Kontrola finanční správy u taxi: Co musíte mít v pořádku',
    excerpt: 'Kompletní přehled co kontroluje finanční správa u taxi. EET, doklady řidiče, vozidla a sankce.',
    slug: '/kontrola-financna-sprava-taxi',
    icon: ShieldCheck,
    date: '2025-12-05',
    category: 'Legislativa',
    featured: true,
    image: '/blog/kontrola-financna-sprava-taxi.jpg'
  },
  {
    id: 'koncesia-taxisluzba-2025',
    title: 'Jak získat koncesi na taxislužbu v roce 2025',
    excerpt: 'Kompletní návod jak získat koncesi na taxislužbu v České republice. Podmínky, poplatky, postup krok za krokem.',
    slug: '/koncesia-taxisluzba-2025',
    icon: Scale,
    date: '2025-12-05',
    category: 'Legislativa',
    featured: true,
    image: '/blog/koncesia-taxisluzba-2025.jpg'
  },
  {
    id: 'index-cien-2025',
    title: 'Index cen taxislužeb v České republice 2025',
    excerpt: 'Praha je nejdražší město, Ústí nad Labem nejlevnější. Kompletní porovnání cen v 10 městech.',
    slug: '/porovnanie-cien-taxi-2024-2025',
    icon: BarChart3,
    date: '2025-11-18',
    category: 'Průzkum',
    featured: true,
    image: '/blog-images/index-cien.jpg'
  },
  {
    id: 'porovnanie-cien-taxi-2024-2025',
    title: 'Porovnání cen taxislužeb v českých městech',
    excerpt: 'Nástupní sazby od 40 Kč do 60 Kč, kilometrové tarify od 28 Kč do 40 Kč. Detailní přehled cen taxi v ČR.',
    slug: '/taxi-ceny',
    icon: FileText,
    date: '2025-10-15',
    category: 'Blog',
    featured: true,
    image: '/blog-images/porovnanie-cien.jpg'
  },
  {
    id: 'hodnotenie-vodicov',
    title: 'Jak funguje hodnocení řidičů v taxi aplikacích',
    excerpt: 'Proč můžeš jedním klikem zničit někomu práci. 4★ není dobré hodnocení - je to penalizace.',
    slug: '/hodnotenie-vodicov',
    icon: Star,
    date: '2025-09-22',
    category: 'Hodnocení',
    featured: true,
    image: '/blog-images/hodnotenie.jpg'
  },
  {
    id: 'alkohol-nocny-zivot',
    title: 'Alkohol, noční život a taxi',
    excerpt: 'Hranice mezi službou a záchrannou misí. Kdy může řidič odmítnout jízdu a jak se chovat v noci.',
    slug: '/alkohol-nocny-zivot',
    icon: AlertCircle,
    date: '2025-08-07',
    category: 'Bezpečnost',
    featured: true,
    image: '/blog-images/alkohol.jpg'
  },
  {
    id: 'komplexny-sprievodca-taxi',
    title: 'Komplexní průvodce taxislužbami v České republice',
    excerpt: 'Vše, co potřebujete vědět o taxi v ČR. Od výběru služby až po vaše práva jako zákazníka.',
    slug: '/komplexny-sprievodca-taxi',
    icon: BookOpen,
    date: '2025-07-12',
    category: 'Průvodce',
    featured: true,
    image: '/blog-images/sprievodca.jpg'
  },
  {
    id: 'komunikacia-taxikar-zakaznik',
    title: 'Jak vypadá dobrá komunikace mezi taxikářem a zákazníkem',
    excerpt: 'Jasná pravidla, slušnost a hranice, které by měly znát obě strany.',
    slug: '/komunikacia-taxikar-zakaznik',
    icon: MessageCircle,
    date: '2025-06-25',
    category: 'Komunikace',
    featured: true,
    image: '/blog-images/komunikacia.jpg'
  },
  {
    id: 'elektrifikacia-taxi',
    title: 'Elektrifikace taxislužby v České republice',
    excerpt: 'Budoucnost taxi je elektrická. Analýza trendu a výhod elektromobilů v taxislužbách.',
    slug: '/elektrifikacia-taxi',
    icon: Zap,
    date: '2025-05-09',
    category: 'Elektrifikace',
    featured: true,
    image: '/blog-images/elektricke-auta.jpg'
  },
  {
    id: 'psychologia-zakaznikov',
    title: 'Psychologie zákazníků v taxi',
    excerpt: 'Jak rozumět chování zákazníků a zlepšit kvalitu služby.',
    slug: '/psychologia-zakaznikov',
    icon: Brain,
    date: '2025-04-14',
    category: 'Psychologie',
    featured: true,
    image: '/blog-images/psycholog.jpg'
  },
  {
    id: 'taxi-navigacia',
    title: 'Taxi navigace: Jak najít nejlepší trasu',
    excerpt: 'Moderní nástroje a tipy pro efektivní navigaci ve městě.',
    slug: '/navigacia',
    icon: Navigation,
    date: '2025-03-28',
    category: 'Navigace',
    featured: true,
    image: '/blog-images/navigacia.jpg'
  },
  {
    id: 'co-musi-zniest-vodic',
    title: 'Co všechno musí snést řidič taxi',
    excerpt: 'Realita práce taxikáře - výzvy, stres a každodenní situace.',
    slug: '/co-musi-zniest-vodic',
    icon: AlertTriangle,
    date: '2025-02-11',
    category: 'Realita',
    featured: true,
    image: '/blog-images/vodic.jpg'
  },
  {
    id: 'temna-strana-bolt-uber',
    title: 'Temná stránka Boltu a Uberu',
    excerpt: 'Nižší kvalita služeb a zklamání řidičů - realita rideshare platforem.',
    slug: '/temna-strana-bolt-uber',
    icon: AlertCircle,
    date: '2025-01-20',
    category: 'Analýza',
    featured: true,
    image: '/blog-images/temna-strana.jpg'
  }
];

export const getFeaturedArticles = (): Article[] => {
  return articles.filter(article => article.featured);
};

export const getArticlesByCategory = (category: string): Article[] => {
  return articles.filter(article => article.category === category);
};

export const getLatestArticles = (count: number = 3): Article[] => {
  return articles
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, count);
};
