import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactFormModal = ({ isOpen, onClose }: ContactFormModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      // Použitie našej vlastnej API route s Resend službou
      console.log("Submitting form to /api/contact...");
      const response = await fetch("/api/contact", {
        method: "POST",
        body: formData,
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (response.ok) {
        const successData = await response.json();
        console.log("Email sent successfully:", successData);
        setSubmitStatus("success");
        form.reset();
        setTimeout(() => {
          onClose();
          setSubmitStatus("idle");
        }, 2000);
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error("Error response:", {
          status: response.status,
          statusText: response.statusText,
          data: errorData,
        });
        setSubmitStatus("error");
      }
    } catch (error) {
      console.error("Network or fetch error:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-black pr-6">Něco tu chybí?</DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Pomozte nám zlepšit naši databázi. Pošlete nám informace o chybějící taxislužbě nebo opravte existující údaje.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-4 mt-3 sm:mt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="font-bold">
              Vaše jméno
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Jan Novák"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="font-bold">
              Váš email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="jan.novak@example.com"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city" className="font-bold">
              Město
            </Label>
            <Input
              id="city"
              name="city"
              type="text"
              placeholder="např. Praha"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="taxiName" className="font-bold">
              Název taxislužby
            </Label>
            <Input
              id="taxiName"
              name="taxiName"
              type="text"
              placeholder="např. Taxi Express"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="font-bold">
              Zpráva / Údaje k doplnění
            </Label>
            <Textarea
              id="message"
              name="message"
              placeholder="Prosím uveďte telefonní číslo, webovou stránku nebo jiné relevantní informace..."
              rows={4}
              required
              disabled={isSubmitting}
            />
          </div>

          {submitStatus === "success" && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-3 py-2 sm:px-4 sm:py-3 rounded-lg font-medium text-sm sm:text-base">
              ✓ Ďakujeme! Váš príspevok bol úspešne odoslaný.
            </div>
          )}

          {submitStatus === "error" && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 sm:px-4 sm:py-3 rounded-lg font-medium text-sm sm:text-base">
              ✗ Nastala chyba pri odosielaní. Skúste to prosím znova.
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2 sm:pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:flex-1 font-bold h-11 sm:h-10"
            >
              Zrušiť
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:flex-1 font-bold transition-all h-11 sm:h-10"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Odosielam...
                </>
              ) : (
                "Odoslať"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
