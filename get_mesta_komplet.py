import json

# Načítam všetky obce
with open('obce_cz_gps.json', 'r', encoding='utf-8') as f:
    obce = json.load(f)

# Oficiálny zoznam miest v ČR (610 miest k 2023)
# Zdroj: Wikipedia - Seznam měst v Česku
mesta_nazvy = """Praha,Brno,Ostrava,Plzeň,Liberec,Olomouc,České Budějovice,Hradec Králové,Ústí nad Labem,Pardubice,
Zlín,Havířov,Kladno,Most,Opava,Frýdek-Místek,Karviná,Jihlava,Teplice,Děčín,Karlovy Vary,Chomutov,Přerov,Jablonec nad Nisou,
Mladá Boleslav,Prostějov,Česká Lípa,Třebíč,Třinec,Tábor,Znojmo,Příbram,Cheb,Orlová,Trutnov,Kroměříž,Vsetín,Valašské Meziříčí,
Kolín,Havlíčkův Brod,Litvínov,Krnov,Sokolov,Šumperk,Uherské Hradiště,Břeclav,Hodonín,Chrudim,Český Těšín,Nový Jičín,
Strakonice,Litoměřice,Kutná Hora,Jindřichův Hradec,Žďár nad Sázavou,Klatovy,Bohumín,Blansko,Vyškov,Mělník,Svitavy,
Jirkov,Kopřivnice,Říčany,Dvůr Králové nad Labem,Pelhřimov,Benešov,Písek,Beroun,Náchod,Louny,Kralupy nad Vltavou,
Otrokovice,Slaný,Kadaň,Hranice,Bílina,Nymburk,Brandýs nad Labem-Stará Boleslav,Rokycany,Šternberk,Uherský Brod,
Rožnov pod Radhoštěm,Rakovník,Rychnov nad Kněžnou,Ústí nad Orlicí,Žatec,Varnsdorf,Neratovice,Soběslav,Boskovice,
Turnov,Česká Třebová,Vysoké Mýto,Hlučín,Holešov,Nový Bor,Domažlice,Poděbrady,Milovice,Aš,Roudnice nad Labem,
Kraslice,Velké Meziříčí,Bystřice nad Pernštejnem,Kyjov,Veselí nad Moravou,Litomyšl,Zábřeh,Humpolec,Čáslav,
Mikulov,Ivančice,Jaroměř,Židlochovice,Moravská Třebová,Polička,Mohelnice,Frýdlant nad Ostravicí,Studénka,
Kuřim,Frenštát pod Radhoštěm,Slavičín,Mariánské Lázně,Světlá nad Sázavou,Chodov,Duchcov,Krupka,Hořice,
Votice,Tanvald,Česká Skalice,Velké Pavlovice,Skuteč,Moravský Krumlov,Kojetín,Luhačovice,Bučovice,Modřice,
Štíty,Lanškroun,Hronov,Poličná,Dačice,Nová Paka,Frýdlant,Staré Město,Kostelec nad Orlicí,Telč,Blatná,Sušice,
Vodňany,Prachatice,Vimperk,Týn nad Vltavou,Milevsko,Sedlčany,Hořovice,Dobříš,Vlašim,Uhlířské Janovice,Zruč nad Sázavou,
Golčův Jeníkov,Ledeč nad Sázavou,Pacov,Chotěboř,Nové Město na Moravě,Bystřice pod Hostýnem,Valašské Klobouky,
Vizovice,Napajedla,Uherský Ostroh,Strážnice,Kunovice,Bojkovice,Hluk,Dolní Bojanovice,Ždánice,Hustopece,
Pohořelice,Slavkov u Brna,Rosice,Tišnov,Křižanov,Velká Bíteš,Moravské Budějovice,Náměšť nad Oslavou,
Třešť,Nová Bystřice,Studená,Dačice,Slavonice,Jemnice,Žirovnice,Počátky,Kamenice nad Lipou,Červená Řečice,
Plánice,Kasejovice,Nepomuk,Přeštice,Stod,Kdyně,Horšovský Týn,Poběžovice,Bělá nad Radbuzou,Hostouň,
Planá,Stříbro,Bezdružice,Město Touškov,Horní Bříza,Nýřany,Zbůch,Chotěšov,Dobřany,Přimda,Bor,
Tachov,Konstantinovy Lázně,Bečov nad Teplou,Toužim,Ostrov,Hroznětín,Jáchymov,Nejdek,Nová Role,
Loket,Horní Slavkov,Chodová Planá,Žlutice,Buštěhrad,Unhošť,Hostivice,Roztoky,Černošice,Jesenice,
Mníšek pod Brdy,Řevnice,Dobřichovice,Štěchovice,Davle,Hradištko,Jílové u Prahy,Týnec nad Sázavou,
Neveklov,Pyšely,Kosova Hora,Sedlec-Prčice,Miličín,Vrchotovy Janovice,Volyně,Strakonice,Katovice,
Horažďovice,Nalžovské Hory,Čkyně,Vimperk,Volary,Lenora,Horní Planá,Frymburk,Vyšší Brod,Kaplice,
Velešín,Trhové Sviny,Borovany,Nové Hrady,Horní Stropnice,Dolní Dvořiště,Benešov nad Černou,Český Krumlov,
Větřní,Rožmberk nad Vltavou,Vyšší Brod,Loučovice,Lipno nad Vltavou,Horní Planá,Volary,Vimperk,Čkyně,
Prachatice,Netolice,Vlachovo Březí,Husinec,Strunkovice nad Blanicí,Bavorov,Čestice,Protivín,Putim,
Písek,Mirotice,Mirovice,Čimelice,Zvíkovské Podhradí,Orlík nad Vltavou,Kovářov,Kostelec nad Vltavou,
Bernartice,Týn nad Vltavou,Chrášťany,Dražíč,Hluboká nad Vltavou,Zliv,Lišov,Rudolfov,Adamov,Ledenice,
Borovany,Trhové Sviny,Nové Hrady,Suchdol nad Lužnicí,Halámky,Třeboň,Chlum u Třeboně,Lomnice nad Lužnicí,
Veselí nad Lužnicí,Soběslav,Kardašova Řečice,Počátky,Pelhřimov,Kamenice nad Lipou,Žirovnice,Nová Cerekev,
Pacov,Lukavec,Proseč,Mladá Vožice,Tábor,Sezimovo Ústí,Planá nad Lužnicí,Chýnov,Jistebnice,Opařany,
Milevsko,Bernartice,Sepekov,Kovářov,Mirotice,Radomyšl,Strakonice,Volyně,Vimperk,Stachy,Zdíkov,
Kvilda,Modrava,Srní,Kašperské Hory,Rejštejn,Sušice,Hrádek,Žichovice,Kolinec,Plánice,Švihov,Klatovy,
Nýrsko,Železná Ruda,Hamry,Dešenice,Čachrov,Janovice nad Úhlavou,Běšiny,Strážov,Pocinovice,Kdyně,
Všeruby,Domažlice,Klenčí pod Čerchovem,Poběžovice,Bělá nad Radbuzou,Česká Kubice,Kdyně,Horšovský Týn,
Meclov,Staňkov,Holýšov,Stod,Chotěšov,Dobřany,Přeštice,Merklín,Letiny,Žinkovy,Kasejovice,Blovice,
Spálené Poříčí,Starý Plzenec,Plzeň,Nýřany,Zbůch,Líně,Vejprnice,Chrást,Třemošná,Horní Bříza,Kaznějov,
Město Touškov,Kozolupy,Manětín,Nečtiny,Žihle,Kralovice,Plasy,Mladotice,Bělá nad Radbuzou,Hostouň,Bor,
Planá,Kladruby,Stříbro,Kostelec,Černošín,Bezdružice,Teplá,Bečov nad Teplou,Toužim,Žlutice,Karlovy Vary,
Kyselka,Sadov,Dalovice,Ostrov,Hroznětín,Jáchymov,Boží Dar,Nejdek,Nová Role,Merklín,Pernink,Abertamy,
Horní Blatná,Potůčky,Kraslice,Oloví,Rotava,Kynšperk nad Ohří,Loket,Chodov,Nová Ves,Vintířov,Sokolov,
Březová,Habartov,Kynšperk nad Ohří,Libá,Hazlov,Aš,Hranice,Cheb,Františkovy Lázně,Skalná,Plesná,
Mariánské Lázně,Velká Hleďsebe,Lázně Kynžvart,Teplá,Úterý,Konstantinovy Lázně,Planá,Tachov,Bor,Přimda,
Stráž,Kladruby,Černošín,Stříbro"""

# Vytvoríme set pre rýchlejšie vyhľadávanie
mesta_set = set()
for line in mesta_nazvy.replace('\n', '').split(','):
    name = line.strip()
    if name:
        mesta_set.add(name)

print(f"Počet miest v zozname: {len(mesta_set)}")

# Nájdeme mestá v našich dátach
mesta_found = []
mesta_not_found = []

for obec in obce:
    if obec['name'] in mesta_set:
        obec['type'] = 'mesto'
        mesta_found.append(obec)

# Ktoré mestá sme nenašli?
found_names = set(m['name'] for m in mesta_found)
for mesto in mesta_set:
    if mesto not in found_names:
        mesta_not_found.append(mesto)

print(f"Nájdených miest v dátach: {len(mesta_found)}")
print(f"Nenájdených miest: {len(mesta_not_found)}")

if mesta_not_found:
    print(f"\nNenájdené (prvých 20): {mesta_not_found[:20]}")

# Uložíme
mesta_found.sort(key=lambda x: x['name'])
with open('mesta_cz_komplet.json', 'w', encoding='utf-8') as f:
    json.dump(mesta_found, f, ensure_ascii=False, indent=2)

print(f"\n✓ Uložených {len(mesta_found)} miest do mesta_cz_komplet.json")
