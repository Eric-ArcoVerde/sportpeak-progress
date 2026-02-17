import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, CheckCircle2, Video } from "lucide-react";
import { toast } from "sonner";
import CreatableMovementSelect from "./CreatableMovementSelect";
import UnitConverter from "./UnitConverter";
import MediaUploader from "./MediaUploader";
import ConfettiCelebration from "./ConfettiCelebration";
import { cn } from "@/lib/utils";

type Movement = { id: string; name: string; category: string };

const LogForm = () => {
  const { user } = useAuth();
  const [movement, setMovement] = useState<Movement | null>(null);
  const [weightKg, setWeightKg] = useState("");
  const [reps, setReps] = useState("");
  const [notes, setNotes] = useState("");
  const [isPr, setIsPr] = useState(false);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [executedSuccessfully, setExecutedSuccessfully] = useState(false);

  const category = movement?.category ?? "strength";
  const isSkill = category === "skill";

  const reset = () => {
    setMovement(null);
    setWeightKg("");
    setReps("");
    setNotes("");
    setIsPr(false);
    setMediaUrl(null);
    setExecutedSuccessfully(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movement || !user) {
      toast.error("Selecione um movimento");
      return;
    }

    const skillPrefix = isSkill
      ? executedSuccessfully ? "[Sucesso] " : "[Tentativa] "
      : "";
    const finalNotes = notes ? `${skillPrefix}${notes}` : skillPrefix.trim() || null;

    setSaving(true);
    const { error } = await supabase.from("logs").insert({
      user_id: user.id,
      movement_id: movement.id,
      weight_kg: isSkill ? null : (weightKg ? parseFloat(weightKg) : null),
      reps: isSkill ? null : (reps ? parseInt(reps) : null),
      notes: finalNotes,
      is_pr: isPr,
      media_url: mediaUrl,
    });
    setSaving(false);

    if (error) {
      toast.error("Erro ao salvar registro");
      return;
    }

    if (isPr) {
      setShowCelebration(true);
    } else {
      toast.success("Registro salvo! 💪");
      reset();
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-5">
        <CreatableMovementSelect value={movement} onChange={setMovement} />

        {/* Strength fields */}
        <div
          className={cn(
            "transition-all duration-300 overflow-hidden",
            isSkill ? "max-h-0 opacity-0" : "max-h-40 opacity-100"
          )}
        >
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Carga (Kg)
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="0"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                />
                <UnitConverter onApplyKg={(kg) => setWeightKg(String(kg))} />
              </div>
            </div>
            <div className="w-24">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Reps
              </label>
              <Input
                type="number"
                inputMode="numeric"
                placeholder="0"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Skill fields */}
        <div
          className={cn(
            "transition-all duration-300 overflow-hidden",
            isSkill ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="flex items-center gap-3 glass-card p-4 border-2 border-accent/40">
            <Checkbox
              id="executed"
              checked={executedSuccessfully}
              onCheckedChange={(v) => setExecutedSuccessfully(v === true)}
            />
            <label htmlFor="executed" className="text-sm font-bold cursor-pointer flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-accent" />
              Executado com sucesso?
            </label>
          </div>
        </div>

        {/* Media uploader - highlighted for skill */}
        <div className={cn(isSkill && "ring-2 ring-accent/30 rounded-lg p-1 transition-all duration-300")}>
          {isSkill && (
            <div className="flex items-center gap-1.5 mb-2 px-1">
              <Video className="h-4 w-4 text-accent" />
              <span className="text-xs font-semibold text-accent">Registre em vídeo!</span>
            </div>
          )}
          <MediaUploader value={mediaUrl} onChange={setMediaUrl} />
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Observações (opcional)
          </label>
          <Textarea
            placeholder="Ex: Boa execução, sentindo evolução..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />
        </div>

        <div className="flex items-center gap-3 glass-card p-3">
          <Checkbox
            id="pr"
            checked={isPr}
            onCheckedChange={(v) => setIsPr(v === true)}
          />
          <label htmlFor="pr" className="text-sm font-medium cursor-pointer">
            🏆 É um PR / Primeira vez!
          </label>
        </div>

        <Button type="submit" className="w-full h-12 text-base font-bold" disabled={saving}>
          {saving ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Save className="h-5 w-5 mr-2" />
              Salvar Registro
            </>
          )}
        </Button>
      </form>

      <ConfettiCelebration
        open={showCelebration}
        onClose={() => {
          setShowCelebration(false);
          toast.success("Registro salvo! 💪");
          reset();
        }}
      />
    </>
  );
};

export default LogForm;
