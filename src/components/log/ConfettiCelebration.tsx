import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
};

const ConfettiCelebration = ({ open, onClose }: Props) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!open) return;
    setShow(true);

    const end = Date.now() + 2000;
    const colors = ["#22c55e", "#f59e0b", "#3b82f6", "#ec4899"];

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, [open]);

  return (
    <Dialog open={show} onOpenChange={(v) => { if (!v) { setShow(false); onClose(); } }}>
      <DialogContent className="max-w-xs text-center">
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="h-16 w-16 rounded-full bg-accent/20 flex items-center justify-center glow-accent">
            <Trophy className="h-8 w-8 text-accent" />
          </div>
          <h2 className="text-xl font-black">Parabéns! 🏆</h2>
          <p className="text-muted-foreground text-sm">
            Novo Recorde Registrado!
          </p>
          <Button onClick={() => { setShow(false); onClose(); }} className="w-full">
            Continuar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfettiCelebration;
