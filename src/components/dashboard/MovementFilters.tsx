import { Dumbbell, PersonStanding } from "lucide-react";
import { cn } from "@/lib/utils";

type Movement = { id: string; name: string; category: string };

type Props = {
  movements: Movement[];
  selected: string | null;
  onSelect: (id: string | null) => void;
};

const MovementFilters = ({ movements, selected, onSelect }: Props) => {
  if (movements.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4">
      <button
        onClick={() => onSelect(null)}
        className={cn(
          "shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all",
          !selected
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-transparent text-muted-foreground border-border hover:border-primary/50"
        )}
      >
        Todos
      </button>
      {movements.map((m) => (
        <button
          key={m.id}
          onClick={() => onSelect(selected === m.id ? null : m.id)}
          className={cn(
            "shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all",
            selected === m.id
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-transparent text-muted-foreground border-border hover:border-primary/50"
          )}
        >
          {m.category === "skill" ? (
            <PersonStanding className="h-3 w-3" />
          ) : (
            <Dumbbell className="h-3 w-3" />
          )}
          {m.name}
        </button>
      ))}
    </div>
  );
};

export default MovementFilters;
