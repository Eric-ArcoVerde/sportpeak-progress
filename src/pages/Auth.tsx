import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Dumbbell, Zap } from "lucide-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast({
          title: "Cadastro realizado!",
          description: "Verifique seu email para confirmar a conta.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="relative">
            <Dumbbell className="h-10 w-10 text-primary" />
            <Zap className="h-4 w-4 text-accent absolute -top-1 -right-1" />
          </div>
          <h1 className="text-3xl font-black tracking-tight">
            <span className="gradient-text">Sport</span>
            <span className="text-foreground">Peak</span>
          </h1>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-1 text-center">
            {isLogin ? "Entrar" : "Criar Conta"}
          </h2>
          <p className="text-muted-foreground text-sm text-center mb-6">
            {isLogin ? "Acesse sua evolução" : "Comece a registrar seu progresso"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="seu_nome"
                  required={!isLogin}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full font-semibold" disabled={loading}>
              {loading ? "Carregando..." : isLogin ? "Entrar" : "Cadastrar"}
            </Button>
          </form>

          <button
            onClick={() => setIsLogin(!isLogin)}
            className="w-full text-center text-sm text-muted-foreground mt-4 hover:text-primary transition-colors"
          >
            {isLogin ? "Não tem conta? Cadastre-se" : "Já tem conta? Entrar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
