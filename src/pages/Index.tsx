import { Dumbbell, Zap } from "lucide-react";

const Index = () => {
  return (
    <div className="px-4 pt-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="relative">
          <Dumbbell className="h-7 w-7 text-primary" />
          <Zap className="h-3 w-3 text-accent absolute -top-1 -right-1" />
        </div>
        <h1 className="text-2xl font-black tracking-tight">
          <span className="gradient-text">Sport</span>
          <span>Peak</span>
        </h1>
      </div>

      <div className="glass-card p-6 text-center animate-fade-in">
        <h2 className="text-lg font-bold mb-2">Bem-vindo ao SportPeak! 🏆</h2>
        <p className="text-muted-foreground text-sm">
          Registre seus treinos e acompanhe sua evolução. Use o botão <strong className="text-primary">+</strong> para começar.
        </p>
      </div>
    </div>
  );
};

export default Index;
