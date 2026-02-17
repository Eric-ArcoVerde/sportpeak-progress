import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LogOut, User } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SPORTS = [
  "Cheerleading",
  "Gymnastics",
  "Crossfit",
  "Bodybuilding/Musculação",
  "Calisthenics",
  "Parkour",
  "Outro",
];

const Profile = () => {
  const { user, signOut } = useAuth();
  const [mainSport, setMainSport] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("main_sport")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        setMainSport(data?.main_sport ?? null);
        setLoading(false);
      });
  }, [user]);

  const handleSportChange = async (value: string) => {
    setMainSport(value);
    const { error } = await supabase
      .from("profiles")
      .update({ main_sport: value })
      .eq("id", user!.id);
    if (error) {
      toast.error("Erro ao salvar esporte");
    } else {
      toast.success("Esporte atualizado!");
    }
  };

  return (
    <div className="px-4 pt-6">
      <h1 className="text-2xl font-black mb-6">Perfil</h1>

      <div className="glass-card p-6 animate-fade-in">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
            <User className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <p className="font-bold text-lg">{user?.user_metadata?.username || "Atleta"}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            {mainSport && (
              <Badge variant="secondary" className="mt-1">
                {mainSport}
              </Badge>
            )}
          </div>
        </div>

        <div className="mt-6 mb-6">
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Esporte Principal
          </label>
          <Select value={mainSport ?? ""} onValueChange={handleSportChange} disabled={loading}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione seu esporte" />
            </SelectTrigger>
            <SelectContent>
              {SPORTS.map((sport) => (
                <SelectItem key={sport} value={sport}>
                  {sport}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button variant="outline" className="w-full" onClick={signOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Sair da conta
        </Button>
      </div>
    </div>
  );
};

export default Profile;
