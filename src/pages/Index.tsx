import { useState } from "react";
import { Dumbbell, Zap, Loader2 } from "lucide-react";
import { useLogs, useUserMovements } from "@/hooks/useLogs";
import LogCard from "@/components/dashboard/LogCard";
import MovementFilters from "@/components/dashboard/MovementFilters";

const Index = () => {
  const [filter, setFilter] = useState<string | null>(null);
  const { data: logs, isLoading } = useLogs(filter);
  const { data: movements } = useUserMovements();

  return (
    <div className="px-4 pt-6 safe-bottom">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <div className="relative">
          <Dumbbell className="h-7 w-7 text-primary" />
          <Zap className="h-3 w-3 text-accent absolute -top-1 -right-1" />
        </div>
        <h1 className="text-2xl font-black tracking-tight">
          <span className="gradient-text">Sport</span>
          <span>Peak</span>
        </h1>
      </div>

      {/* Filters */}
      <MovementFilters
        movements={movements ?? []}
        selected={filter}
        onSelect={setFilter}
      />

      {/* Feed */}
      <div className="mt-4 space-y-3 pb-4">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : !logs?.length ? (
          <div className="glass-card p-6 text-center animate-fade-in">
            <h2 className="text-lg font-bold mb-2">
              {filter ? "Nenhum registro para esse movimento" : "Bem-vindo ao SportPeak! 🏆"}
            </h2>
            <p className="text-muted-foreground text-sm">
              {filter
                ? "Tente outro filtro ou registre um novo treino."
                : "Registre seus treinos e acompanhe sua evolução. Use o botão + para começar."}
            </p>
          </div>
        ) : (
          logs.map((log) => <LogCard key={log.id} log={log} />)
        )}
      </div>
    </div>
  );
};

export default Index;
