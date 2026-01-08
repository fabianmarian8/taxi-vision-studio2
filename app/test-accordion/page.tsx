'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function TestAccordionPage() {
  return (
    <div className="container mx-auto max-w-4xl py-12">
      <h1 className="text-3xl font-bold mb-8">Test Radix UI Accordion</h1>

      <Accordion type="single" collapsible className="w-full border rounded-lg p-4">
        <AccordionItem value="item-1">
          <AccordionTrigger>Otázka 1 - Klikni sem</AccordionTrigger>
          <AccordionContent>
            <div className="p-4 bg-green-100 rounded">
              ✅ Radix UI Accordion FUNGUJE! Toto je odpoveď na prvú otázku.
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2">
          <AccordionTrigger>Otázka 2 - Klikni sem</AccordionTrigger>
          <AccordionContent>
            <div className="p-4 bg-green-100 rounded">
              ✅ Radix UI Accordion FUNGUJE! Toto je odpoveď na druhú otázku.
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3">
          <AccordionTrigger>Otázka 3 - Klikni sem</AccordionTrigger>
          <AccordionContent>
            <div className="p-4 bg-green-100 rounded">
              ✅ Radix UI Accordion FUNGUJE! Toto je odpoveď na tretiu otázku.
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="mt-8 p-4 bg-blue-100 rounded">
        <p className="text-sm font-bold">
          ✅ Ak vidíš zelené boxy, Radix UI Accordion funguje správne!
        </p>
        <p className="text-sm mt-2">
          Teraz môžeš otestovať FAQ na skutočných stránkach:
        </p>
        <ul className="list-disc list-inside text-sm mt-2">
          <li>
            <a href="/hodnotenie-vodicov" className="text-blue-600 hover:underline">
              /hodnotenie-vodicov
            </a>
          </li>
          <li>
            <a href="/taxi-ceny" className="text-blue-600 hover:underline">
              /taxi-ceny
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
