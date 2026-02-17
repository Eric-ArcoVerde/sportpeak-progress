import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calculator, ArrowLeftRight } from "lucide-react";

type Props = {
  onApplyKg: (kg: number) => void;
};

const UnitConverter = ({ onApplyKg }: Props) => {
  const [lbs, setLbs] = useState("");
  const [kg, setKg] = useState("");
  const [open, setOpen] = useState(false);

  const lbsToKg = (v: number) => +(v * 0.453592).toFixed(2);
  const kgToLbs = (v: number) => +(v / 0.453592).toFixed(2);

  const handleLbsChange = (v: string) => {
    setLbs(v);
    const n = parseFloat(v);
    setKg(isNaN(n) ? "" : String(lbsToKg(n)));
  };

  const handleKgChange = (v: string) => {
    setKg(v);
    const n = parseFloat(v);
    setLbs(isNaN(n) ? "" : String(kgToLbs(n)));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="icon" className="shrink-0">
          <Calculator className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" /> Conversor
          </DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="text-xs text-muted-foreground mb-1 block">Lbs</label>
            <Input
              type="number"
              inputMode="decimal"
              value={lbs}
              onChange={(e) => handleLbsChange(e.target.value)}
              placeholder="0"
            />
          </div>
          <ArrowLeftRight className="h-4 w-4 text-muted-foreground mt-4 shrink-0" />
          <div className="flex-1">
            <label className="text-xs text-muted-foreground mb-1 block">Kg</label>
            <Input
              type="number"
              inputMode="decimal"
              value={kg}
              onChange={(e) => handleKgChange(e.target.value)}
              placeholder="0"
            />
          </div>
        </div>
        <Button
          className="w-full mt-2"
          disabled={!kg || isNaN(parseFloat(kg))}
          onClick={() => {
            onApplyKg(parseFloat(kg));
            setOpen(false);
            setLbs("");
            setKg("");
          }}
        >
          Usar {kg || "0"} Kg
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default UnitConverter;
