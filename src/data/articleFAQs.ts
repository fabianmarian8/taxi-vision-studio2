export interface FAQItem {
  question: string;
  answer: string;
}

export const articleFAQs: Record<string, FAQItem[]> = {
  'porovnanie-cien-taxi-2024-2025': [
    {
      question: 'Jaké jsou průměrné ceny taxi v České republice?',
      answer: 'Nástupní sazby se pohybují od 15 Kč do 90 Kč, kilometrové tarify od 20 Kč do 38 Kč. Nejdražší jsou taxi v Praze a Brně, nejlevnější v menších městech.'
    },
    {
      question: 'Proč jsou ceny taxi v Praze vyšší než v jiných městech?',
      answer: 'Vyšší ceny v Praze jsou způsobeny vyššími provozními náklady (nájmy, pohonné hmoty, mzdy), hustější dopravou a větší poptávkou. Navíc pražské taxi služby často nabízejí vyšší standard vozidel.'
    },
    {
      question: 'Jak zjistit cenu jízdy před objednáním taxi?',
      answer: 'Většina moderních taxi aplikací (Bolt, Uber, Hopin) zobrazuje odhadovanou cenu před potvrzením objednávky. U klasických taxislužeb si můžete cenu vyžádat telefonicky u dispečinku.'
    },
    {
      question: 'Jsou ceny taxi regulovány státem?',
      answer: 'V ČR nejsou ceny taxi centrálně regulovány. Každá taxislužba si stanovuje vlastní ceník, který musí být viditelně umístěn ve vozidle. Existují pouze doporučené maximální sazby v některých městech.'
    },
    {
      question: 'Kdy jsou taxi dražší - přes den nebo v noci?',
      answer: 'Mnoho taxislužeb má vyšší sazby v nočních hodinách (obvykle 22:00-06:00) a během víkendů. Noční příplatek může být 20-50% vyšší oproti denním cenám.'
    },
    {
      question: 'Je výhodnější používat taxi aplikace nebo klasické taxislužby?',
      answer: 'Aplikace jako Bolt a Uber mají často nižší ceny díky větší konkurenci a efektivnějšímu systému. Klasické taxislužby mohou být výhodnější pro pravidelné zákazníky nebo při specifických požadavcích (např. větší vozidlo, přeprava zboží).'
    }
  ],

  'hodnotenie-vodicov': [
    {
      question: 'Proč je hodnocení 4★ považováno za špatné?',
      answer: 'V systémech jako Uber a Bolt je průměrné hodnocení řidičů kolem 4,8-4,9★. Hodnocení 4★ znamená, že řidič je pod průměrem a může čelit sankcím nebo deaktivaci účtu. Pro aplikace je "dobrý" řidič ten s hodnocením alespoň 4,7★.'
    },
    {
      question: 'Může mě řidič ohodnotit jako zákazníka?',
      answer: 'Ano, většina taxi aplikací umožňuje oboustranné hodnocení. Řidiči mohou hodnotit zákazníky, což ovlivňuje pravděpodobnost, že je jiní řidiči přijmou. Zákazníci s nízkým hodnocením mohou mít problém získat jízdu.'
    },
    {
      question: 'Co se stane řidiči s nízkým hodnocením?',
      answer: 'Řidiči s hodnocením pod určitou hranicí (obvykle 4,5-4,6★) dostávají varování. Při opakovaném nízkém hodnocení může dojít k dočasnému pozastavení účtu nebo úplné deaktivaci. Řidiči také dostávají méně objednávek.'
    },
    {
      question: 'Jak bych měl hodnotit jízdu, pokud byla v pořádku?',
      answer: 'Pokud byla jízda bez problémů - řidič jezdil bezpečně, byl slušný, auto bylo čisté - vždy dejte 5★. Nižší hodnocení si nechte jen pro skutečné problémy (nebezpečná jízda, neslušnost, nečistota). Hodnocení 4★ není komplement, ale kritika.'
    },
    {
      question: 'Mohu změnit hodnocení po odeslání?',
      answer: 'Většina aplikací neumožňuje změnu hodnocení po jeho odeslání. Proto je důležité hodnotit zodpovědně. V některých případech můžete kontaktovat zákaznickou podporu, ale změna není zaručena.'
    },
    {
      question: 'Ovlivňuje moje hodnocení jen řidiče nebo i taxislužbu?',
      answer: 'Hodnocení ovlivňuje primárně konkrétního řidiče. U klasických taxislužeb se hodnocení vztahuje na celou společnost. U rideshare aplikací (Uber, Bolt) má každý řidič individuální hodnocení.'
    }
  ],

  'alkohol-nocny-zivot': [
    {
      question: 'Může řidič odmítnout opilého zákazníka?',
      answer: 'Ano, řidič má právo odmítnout přepravu zákazníka, pokud se obává o svou bezpečnost, čistotu vozidla nebo pokud zákazník vykazuje agresivní chování. Lehká opilost není důvod k odmítnutí, ale zvracení, agresivita nebo neschopnost komunikace jsou oprávněné důvody.'
    },
    {
      question: 'Co se stane, když mi bude ve vozidle špatně?',
      answer: 'Pokud dojde ke znečištění vozidla (zvracení), řidiči obvykle účtují poplatek za čištění (1250-5000 Kč podle rozsahu). U taxi aplikací jde poplatek automaticky z vaší karty. Pokud cítíte nevolnost, okamžitě řidiči oznamte, aby mohl zastavit.'
    },
    {
      question: 'Jsou taxi v noci dražší?',
      answer: 'Ano, většina taxislužeb má vyšší sazby v nočních hodinách (obvykle 22:00-06:00). Noční příplatek může být 20-50% vyšší. Rideshare aplikace používají "surge pricing" - ceny rostou při vysoké poptávce (víkendové noci, svátky).'
    },
    {
      question: 'Musím řidiči dát spropitné po noční jízdě?',
      answer: 'Spropitné není povinné, ale je oceňováno, zejména pokud řidič prokázal trpělivost, pomoc nebo profesionalitu. Po noční jízdě s opilými zákazníky je spropitné 10-15% běžným standardem. V aplikacích můžete dát spropitné elektronicky.'
    },
    {
      question: 'Mohu si vzít do taxi alkohol k pití během jízdy?',
      answer: 'Ne, konzumace alkoholu během jízdy je ve většině taxi zakázána. Řidič má právo tuto jízdu ukončit. Přeprava uzavřených lahví alkoholu (např. z večírku) je obvykle povolena.'
    },
    {
      question: 'Co dělat, když řidič odmítne jízdu kvůli mému stavu?',
      answer: 'Pokud řidič odmítne jízdu, máte právo objednat si jiné taxi. Snažte se být slušní a respektujte rozhodnutí řidiče - jejich bezpečnost a vlastnictví vozidla jsou oprávněné důvody. V aplikacích můžete zkusit jinou službu. Agresivita situaci jen zhorší.'
    }
  ],

  'komplexny-sprievodca-taxi': [
    {
      question: 'Jak si vybrat spolehlivou taxislužbu?',
      answer: 'Vyberte službu s dobrými recenzemi, viditelným ceníkem a oficiálním označením. Upřednostněte ověřené společnosti s dlouhodobou historií nebo známé aplikace (Uber, Bolt, Hopin). Vyhýbejte se neoznačeným vozidlům a řidičům bez legitimace.'
    },
    {
      question: 'Jaká jsou moje práva jako zákazník taxi?',
      answer: 'Máte právo na bezpečnou přepravu, jasnou cenu stanovenou předem, účtenku, viditelný ceník ve vozidle a volbu trasy. Řidič musí mít viditelnou identifikaci. Můžete odmítnout jízdu, pokud nesouhlasíte s podmínkami.'
    },
    {
      question: 'Co dělat v případě problému s řidičem?',
      answer: 'Zdokumentujte problém (číslo vozidla, jméno řidiče, čas), kontaktujte zákaznickou podporu taxislužby a nahlaste incident. V aplikacích použijte funkci nahlášení problému. Při vážných incidentech (nebezpečná jízda, obtěžování) kontaktujte policii.'
    },
    {
      question: 'Mohu platit taxi kartou?',
      answer: 'Většina moderních taxislužeb a všechny rideshare aplikace akceptují platbu kartou. U klasických taxíků si formu platby ověřte při objednávání. Aplikace obvykle vyžadují uloženou kartu a platba probíhá automaticky.'
    },
    {
      question: 'Je bezpečné používat taxi aplikace?',
      answer: 'Ano, taxi aplikace jsou všeobecně bezpečné. Nabízejí sledování jízdy v reálném čase, sdílení polohy, hodnocení řidičů a záznam všech jízd. Řidiči jsou ověření a identifikovaní. Vždy si ověřte, že nastupujete do správného vozidla (značka, SPZ, jméno řidiče).'
    },
    {
      question: 'Mohu taxi objednat předem?',
      answer: 'Ano, většina taxislužeb umožňuje rezervaci předem. Klasické služby nabízejí telefonickou rezervaci, aplikace mají funkci "naplánovaná jízda". Ideální pro cesty na letiště, důležité schůzky nebo časné ranní hodiny.'
    }
  ],

  'komunikacia-taxikar-zakaznik': [
    {
      question: 'Musím se bavit s řidičem během jízdy?',
      answer: 'Ne, komunikace není povinná. Mnoho řidičů respektuje, že zákazníci chtějí mít klid. Pokud chcete ticho, můžete zdvořile naznačit (sluchátka, práce na telefonu). Dobrý řidič vycítí vaši náladu.'
    },
    {
      question: 'Mohu řidiči říct, jak má jezdit?',
      answer: 'Můžete navrhnout preferovanou trasu, pokud znáte lepší cestu. Kritika stylu jízdy je vhodná jen při nebezpečném chování. Řidič je profesionál - zbytečné komentování rychlosti nebo manévrů je neslušné, pokud nejede nebezpečně.'
    },
    {
      question: 'Mohu požádat řidiče o přestávku?',
      answer: 'Ano, při delších jízdách můžete požádat o krátkou přestávku (toaleta, nákup). Upozorněte řidiče předem. Taxametr běží i během přestávky. U aplikací to může ovlivnit finální cenu.'
    },
    {
      question: 'Co dělat, když řidič používá telefon během jízdy?',
      answer: 'Pokud řidič telefonuje bez hands-free nebo píše zprávy, máte právo ho upozornit. Je to nejen neslušné, ale také nebezpečné a protizákonné. Pokud odmítne přestat, můžete jízdu ukončit a nahlásit incident.'
    },
    {
      question: 'Mohu měnit trasu během jízdy?',
      answer: 'Ano, můžete požádat o změnu cíle nebo přidání zastávky. Upozorněte řidiče předem, ideálně před začátkem jízdy. U aplikací změna cíle upraví cenu. Časté změny mohou řidiče frustrovat, komunikujte jasně.'
    },
    {
      question: 'Musím dát řidiči spropitné?',
      answer: 'Spropitné není povinné, ale je oceňováno při kvalitní službě. Běžný standard je 10-15% z ceny jízdy, při výjimečné pomoci (těžká zavazadla, dlouhé čekání) více. V aplikacích můžete dát spropitné elektronicky.'
    }
  ],

  'elektrifikacia-taxi': [
    {
      question: 'Jsou elektrické taxíky levnější než běžné taxi?',
      answer: 'Ne nezbytně pro zákazníka. Elektrická vozidla mají nižší provozní náklady (elektřina vs. benzín, méně údržby), ale vysoké pořizovací ceny. Některé služby nabízejí nižší ceny na podporu ekologické dopravy, ale není to pravidlem.'
    },
    {
      question: 'Kolik elektrických taxi je v České republice?',
      answer: 'Počet roste, ale stále tvoří menšinu. V Praze a Brně je více elektrotaxíků díky Bolt Green a iniciativám měst. Přesná čísla nejsou veřejná, odhady hovoří o 5-10% elektrických vozidel v taxi flotile.'
    },
    {
      question: 'Mají elektrické taxi dostatečný dojezd?',
      answer: 'Moderní elektrická vozidla (Tesla Model 3, VW ID.4, Hyundai Kona Electric) mají dojezd 300-500 km, což je více než dostačující pro městskou taxislužbu. Řidiči nabíjejí během přestávek, problémem není dojezd, ale dostupnost rychlých nabíječek.'
    },
    {
      question: 'Proč není více elektrických taxi?',
      answer: 'Vysoká pořizovací cena vozidel (750 000-1 250 000 Kč), nedostatečná nabíjecí infrastruktura a obava z dojezdu jsou hlavní překážky. Mnoho řidičů pracuje s pronajatými vozidly, kde elektrické opce jsou limitované.'
    },
    {
      question: 'Jsou elektrické taxi ekologičtější?',
      answer: 'Ano, elektrická vozidla nemají lokální emisie a jsou tišší. Ekologická stopa závisí na zdroji elektřiny - v ČR s vysokým podílem jaderné a vodní energie jsou emisie výrazně nižší než u spalovacích motorů.'
    },
    {
      question: 'Bude budoucnost taxi plně elektrická?',
      answer: 'Ano, trend směřuje k elektromobilitě. EU plánuje zákaz prodeje nových spalovacích vozidel do 2035. Města podporují elektrické taxi dotacemi a zvýhodněným přístupem. Do 10-15 let budou elektrické taxi dominovat.'
    }
  ],

  'psychologia-zakaznikov': [
    {
      question: 'Proč někteří zákazníci mlčí a jiní jsou velmi upovídaní?',
      answer: 'Je to kombinace osobnosti, nálady a situace. Introverti preferují ticho, extroverti rádi komunikují. Ranní jízdy = méně řečí, večer po akci = více. Jako řidič respektujte signály zákazníka.'
    },
    {
      question: 'Jak řidič pozná, že zákazník chce mít klid?',
      answer: 'Signály: sluchátka, práce na telefonu/notebooku, kniha, krátké odpovědi, pohled z okna. Dobrý řidič po úvodním pozdravu vycítí náladu. Pokud zákazník nechce konverzaci, respektujte to.'
    },
    {
      question: 'Proč někteří zákazníci ignorují řidiče?',
      answer: 'Není to vždy neslušnost. Mohou být zaneprázdněni (pracovní hovor), unavení, ve stresu nebo jednoduše preferují ticho. Kulturní rozdíly také hrají roli. Nebrat to osobně.'
    },
    {
      question: 'Jsou obchodníci arogantní více než ostatní zákazníci?',
      answer: 'Ne nezbytně. Obchodní zákazníci často řeší pracovní věci během jízdy (hovory, maily), proto potřebují se soustředit. To neznamená aroganci, ale prioritizaci času. Očekávají profesionalitu a efektivitu.'
    },
    {
      question: 'Proč někteří zákazníci kritizují jízdu řidiče?',
      answer: 'Důvody: stres, potřeba kontroly, špatné zkušenosti z minulosti, nebo skutečně nebezpečná jízda. Jako řidič klidně vyslechněte kritiku. Pokud je oprávněná, upravte jízdu. Pokud ne, vysvětlete profesionálně.'
    },
    {
      question: 'Jak může řidič zlepšit zákaznickou zkušenost?',
      answer: 'Čisté auto, příjemná vůně, tichá hudba (nebo na požádání), nabídka nabíječky telefonu, láhev vody, respektování soukromí. Přizpůsobte se zákazníkovi - někteří chtějí konverzaci, jiní ticho. Profesionalita = flexibilita.'
    }
  ],

  'taxi-navigacia': [
    {
      question: 'Je lepší navigace nebo lokální znalost řidiče?',
      answer: 'Ideální je kombinace obou. Navigace poskytuje real-time info o dopravě, lokální znalost zahrnuje zkratky, objížďky a specifika města. Zkušený řidič ví, kdy ignorovat navigaci a použít lepší trasu.'
    },
    {
      question: 'Proč Waze někdy navrhuje horší trasy než Google Maps?',
      answer: 'Waze se soustředí na reálný čas a community hlášení, Google Maps má lepší historická data. Waze může posílat na komplikované objížďky, Google volí stabilnější trasy. Záleží na situaci - v zácpách vyhraje Waze, u předvídatelných tras Google.'
    },
    {
      question: 'Mohu řidiči říct, aby použil jinou trasu?',
      answer: 'Ano, pokud znáte lepší cestu, zdvořile to navrhněte. Dobrý řidič vysvětlí svou volbu (aktuální doprava, zkušenost) nebo použije vaši trasu. Konečné rozhodnutí je na řidiči - je zodpovědný za bezpečnost.'
    },
    {
      question: 'Proč někteří řidiči nedůvěřují navigaci?',
      answer: 'Špatné zkušenosti: navigace zavedla na špatnou cestu, neaktuální mapy, technické problémy. Zkušení řidiči vědí, že navigace není neomylná, zejména v menších městech s nedostatečným mapováním. Proto kombinují navigaci se znalostmi.'
    },
    {
      question: 'Co dělat, když se řidič ztratí i přes navigaci?',
      answer: 'Pomozte řidiči - použijte vlastní navigaci, zavolejte na cílové místo pro instrukce. Kritika nepomůže. Chyba se může stát komukoliv (špatná adresa, nepřístupná ulice). Řešte konstruktivně, ne konfrontačně.'
    },
    {
      question: 'Jakou navigaci používají profesionální řidiči?',
      answer: 'Google Maps a Waze jsou nejčastější. Google je spolehlivější pro přesné adresy, Waze lepší pro vyhýbání se dopravě. Řidiči často přepínají mezi oběma podle situace. Někteří používají Sygic nebo Here Maps.'
    }
  ],

  'co-musi-zniest-vodic': [
    {
      question: 'Jaké jsou nejčastější problémy řidičů taxi?',
      answer: 'Dlouhé pracovní hodiny (10-12h denně), nízké výdělky po odečtení nákladů, stres z dopravy, nezodpovědní zákazníci, neustálé sezení, nejisté příjmy. Aplikace přidávají tlak na hodnocení a provize.'
    },
    {
      question: 'Kolik reálně vydělá řidič taxi?',
      answer: 'Po odečtení nákladů (PHM, údržba, pojištění, provize aplikací) čistý zisk je 125-250 Kč/hod. Při 10hodinové směně je to 1250-2500 Kč/den, tedy 25 000-50 000 Kč/měsíc. Vyšší výdělky vyžadují více hodin nebo špičková období.'
    },
    {
      question: 'Proč jsou řidiči někdy nepřístupní nebo nervózní?',
      answer: 'Stres z neustálé jízdy, finanční starosti, nedostatek spánku, opakované negativní zkušenosti se zákazníky. Představte si 10 hodin v zácpách s tlakem vydělat. Není to omluva, ale vysvětlení.'
    },
    {
      question: 'Mohou řidiči odmítnout jízdu?',
      answer: 'Ano, při oprávněných důvodech: bezpečnost, podezření z podvodu, agresivní chování, znečištění vozidla. V aplikacích časté odmítání snižuje hodnocení řidiče, proto to dělají jen v krajních případech.'
    },
    {
      question: 'Jak dlouho vydrží řidič taxi v profesi?',
      answer: 'Průměr je 3-5 let. Fyzická a psychická náročnost, nízké výdělky a nejistota vedou k vysoké fluktuaci. Dlouhodobí řidiči jsou buď majitelé vlastní licence/firmy nebo ti, kdo našli stabilní klientelu.'
    },
    {
      question: 'Co mohu udělat, abych řidiči usnadnil práci?',
      answer: 'Buďte přesní s adresou, připravení na nástup, zdvořilí, nerušte zbytečně, zaplaťte promptně, dejte spravedlivé hodnocení. Pokud řidič pomohl se zavazadly nebo byl výjimečně slušný, spropitné je oceněno.'
    }
  ],

  'koncesia-taxisluzba-2025': [
    {
      question: 'Kolik stojí koncese na taxislužbu?',
      answer: 'Správní poplatek za udělení koncese na taxislužbu je 750 Kč. Průkaz řidiče taxislužby stojí 1250 Kč. Při urychleném rozhodnutí (do 5 dnů) se platí trojnásobek poplatku.'
    },
    {
      question: 'Na jak dlouho se vydává koncese?',
      answer: 'Koncese na taxislužbu se vydává na 10 let. Po uplynutí je potřeba požádat o novou koncesi.'
    },
    {
      question: 'Potřebuji koncesi i když jezdím přes Bolt nebo Uber?',
      answer: 'Ano, digitální platformy jen zprostředkují objednávku, ale samotná přeprava je právně taxislužba. Řidič musí mít koncesi, průkaz řidiče a vozidlo zařazené jako taxi.'
    },
    {
      question: 'Mohu jezdit taxi se slovenskou nebo polskou SPZ?',
      answer: 'Ne, od 1. ledna 2025 lze taxislužbu provozovat jen vozidly evidovanými v České republice.'
    },
    {
      question: 'Jaké jsou pokuty za jízdu bez koncese?',
      answer: 'Při porušování pravidel hrozí pokuty od 2500 do 375 000 Kč, při opakovaném porušení až do 1 250 000 Kč a odebrání koncese.'
    },
    {
      question: 'Potřebuji odbornou způsobilost na taxislužbu?',
      answer: 'Ne, od novely zákona účinné od 1. 4. 2019 se požadavky na finanční spolehlivost a odbornou způsobilost nevztahují na taxislužbu.'
    }
  ],

  'kontrola-financna-sprava-taxi': [
    {
      question: 'Co kontroluje finanční správa u taxi?',
      answer: 'Kontroloři ověřují eKasu a pokladní doklady, průkaz řidiče taxislužby, kopii koncesní listiny, označení vozidla (střešní svítidlo, ceník) a daňová přiznání.'
    },
    {
      question: 'Jaké jsou pokuty za porušení předpisů u taxi?',
      answer: 'Pokuty se pohybují od 2500 Kč za menší nedostatky až po 750 000 Kč při opakovaném porušení. Za jízdu bez koncese hrozí pokuta do 375 000 Kč a při recidivě až 1 250 000 Kč.'
    },
    {
      question: 'Musí mít každý taxikář eKasu?',
      answer: 'Ano, od 1. 7. 2019 je eKasa povinná pro všechny podnikatele v taxislužbě. Každá hotovostní platba musí být zaznamenána v online pokladně.'
    },
    {
      question: 'Co když řidič nemá u sebe všechny doklady?',
      answer: 'Za nepředložení dokladů při kontrole hrozí pokuta. Řidič musí mít vždy u sebe průkaz řidiče taxislužby, kopii koncesní listiny a technický průkaz vozidla.'
    },
    {
      question: 'Jak často dělá finanční správa kontroly taxi?',
      answer: 'Kontroly jsou pravidelné, zejména během celostátních akcí jako "Akce TAXI". V roce 2024 byly v ČR odhaleny stovky porušení při takových kontrolách.'
    },
    {
      question: 'Co dělat během kontroly finanční správou?',
      answer: 'Spolupracujte, předložte všechny požadované doklady, neodmítejte kontrolu. Při pochybnostech žádejte služební průkaz kontrolora a zápis z kontroly.'
    }
  ],

  'temna-strana-bolt-uber': [
    {
      question: 'Proč řidiči Bolt/Uber vydělávají méně?',
      answer: 'Platformy si berou 20-30% provizi z každé jízdy. Navíc ceny jsou často nižší než u klasických taxíků kvůli konkurenci. Po odečtení PHM, údržby a pojištění čistý zisk řidičů je 125-200 Kč/hod, což je blízko minimální mzdy.'
    },
    {
      question: 'Je pravda, že Bolt/Uber manipulují s cenami?',
      answer: '"Surge pricing" (zvýšené ceny při vysoké poptávce) je legální, ale netransparentní. Ceny mohou být 2-3x vyšší během špiček. Zákazníci platí více, ale řidiči z toho moc nevidí - většinu zisku bere platforma.'
    },
    {
      question: 'Proč klesá kvalita služeb Bolt/Uber?',
      answer: 'Tlak na ceny vede k tomu, že řidiči šetří na údržbě, starší auta, méně času na čištění. Vícero řidičů pracuje na více platformách současně, což snižuje pozornost. Zoufalství z nízkých výdělků ovlivňuje přístup.'
    },
    {
      question: 'Jsou klasické taxislužby lepší než Bolt/Uber?',
      answer: 'Záleží. Klasické taxi mají často vyšší standard (profesionální řidiči, lepší auta, jasný ceník), ale jsou dražší. Bolt/Uber jsou levnější a pohodlnější (aplikace, platba kartou), ale kvalita je variabilní.'
    },
    {
      question: 'Proč Bolt/Uber deaktivují řidiče bez vysvětlení?',
      answer: 'Automatizované systémy hodnocení a stížností mohou vést k deaktivaci bez lidského posouzení. Nízké hodnocení, časté zrušení, stížnosti zákazníků = deaktivace. Odvolání je možné, ale zřídka úspěšné. Řidiči jsou nahraditelní.'
    },
    {
      question: 'Jaká je budoucnost Bolt/Uber v České republice?',
      answer: 'Dominance bude pokračovat díky pohodlí a nízkým cenám. Ale rostoucí nespokojenost řidičů může vést k regulaci (minimální ceny, sociální zabezpečení). Některá města už zavádějí pravidla na ochranu řidičů.'
    }
  ]
};
