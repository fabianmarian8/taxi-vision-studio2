export interface FAQItem {
  question: string;
  answer: string;
}

// City-specific FAQs - prázdné, používáme defaultní FAQ pro všechna města
export const citySpecificFAQs: Record<string, FAQItem[]> = {};

// Default FAQ items for cities without specific FAQs (fallback)
// isVillage parameter rozlišuje mezi městem a obcí
export const getDefaultFAQItems = (cityName: string, isVillage: boolean = false): FAQItem[] => {
  const locationText = isVillage ? 'v obci' : 've městě';
  const locationTextShort = isVillage ? 'obci' : 'městě';

  return [
    {
      question: `Jak si objednám taxi ${locationText} ${cityName}?`,
      answer: `Taxi ${locationText} ${cityName} si můžete objednat telefonicky, přes webovou stránku taxislužby nebo mobilní aplikaci. Na naší stránce najdete kontaktní údaje na dostupné taxislužby.`
    },
    {
      question: `Kolik stojí jízda taxíkem ${locationText} ${cityName}?`,
      answer: `Cena taxislužby závisí na vzdálenosti, času jízdy a konkrétní taxislužbě. Většina taxíků má základní poplatek a cenu za kilometr. Přesné ceníky si můžete ověřit přímo u vybrané taxislužby.`
    },
    {
      question: `Jsou taxislužby ${locationText} ${cityName} dostupné nonstop?`,
      answer: `Většina taxislužeb ${locationText} ${cityName} poskytuje služby 24 hodin denně, 7 dní v týdnu. Některé menší taxislužby mohou mít omezený provozní čas. Doporučujeme ověřit si dostupnost přímo u zvolené taxislužby.`
    },
    {
      question: `Mohu platit kartou v taxi ${locationText} ${cityName}?`,
      answer: `Většina moderních taxislužeb ${locationText} ${cityName} akceptuje platby kartou. Při objednávání je vhodné ověřit si formy platby, které daná taxislužba akceptuje.`
    },
    {
      question: `Jak poznám legální taxislužbu ${locationText} ${cityName}?`,
      answer: `Naše stránka je pouze databáze kontaktů na taxislužby a není poskytovatelem ani ověřovatelem těchto služeb. Doporučujeme vám před jízdou si ověřit legitimitu taxislužby - legální taxi má označené vozidlo s logem, jmenovkou řidiče a ceníkem viditelným v interiéru vozidla.`
    },
    {
      question: `Mohu si předem rezervovat taxi ${locationText} ${cityName}?`,
      answer: `Ano, většina taxislužeb ${locationText} ${cityName} nabízí možnost předem si rezervovat taxi na konkrétní čas. Stačí kontaktovat vybranou taxislužbu telefonicky nebo přes web.`
    }
  ];
};
