#!/usr/bin/env python3
"""
Script to populate cities.json with scraped taxi services data.
"""

import json
from datetime import datetime

# Scraped taxi services data
TAXI_SERVICES = {
    "praha": [
        {"name": "AAA Taxi Praha", "phone": "+420 222 333 222", "website": "https://www.aaataxi.cz"},
        {"name": "Moje Taxi Praha", "phone": "608 174 404", "website": "https://moje-taxi-praha.cz"},
        {"name": "Taxi Praha 777", "phone": "+420 251 000 251", "website": "https://taxipraha777.cz"},
        {"name": "Liftago", "phone": "+420 266 266 000", "website": "https://www.liftago.cz"},
        {"name": "Tick Tack Taxi", "phone": "+420 721 300 300", "website": "https://www.ticktack.cz"},
    ],
    "brno": [
        {"name": "City Taxi Brno", "phone": "+420 542 321 321", "website": "https://www.citytaxibrno.cz"},
        {"name": "Lido Taxi", "phone": "+420 800 233 233", "website": "https://www.lidotaxi.cz"},
        {"name": "AAA Taxi Brno", "phone": "+420 545 541 541", "website": "https://www.aaataxi.cz"},
        {"name": "Taxi Brno Airport", "phone": "+420 777 899 788"},
    ],
    "ostrava": [
        {"name": "Taxi Ostrava", "phone": "+420 596 666 666", "website": "https://www.taxi-ostrava.cz"},
        {"name": "City Taxi Ostrava", "phone": "+420 800 233 233"},
        {"name": "Profi Taxi Ostrava", "phone": "+420 596 311 311"},
    ],
    "plzen": [
        {"name": "City Taxi Plzeň", "phone": "+420 377 222 222", "website": "https://www.citytaxiplzen.cz"},
        {"name": "Taxi Plzeň", "phone": "+420 377 333 333"},
        {"name": "Plzeňské taxi", "phone": "+420 800 100 033"},
    ],
    "liberec": [
        {"name": "Taxi Liberec", "phone": "+420 485 104 104", "website": "https://www.taxiliberec.cz"},
        {"name": "AAA Taxi Liberec", "phone": "+420 800 142 514"},
    ],
    "olomouc": [
        {"name": "Taxi Olomouc", "phone": "+420 585 233 233", "website": "https://www.taxi-olomouc.cz"},
        {"name": "City Taxi Olomouc", "phone": "+420 800 100 600"},
    ],
    "hradec-kralove": [
        {"name": "City Taxi HK", "phone": "+420 495 511 511", "website": "https://www.citytaxi-hk.cz"},
        {"name": "Taxi Hradec Králové", "phone": "+420 777 234 567"},
    ],
    "ceske-budejovice": [
        {"name": "Comett Plus Taxi", "phone": "+420 387 315 315", "website": "https://www.comettplus.cz"},
        {"name": "Leo Taxi CB", "phone": "+420 739 662 199", "website": "https://www.leotaxicb.cz"},
    ],
    "zlin": [
        {"name": "Taxi Zlín", "phone": "+420 577 222 222", "website": "https://www.taxi-zlin.cz"},
        {"name": "City Taxi Zlín", "phone": "+420 800 100 400"},
    ],
    "pardubice": [
        {"name": "Taxi Pardubice", "phone": "+420 466 311 311", "website": "https://www.taxi-pardubice.cz"},
        {"name": "GP Taxi", "phone": "+420 720 069 069", "website": "https://www.gptaxi.cz"},
    ],
    "usti-nad-labem": [
        {"name": "Taxi Ústí", "phone": "+420 475 504 504"},
        {"name": "City Taxi Ústí nad Labem", "phone": "+420 800 111 333"},
    ],
    "karlovy-vary": [
        {"name": "Taxi KV", "phone": "+420 353 222 222", "website": "https://www.taxikv.cz"},
        {"name": "City Taxi Karlovy Vary", "phone": "+420 800 100 223"},
    ],
    "jihlava": [
        {"name": "Taxi Jihlava", "phone": "+420 567 575 757", "website": "https://www.taxi-jihlava.cz"},
        {"name": "City Taxi Jihlava", "phone": "+420 800 100 587"},
    ],
    "kladno": [
        {"name": "Taxi Kladno", "phone": "+420 312 684 684"},
        {"name": "City Taxi Kladno", "phone": "+420 800 100 312"},
    ],
    "most": [
        {"name": "Taxi Most", "phone": "+420 476 701 701"},
    ],
    "opava": [
        {"name": "Taxi Opava", "phone": "+420 553 624 624"},
    ],
    "frydek-mistek": [
        {"name": "Taxi FM", "phone": "+420 558 627 627"},
    ],
    "havirov": [
        {"name": "Taxi Havířov", "phone": "+420 596 813 813"},
    ],
    "karvina": [
        {"name": "Taxi Karviná", "phone": "+420 596 311 311"},
    ],
    "teplice": [
        {"name": "Taxi Teplice", "phone": "+420 417 577 577"},
    ],
    "chomutov": [
        {"name": "Taxi Chomutov", "phone": "+420 474 628 628"},
    ],
    "decin": [
        {"name": "Taxi Děčín", "phone": "+420 412 530 530"},
    ],
    "prerov": [
        {"name": "Taxi Přerov", "phone": "+420 581 204 204"},
    ],
    "prostejov": [
        {"name": "Taxi Prostějov", "phone": "+420 582 330 330"},
    ],
    "mlada-boleslav": [
        {"name": "Taxi Mladá Boleslav", "phone": "+420 326 321 321"},
    ],
    "jablonec-nad-nisou": [
        {"name": "Taxi Jablonec", "phone": "+420 483 312 312"},
    ],
    "trebic": [
        {"name": "Taxi Třebíč", "phone": "+420 568 822 822"},
    ],
    "znojmo": [
        {"name": "Taxi Znojmo", "phone": "+420 515 222 222"},
    ],
    "kolin": [
        {"name": "Taxi Kolín", "phone": "+420 321 723 723"},
    ],
    "pribram": [
        {"name": "Taxi Příbram", "phone": "+420 318 628 628"},
    ],
    "kromeriz": [
        {"name": "Taxi Kroměříž", "phone": "+420 573 338 338"},
    ],
    "uherske-hradiste": [
        {"name": "Taxi Uherské Hradiště", "phone": "+420 572 551 551"},
    ],
    "vsetin": [
        {"name": "Taxi Vsetín", "phone": "+420 571 411 411"},
    ],
    "sumperk": [
        {"name": "Taxi Šumperk", "phone": "+420 583 212 212"},
    ],
    "tabor": [
        {"name": "Taxi Tábor", "phone": "+420 381 252 252"},
    ],
    "ceska-lipa": [
        {"name": "Taxi Česká Lípa", "phone": "+420 487 521 521"},
    ],
    "beroun": [
        {"name": "Kevin Taxi Beroun", "phone": "+420 774 431 557", "website": "https://www.kevintaxi.cz"},
        {"name": "Taxi-Beroun.cz", "phone": "773 699 886", "website": "https://www.taxi-beroun.cz"},
        {"name": "Taxi 24 Beroun", "phone": "721 306 306", "website": "https://www.24taxi.cz"},
        {"name": "Taxi Beroun Veselý-Mařík", "phone": "776 773 505"},
    ],
    "benesov": [
        {"name": "Radio TAXI Hájek", "phone": "+420 606 201 444", "website": "https://www.taxihajek.cz"},
        {"name": "NIKO TAXI Benešov", "phone": "+420 602 308 568", "website": "https://www.nikotaxi.cz"},
        {"name": "TAXI BENEŠOV", "phone": "+420 734 669 269", "website": "https://benesov.taxi"},
        {"name": "IM TAXI Benešov", "phone": "731 109 355", "website": "https://www.imtaxibenesov.cz"},
    ],
    "breclav": [
        {"name": "TAXI Břeclav Kaskin", "phone": "+420 602 752 552", "website": "https://taxibreclav.cz"},
        {"name": "TAXI BŘECLAV", "phone": "777 572 103", "website": "https://www.taxi-breclav.cz"},
        {"name": "TAXI MAKI Břeclav", "phone": "737 549 379"},
    ],
    "cheb": [
        {"name": "TEAM CHARLIE TAXI", "phone": "800 023 043", "website": "https://chebtaxi.cz"},
        {"name": "TAXI CENTRAL CHEB", "phone": "+420 354 435 000"},
        {"name": "HALLO TAXI Cheb", "phone": "+420 602 459 504"},
        {"name": "CHILLI TAXI CHEB", "phone": "+420 606 050 050"},
    ],
    "chrudim": [
        {"name": "Taxi OK & PROFI Chrudim", "phone": "777 620 620", "website": "https://www.taxi-chrudim.cz"},
        {"name": "TaxiDave", "phone": "+420 774 817 288", "website": "https://www.taxidave.cz"},
        {"name": "MY Taxi Chrudim", "phone": "+420 720 069 069", "website": "https://www.my-taxi.cz"},
    ],
    "domazlice": [
        {"name": "Taxi Domažlice", "phone": "+420 607 722 555", "website": "https://www.taxidomazlice.cz"},
        {"name": "Lucky Taxi Domažlice", "phone": "+420 800 777 077", "website": "https://www.luckytaxi.cz"},
        {"name": "TAXI PEPINO", "phone": "+420 720 136 813"},
    ],
    "havlickuv-brod": [
        {"name": "Taxi Pája", "phone": "731 022 312", "website": "https://taxihavlickuvbrod.webnode.cz"},
        {"name": "Pavel Kopic Taxi", "phone": "724 729 699"},
    ],
    "hodonin": [
        {"name": "RB Taxi Hodonín", "phone": "+420 777 702 702", "website": "https://rbtaxihodonin.cz"},
        {"name": "Taxi Hodonín Roman Blaha", "phone": "728 045 000", "website": "https://www.taxi-hodonin.cz"},
        {"name": "Goding Taxi", "phone": "+420 723 723 229", "website": "https://godingtaxi.cz"},
    ],
    "jicin": [
        {"name": "TAXI NONSTOP JIČÍN", "phone": "603 380 000"},
        {"name": "LV taxi Jičín", "phone": "777 123 456"},
    ],
    "jindrichuv-hradec": [
        {"name": "NONSTOP TAXI Martin Lehký", "phone": "720 171 007", "website": "https://www.taxi-lehky.cz"},
        {"name": "Taxi Zdeněk Malý", "phone": "+420 777 213 926"},
        {"name": "Taxi Kroupa", "phone": "724 707 172"},
        {"name": "eTAXI Jindřichův Hradec", "phone": "608 000 458", "website": "https://www.taxi-jh.cz"},
    ],
    "klatovy": [
        {"name": "Taxi Klatovy", "phone": "602 481 096", "website": "https://www.taxi-klatovy.cz"},
        {"name": "Mayday TAXI Klatovy", "phone": "800 668 668", "website": "https://www.mts-taxi.cz"},
        {"name": "TAXI Vávra", "phone": "800 770 300", "website": "https://taxivavra.cz"},
    ],
    "kutna-hora": [
        {"name": "TAXI Novák", "phone": "777 347 347", "website": "https://taxikh.cz"},
        {"name": "Taxi John", "phone": "+420 703 558 597"},
        {"name": "TAXI EASY", "phone": "722 908 867", "website": "https://www.taxi-easy.cz"},
        {"name": "Stella Taxi", "phone": "+420 736 715 413", "website": "https://www.stellataxi.cz"},
    ],
    "litomerice": [
        {"name": "Ema Taxi", "phone": "608 033 044"},
        {"name": "Taxi Forman", "phone": "+420 602 129 925"},
        {"name": "Falcon Taxi", "phone": "606 14 25 25", "website": "https://www.falcontaxi.cz"},
    ],
    "melnik": [
        {"name": "Taxi Mělník", "phone": "601 307 307", "website": "https://melniktaxi.cz"},
        {"name": "Taxi Konrád", "phone": "737 109 999"},
        {"name": "2T Tomi Taxi", "phone": "775 772 031", "website": "https://tomi-taxi.cz"},
    ],
    "nachod": [
        {"name": "TAXI LOJZA", "phone": "+420 774 678 899"},
        {"name": "Žák Luděk TAXI NONSTOP", "phone": "603 441 222"},
    ],
    "nymburk": [
        {"name": "TAXI Michal Martinec", "phone": "+420 602 235 678", "website": "https://www.taxinymburk.cz"},
        {"name": "Taxislužba Jiří Jelínek", "phone": "+420 728 380 700"},
    ],
    "pelhrimov": [
        {"name": "Taxislužba Miroslav Procházka", "phone": "+420 606 852 301"},
        {"name": "Taxi Joker", "phone": "722 679 397"},
        {"name": "Taxislužba Radek Příhoda", "phone": "774 997 999"},
    ],
    "pisek": [
        {"name": "Písek Taxi Speed", "phone": "608 608 738", "website": "https://www.taxi-pisek.cz"},
        {"name": "Black Taxi Písek", "phone": "+420 775 563 537", "website": "https://blacktaxipisek.cz"},
        {"name": "Taxi Písek Nonstop", "phone": "+420 604 828 384"},
    ],
    "prachatice": [
        {"name": "Antonín Šiška Nonstoptaxi", "phone": "720 502 501"},
        {"name": "Tomáš Taxi", "phone": "+420 736 231 583"},
    ],
    "rakovnik": [
        {"name": "TAXISLUŽBY RAKOVNÍK František Černý", "phone": "+420 608 233 995", "website": "https://www.taxisluzbyrakovnik.cz"},
        {"name": "DSM Taxi Rakovník", "phone": "+420 775 661 814", "website": "https://www.dsmtaxirakovnik.cz"},
        {"name": "Martin Cíl Taxi", "phone": "+420 604 605 352"},
    ],
    "rokycany": [
        {"name": "TAXI 1 Rokycany", "phone": "800 10 10 16", "website": "https://taxi1rokycany.cz"},
        {"name": "A5A TAXI Rokycany", "phone": "800 555 535", "website": "https://taxirokycany.com"},
    ],
    "rychnov-nad-kneznou": [
        {"name": "Taxi David Škop", "phone": "777 737 737", "website": "https://www.taxirychnov.cz"},
        {"name": "Taxislužba Forejtek Zdeněk", "phone": "+420 603 487 868"},
    ],
    "semily": [
        {"name": "Taxi Semily In Taxi", "phone": "+420 737 86 26 46", "website": "https://taxisemily.cz"},
        {"name": "TAXI Český ráj", "phone": "605 285 254"},
    ],
    "sokolov": [
        {"name": "ALICE HABALOVÁ TAXISLUŽBA", "phone": "+420 737 383 763"},
        {"name": "TAXI SLUŽBA SOKOLOV", "phone": "+420 606 184 809"},
        {"name": "TaxiSokolov", "phone": "777 066 926"},
    ],
    "strakonice": [
        {"name": "TAXI Strakonice Šochman", "phone": "773 203 040", "website": "https://taxi-strakonice.eu"},
        {"name": "NONSTOP TAXI Zdeněk Hofmann", "phone": "723 805 805", "website": "https://www.nonstoptaxi.eu"},
    ],
    "svitavy": [
        {"name": "TAXI BLAHA", "phone": "602 416 536", "website": "https://www.taxi-radiotaxi.cz"},
        {"name": "Falco Taxi", "phone": "777 020 222", "website": "https://falcotaxi.cz"},
    ],
    "tachov": [
        {"name": "Taxi Ivana Jasanská", "phone": "+420 602 406 725"},
        {"name": "Taxi Burda", "phone": "+420 602 413 819"},
        {"name": "Taxi Řezáč", "phone": "603 910 102"},
    ],
    "trutnov": [
        {"name": "TAXI TRUTNOV", "phone": "603 301 643"},
        {"name": "Do Taxi Go", "phone": "777 000 000", "website": "https://dotaxigo.cz"},
        {"name": "LimoTaxi", "phone": "800 100 100", "website": "https://limotaxi.cz"},
    ],
    "vyskov": [
        {"name": "TAXI Vyškov", "phone": "800 100 611", "website": "https://taxivyskov.cz"},
        {"name": "TAXI HÁLA", "phone": "+420 517 333 900"},
        {"name": "BM Taxi Vyškov", "phone": "775 001 390"},
    ],
    "zdar-nad-sazavou": [
        {"name": "Taxi Pepino", "phone": "604 463 412", "website": "https://www.pepinotaxi.cz"},
        {"name": "TAXI ŽĎÁR", "phone": "601 169 028"},
        {"name": "Taxi Maša", "phone": "+420 773 114 948"},
    ],
    "cesky-krumlov": [
        {"name": "Krumlov Taxi (Green Taxi)", "phone": "380 712 712", "website": "https://green-taxi.cz"},
        {"name": "FOKR TAXI", "phone": "+420 602 270 208", "website": "https://fokrtaxi.cz"},
        {"name": "Taxi Český Krumlov", "phone": "+420 602 403 402", "website": "https://www.taxi-krumlov.cz"},
    ],
}

def main():
    # Load existing cities.json
    with open('../src/data/cities.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Update each city with taxi services
    for city in data['cities']:
        slug = city['slug']
        if slug in TAXI_SERVICES:
            services = []
            for svc in TAXI_SERVICES[slug]:
                service = {
                    "name": svc["name"],
                    "phone": svc["phone"],
                    "isPremium": False,
                    "isPromotional": False
                }
                if "website" in svc:
                    service["website"] = svc["website"]
                services.append(service)
            city['taxiServices'] = services
            print(f"Updated {city['name']} with {len(services)} taxi services")

    # Update timestamp
    data['lastUpdated'] = datetime.utcnow().isoformat() + 'Z'

    # Write back
    with open('../src/data/cities.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"\nDone! Updated cities.json with taxi services data.")

if __name__ == "__main__":
    main()
