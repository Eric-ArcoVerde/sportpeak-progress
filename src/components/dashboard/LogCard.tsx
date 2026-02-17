import { Dumbbell, PersonStanding, Trophy, Calendar } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { LogEntry } from "@/hooks/useLogs";
import { cn } from "@/lib/utils";

type Props = { log: LogEntry };

const LogCard = ({ log }: Props) => {
  const isSkill = log.movement.category === "skill";
  const isVideo = log.media_url?.match(/\.(mp4|mov|webm)$/i);
  const hasMedia = !!log.media_url;

  const successTag = log.notes?.startsWith("[Sucesso]");

  return (
    <div className={cn(
      "glass-card overflow-hidden animate-fade-in",
      log.is_pr && "ring-1 ring-[hsl(var(--pr-glow))] glow-accent"
    )}>
      {/* Media or category icon */}
      {hasMedia ? (
        <div className="relative h-36 bg-muted">
          {isVideo ? (
            <video src={log.media_url!} className="w-full h-full object-cover" muted />
          ) : (
            <img src={log.media_url!} alt="" className="w-full h-full object-cover" />
          )}
          {log.is_pr && (
            <div className="absolute top-2 right-2 bg-accent text-accent-foreground text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Trophy className="h-3 w-3" /> PR
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center h-20 bg-muted/30">
          {isSkill ? (
            <PersonStanding className="h-10 w-10 text-accent/50" />
          ) : (
            <Dumbbell className="h-10 w-10 text-primary/50" />
          )}
          {log.is_pr && (
            <div className="absolute top-2 right-2 bg-accent text-accent-foreground text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Trophy className="h-3 w-3" /> PR
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-3 space-y-1.5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold truncate">{log.movement.name}</h3>
          <span className={cn(
            "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
            isSkill ? "bg-accent/20 text-accent" : "bg-primary/20 text-primary"
          )}>
            {isSkill ? "Skill" : "Força"}
          </span>
        </div>

        {/* Stats */}
        {isSkill ? (
          <p className={cn(
            "text-xs font-semibold",
            successTag ? "text-[hsl(var(--success))]" : "text-muted-foreground"
          )}>
            {successTag ? "✅ Executado com sucesso" : "🔄 Tentativa"}
          </p>
        ) : (
          <div className="flex gap-3 text-xs text-muted-foreground">
            {log.weight_kg != null && <span className="font-mono font-semibold text-foreground">{log.weight_kg} kg</span>}
            {log.reps != null && <span className="font-mono">{log.reps} reps</span>}
          </div>
        )}

        {/* Date */}
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {format(parseISO(log.date), "dd MMM yyyy", { locale: ptBR })}
        </div>
      </div>
    </div>
  );
};

export default LogCard;
