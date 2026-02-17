import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LogOut, User, Camera, Loader2 } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("main_sport, avatar_url")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        setMainSport(data?.main_sport ?? null);
        setAvatarUrl(data?.avatar_url ?? null);
        setLoading(false);
      });
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem muito grande (máx 5MB)");
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast.error("Erro no upload da foto");
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    const newUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: newUrl })
      .eq("id", user.id);

    if (updateError) {
      toast.error("Erro ao salvar foto");
    } else {
      setAvatarUrl(newUrl);
      toast.success("Foto atualizada!");
    }
    setUploading(false);
  };

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
          <div className="relative">
            <Avatar className="w-16 h-16 rounded-2xl">
              <AvatarImage src={avatarUrl ?? undefined} alt="Avatar" className="object-cover" />
              <AvatarFallback className="rounded-2xl bg-secondary">
                <User className="h-8 w-8 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Camera className="h-3.5 w-3.5" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
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
