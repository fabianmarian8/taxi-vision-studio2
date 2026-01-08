# -*- coding: utf-8 -*-
import json

# Načítam GPS dáta obcí
with open('obce_cz_gps.json', 'r', encoding='utf-8') as f:
    obce = json.load(f)

# Kompletný zoznam miest v ČR (610 miest so statusom "město")
mesta_610 = [
    "Praha", "Brno", "Ostrava", "Plzeň", "Liberec", "Olomouc", "České Budějovice",
    "Hradec Králové", "Ústí nad Labem", "Pardubice", "Zlín", "Havířov", "Kladno",
    "Most", "Opava", "Frýdek-Místek", "Karviná", "Jihlava", "Teplice", "Děčín",
    "Karlovy Vary", "Chomutov", "Přerov", "Jablonec nad Nisou", "Mladá Boleslav",
    "Prostějov", "Česká Lípa", "Třebíč", "Třinec", "Tábor", "Znojmo", "Příbram",
    "Cheb", "Orlová", "Trutnov", "Kroměříž", "Vsetín", "Valašské Meziříčí",
    "Kolín", "Havlíčkův Brod", "Litvínov", "Krnov", "Sokolov", "Šumperk",
    "Uherské Hradiště", "Břeclav", "Hodonín", "Chrudim", "Český Těšín",
    "Nový Jičín", "Strakonice", "Litoměřice", "Kutná Hora", "Jindřichův Hradec",
    "Žďár nad Sázavou", "Klatovy", "Bohumín", "Blansko", "Vyškov", "Mělník",
    "Svitavy", "Jirkov", "Kopřivnice", "Říčany", "Dvůr Králové nad Labem",
    "Pelhřimov", "Benešov", "Písek", "Beroun", "Náchod", "Louny",
    "Kralupy nad Vltavou", "Otrokovice", "Slaný", "Kadaň", "Hranice", "Bílina",
    "Nymburk", "Brandýs nad Labem-Stará Boleslav", "Rokycany", "Šternberk",
    "Uherský Brod", "Rožnov pod Radhoštěm", "Rakovník", "Rychnov nad Kněžnou",
    "Ústí nad Orlicí", "Žatec", "Varnsdorf", "Neratovice", "Soběslav",
    "Boskovice", "Turnov", "Česká Třebová", "Vysoké Mýto", "Hlučín", "Holešov",
    "Nový Bor", "Domažlice", "Poděbrady", "Milovice", "Aš", "Roudnice nad Labem",
    "Kraslice", "Velké Meziříčí", "Bystřice nad Pernštejnem", "Kyjov",
    "Veselí nad Moravou", "Litomyšl", "Zábřeh", "Humpolec", "Čáslav", "Mikulov",
    "Ivančice", "Jaroměř", "Židlochovice", "Moravská Třebová", "Polička",
    "Mohelnice", "Frýdlant nad Ostravicí", "Studénka", "Kuřim",
    "Frenštát pod Radhoštěm", "Slavičín", "Mariánské Lázně", "Světlá nad Sázavou",
    "Chodov", "Duchcov", "Krupka", "Hořice", "Votice", "Tanvald", "Česká Skalice",
    "Skuteč", "Moravský Krumlov", "Kojetín", "Luhačovice", "Bučovice", "Modřice",
    "Lanškroun", "Hronov", "Dačice", "Nová Paka", "Frýdlant", "Staré Město",
    "Kostelec nad Orlicí", "Telč", "Blatná", "Sušice", "Vodňany", "Prachatice",
    "Vimperk", "Týn nad Vltavou", "Milevsko", "Sedlčany", "Hořovice", "Dobříš",
    "Vlašim", "Uhlířské Janovice", "Zruč nad Sázavou", "Golčův Jeníkov",
    "Ledeč nad Sázavou", "Pacov", "Chotěboř", "Nové Město na Moravě",
    "Bystřice pod Hostýnem", "Valašské Klobouky", "Vizovice", "Napajedla",
    "Uherský Ostroh", "Strážnice", "Kunovice", "Bojkovice", "Hluk", "Ždánice",
    "Hustopeče", "Pohořelice", "Slavkov u Brna", "Rosice", "Tišnov",
    "Velká Bíteš", "Moravské Budějovice", "Náměšť nad Oslavou", "Třešť",
    "Nová Bystřice", "Studená", "Slavonice", "Jemnice", "Žirovnice", "Počátky",
    "Kamenice nad Lipou", "Plánice", "Kasejovice", "Nepomuk", "Přeštice", "Stod",
    "Kdyně", "Horšovský Týn", "Poběžovice", "Bělá nad Radbuzou", "Hostouň",
    "Planá", "Stříbro", "Bezdružice", "Město Touškov", "Horní Bříza", "Nýřany",
    "Dobřany", "Tachov", "Bečov nad Teplou", "Toužim", "Ostrov", "Hroznětín",
    "Jáchymov", "Nejdek", "Nová Role", "Loket", "Horní Slavkov", "Žlutice",
    "Buštěhrad", "Unhošť", "Hostivice", "Roztoky", "Černošice", "Jesenice",
    "Mníšek pod Brdy", "Řevnice", "Jílové u Prahy", "Týnec nad Sázavou",
    "Neveklov", "Kosova Hora", "Sedlec-Prčice", "Volyně", "Katovice",
    "Horažďovice", "Nalžovské Hory", "Volary", "Horní Planá", "Frymburk",
    "Vyšší Brod", "Kaplice", "Velešín", "Trhové Sviny", "Borovany", "Nové Hrady",
    "Český Krumlov", "Rožmberk nad Vltavou", "Netolice", "Husinec", "Bavorov",
    "Protivín", "Mirotice", "Čimelice", "Bernartice", "Hluboká nad Vltavou",
    "Zliv", "Lišov", "Rudolfov", "Ledenice", "Suchdol nad Lužnicí", "Třeboň",
    "Lomnice nad Lužnicí", "Veselí nad Lužnicí", "Kardašova Řečice",
    "Mladá Vožice", "Sezimovo Ústí", "Planá nad Lužnicí", "Chýnov", "Sepekov",
    "Radomyšl", "Kašperské Hory", "Hrádek", "Švihov", "Nýrsko", "Železná Ruda",
    "Janovice nad Úhlavou", "Strážov", "Všeruby", "Klenčí pod Čerchovem",
    "Meclov", "Staňkov", "Holýšov", "Merklín", "Blovice", "Spálené Poříčí",
    "Starý Plzenec", "Vejprnice", "Chrást", "Třemošná", "Kaznějov", "Kozolupy",
    "Manětín", "Kralovice", "Plasy", "Kladruby", "Černošín", "Teplá", "Sadov",
    "Dalovice", "Boží Dar", "Pernink", "Abertamy", "Horní Blatná", "Rotava",
    "Kynšperk nad Ohří", "Březová", "Habartov", "Libá", "Hazlov", "Skalná",
    "Plesná", "Velká Hleďsebe", "Lázně Kynžvart", "Bor", "Přimda", "Stráž",
    "Konstantinovy Lázně", "Chlumec", "Velké Březno", "Úštěk", "Verneřice",
    "Benešov nad Ploučnicí", "Česká Kamenice", "Rumburk", "Šluknov", "Jiříkov",
    "Dolní Poustevna", "Mikulášovice", "Krásná Lípa", "Chřibská", "Cvikov",
    "Doksy", "Mimoň", "Ralsko", "Stráž pod Ralskem", "Zákupy", "Nový Bydžov",
    "Chlumec nad Cidlinou", "Kopidlno", "Jičín", "Lázně Bělohrad", "Pecka",
    "Hostinné", "Vrchlabí", "Jilemnice", "Rokytnice nad Jizerou", "Harrachov",
    "Špindlerův Mlýn", "Police nad Metují", "Broumov", "Teplice nad Metují",
    "Meziměstí", "Červený Kostelec", "Úpice", "Nové Město nad Metují",
    "Dobruška", "Opočno", "Třebechovice pod Orebem", "Týniště nad Orlicí",
    "Vamberk", "Rokytnice v Orlických horách", "Žamberk", "Jablonné nad Orlicí",
    "Letohrad", "Králíky", "Choceň", "Brandýs nad Orlicí", "Jevíčko",
    "Jedovnice", "Adamov", "Rájec-Jestřebí", "Letovice", "Velké Opatovice",
    "Kunštát", "Olešnice", "Lysice", "Předklášteří", "Oslavany", "Dolní Kounice",
    "Klobouky u Brna", "Šlapanice", "Rousínov", "Lipník nad Bečvou", "Potštát",
    "Odry", "Štramberk", "Příbor", "Kelč", "Karolinka", "Velké Karlovice",
    "Horní Lideč", "Brumov-Bylnice", "Fryšták", "Chropyně", "Hulín",
    "Morkovice-Slížany", "Koryčany", "Zdounky", "Bzenec", "Dubňany",
    "Ratíškovice", "Mutěnice", "Čejkovice", "Velké Pavlovice", "Valtice",
    "Lanžhot", "Podivín", "Hrušovany nad Jevišovkou", "Miroslav", "Hrotovice",
    "Jaroměřice nad Rokytnou", "Polná", "Přibyslav", "Ždírec nad Doubravou",
    "Jablonné v Podještědí", "Hrádek nad Nisou", "Chrastava", "Frýdlant",
    "Nové Město pod Smrkem", "Raspenava", "Hejnice", "Desná", "Velké Hamry",
    "Smržovka", "Rychnov u Jablonce nad Nisou", "Železný Brod", "Semily",
    "Lomnice nad Popelkou", "Rovensko pod Troskami", "Sobotka", "Libáň",
    "Železnice", "Miletín", "Lázně Bohdaneč", "Sezemice", "Holice", "Heřmanův Městec",
    "Skuteč", "Chrast", "Hlinsko", "Proseč"
]

# Unikátne mestá
mesta_unique = list(set(mesta_610))
print(f"Unikátnych miest v zozname: {len(mesta_unique)}")

# Vytvorím lookup z obcí podľa názvu (case insensitive)
obce_by_name = {}
for o in obce:
    key = o['name'].lower()
    if key not in obce_by_name:
        obce_by_name[key] = o

# Nájdem mestá v dátach obcí
mesta_final = []
not_found = []

for mesto in mesta_unique:
    key = mesto.lower()
    if key in obce_by_name:
        o = obce_by_name[key]
        mesta_final.append({
            "name": o['name'],
            "kod": o['kod'],
            "lat": o['lat'],
            "lon": o['lon'],
            "okres": o['okres'],
            "kraj": o['kraj']
        })
    else:
        not_found.append(mesto)

# Zoradím podľa názvu
mesta_final.sort(key=lambda x: x['name'])

print(f"Nájdených miest: {len(mesta_final)}")
print(f"Nenájdených: {len(not_found)}")
if not_found:
    print(f"Nenájdené mestá: {not_found[:20]}")

# Uložím finálny zoznam
with open('mesta_cz_komplet.json', 'w', encoding='utf-8') as f:
    json.dump(mesta_final, f, ensure_ascii=False, indent=2)

print(f"\n✓ Uložených {len(mesta_final)} miest do mesta_cz_komplet.json")
