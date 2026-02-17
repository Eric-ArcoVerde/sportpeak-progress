import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Dumbbell, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Movement = {
  id: string;
  name: string;
  category: string;
};

type Props = {
  value: Movement | null;
  onChange: (m: Movement) => void;
};

const CreatableMovementSelect = ({ value, onChange }: Props) => {
  const [query, setQuery] = useState("");
  const [movements, setMovements] = useState<Movement[]>([]);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newCategory, setNewCategory] = useState<"strength" | "skill">("strength");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase
      .from("movements")
      .select("id, name, category")
      .order("name")
      .then(({ data }) => setMovements(data ?? []));
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = movements.filter((m) =>
    m.name.toLowerCase().includes(query.toLowerCase())
  );
  const exactMatch = movements.some(
    (m) => m.name.toLowerCase() === query.toLowerCase()
  );

  const handleCreate = async () => {
    if (!query.trim()) return;
    setCreating(true);
    const { data: userData } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("movements")
      .insert({ name: query.trim(), category: newCategory, created_by: userData.user?.id ?? null })
      .select()
      .single();
    setCreating(false);
    if (data && !error) {
      setMovements((prev) => [...prev, data]);
      onChange(data);
      setQuery(data.name);
      setOpen(false);
    }
  };

  return (
    <div ref={ref} className="relative">
      <label className="text-sm font-medium text-muted-foreground mb-2 block">
        Movimento
      </label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar ou criar movimento..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className="pl-9"
        />
      </div>
      {value && !open && (
        <Badge variant="secondary" className="mt-2">
          {value.category === "skill" ? (
            <Sparkles className="h-3 w-3 mr-1" />
          ) : (
            <Dumbbell className="h-3 w-3 mr-1" />
          )}
          {value.name}
        </Badge>
      )}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-popover shadow-lg max-h-60 overflow-y-auto">
          {filtered.map((m) => (
            <button
              key={m.id}
              type="button"
              className={cn(
                "w-full text-left px-3 py-2.5 text-sm flex items-center gap-2 hover:bg-secondary/60 transition-colors",
                value?.id === m.id && "bg-secondary"
              )}
              onClick={() => {
                onChange(m);
                setQuery(m.name);
                setOpen(false);
              }}
            >
              {m.category === "skill" ? (
                <Sparkles className="h-3.5 w-3.5 text-accent shrink-0" />
              ) : (
                <Dumbbell className="h-3.5 w-3.5 text-primary shrink-0" />
              )}
              {m.name}
            </button>
          ))}
          {query.trim() && !exactMatch && (
            <div className="border-t border-border p-3 space-y-2">
              <p className="text-xs text-muted-foreground">
                Criar "<strong>{query.trim()}</strong>"
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={newCategory === "strength" ? "default" : "outline"}
                  onClick={() => setNewCategory("strength")}
                  className="text-xs"
                >
                  <Dumbbell className="h-3 w-3 mr-1" /> Strength
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={newCategory === "skill" ? "default" : "outline"}
                  onClick={() => setNewCategory("skill")}
                  className="text-xs"
                >
                  <Sparkles className="h-3 w-3 mr-1" /> Skill
                </Button>
              </div>
              <Button
                type="button"
                size="sm"
                className="w-full"
                onClick={handleCreate}
                disabled={creating}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                {creating ? "Criando..." : "Criar movimento"}
              </Button>
            </div>
          )}
          {filtered.length === 0 && (exactMatch || !query.trim()) && (
            <p className="text-sm text-muted-foreground p-3 text-center">
              Nenhum resultado
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CreatableMovementSelect;
