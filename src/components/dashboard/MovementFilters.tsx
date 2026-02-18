import { useState } from "react";
import { Check, ChevronsUpDown, X, Dumbbell, PersonStanding } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Movement = { id: string; name: string; category: string };

type Props = {
  movements: Movement[];
  selected: string | null;
  onSelect: (id: string | null) => void;
};

const MovementFilters = ({ movements, selected, onSelect }: Props) => {
  const [open, setOpen] = useState(false);

  if (movements.length === 0) return null;

  const selectedMovement = movements.find((m) => m.id === selected);

  return (
    <div className="flex gap-2 items-center">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-10 text-sm font-medium"
          >
            {selectedMovement ? (
              <span className="flex items-center gap-2 truncate">
                {selectedMovement.category === "skill" ? (
                  <PersonStanding className="h-4 w-4 shrink-0 text-accent" />
                ) : (
                  <Dumbbell className="h-4 w-4 shrink-0 text-primary" />
                )}
                {selectedMovement.name}
              </span>
            ) : (
              <span className="text-muted-foreground">Filtrar por movimento...</span>
            )}
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-popover border-border z-50" align="start">
          <Command>
            <CommandInput placeholder="Buscar movimento..." />
            <CommandList>
              <CommandEmpty>Nenhum movimento encontrado.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value="__todos__"
                  onSelect={() => {
                    onSelect(null);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      !selected ? "opacity-100" : "opacity-0"
                    )}
                  />
                  Todos
                </CommandItem>
                {movements.map((m) => (
                  <CommandItem
                    key={m.id}
                    value={m.name}
                    onSelect={() => {
                      onSelect(m.id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selected === m.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {m.category === "skill" ? (
                      <PersonStanding className="mr-1.5 h-4 w-4 text-accent" />
                    ) : (
                      <Dumbbell className="mr-1.5 h-4 w-4 text-primary" />
                    )}
                    {m.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selected && (
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 h-10 w-10 text-muted-foreground hover:text-foreground"
          onClick={() => onSelect(null)}
          aria-label="Limpar filtro"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default MovementFilters;
